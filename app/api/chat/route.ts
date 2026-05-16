import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { buildDiplomacyPrompt } from "@/lib/ai-prompts";
import { LLMTimeoutError, withTimeout } from "@/lib/llm-timeout";
import { callLocalAI } from "@/lib/local-ai";
import { getClientIp,rateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------

const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";
const DEFAULT_FREE_AI_MODEL = "openrouter-openai-gpt-oss-20b-free";
const FALLBACK_GEMINI_MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-flash-latest",
];

const normalizeGeminiModel = (model: string | undefined): string => {
  if (!model) return DEFAULT_GEMINI_MODEL;
  const trimmed = model.trim();
  if (!trimmed) return DEFAULT_GEMINI_MODEL;
  return trimmed.startsWith("models/") ? trimmed.slice("models/".length) : trimmed;
};

const normalizeFreeAiModel = (model: string | undefined): string => {
  const trimmed = model?.trim();
  return !trimmed || trimmed === "auto" ? DEFAULT_FREE_AI_MODEL : trimmed;
};

const isModelSelectionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("not found") ||
    message.includes("unsupported") ||
    message.includes("invalid model") ||
    message.includes("404")
  );
};

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

type DiplomacyTone = "friendly" | "neutral" | "hostile" | "threatening";

interface DiplomacyResponse {
  message: string;
  tone: DiplomacyTone;
  relationChange: { newType: string; reason: string } | null;
}

const VALID_TONES: DiplomacyTone[] = ["friendly", "neutral", "hostile", "threatening"];

const sanitizeDiplomacyResponse = (raw: unknown): DiplomacyResponse => {
  const payload = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const message =
    typeof payload.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : "... *The envoy delivers an unintelligible response.*";

  const tone: DiplomacyTone =
    typeof payload.tone === "string" && VALID_TONES.includes(payload.tone as DiplomacyTone)
      ? (payload.tone as DiplomacyTone)
      : "neutral";

  let relationChange: DiplomacyResponse["relationChange"] = null;
  if (payload.relationChange && typeof payload.relationChange === "object") {
    const rc = payload.relationChange as Record<string, unknown>;
    if (typeof rc.newType === "string" && typeof rc.reason === "string") {
      relationChange = {
        newType: rc.newType.trim(),
        reason: rc.reason.trim(),
      };
    }
  }

  return { message, tone, relationChange };
};

const extractJson = (text: string): string => {
  return (
    text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .match(/(\{[\s\S]*\})/)?.[1] || text.trim()
  );
};

// Only keys consumed by buildDiplomacyPrompt are accepted; everything else is dropped.
const DIPLOMACY_OVERRIDE_KEYS = ["diplomacyInstructions"] as const;
const MAX_OVERRIDE_LENGTH = 4000;

const sanitizePromptOverrides = (raw: unknown): Record<string, string> | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const source = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of DIPLOMACY_OVERRIDE_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0 && value.length <= MAX_OVERRIDE_LENGTH) {
      out[key] = value;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
};

// ---------------------------------------------------------------------------
// AI provider dispatch
// ---------------------------------------------------------------------------

async function callProvider(
  prompt: string,
  config: { provider: string; apiKey: string; model: string }
): Promise<string> {
  switch (config.provider) {
    case "local": {
      return callLocalAI({
        provider: config.model || "claude",
        prompt,
        systemPrompt: "You are a JSON-only response bot for a grand strategy game's diplomacy system. Never explain your answer, only return valid JSON.",
      });
    }
    case "google": {
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const preferredModel = normalizeGeminiModel(config.model);

      const requestGemini = async (modelName: string): Promise<string> => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      };

      const modelCandidates = Array.from(
        new Set([preferredModel, ...FALLBACK_GEMINI_MODELS])
      );

      let lastModelError: unknown = null;
      for (const modelName of modelCandidates) {
        try {
          const text = await requestGemini(modelName);
          return text;
        } catch (error) {
          if (!isModelSelectionError(error)) throw error;
          lastModelError = error;
        }
      }

      if (lastModelError) throw lastModelError;
      return "{}";
    }

    case "free-ai": {
      const gateway = new OpenAI({
        apiKey: config.apiKey || process.env.AI_GATEWAY_API_KEY || process.env.FREE_AI_API_KEY || "x",
        baseURL: process.env.FREE_AI_GATEWAY_URL || "https://free-ai-gateway.sarthakagrawal927.workers.dev/v1",
        defaultHeaders: { "x-gateway-project-id": "open-historia" },
      });
      const freeAiCompletion = await gateway.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: normalizeFreeAiModel(config.model),
      });
      return freeAiCompletion.choices[0].message.content || "{}";
    }

    case "deepseek": {
      const deepseek = new OpenAI({
        apiKey: config.apiKey,
        baseURL: "https://api.deepseek.com",
      });
      const completion = await deepseek.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: config.model,
      });
      return completion.choices[0].message.content || "{}";
    }

    case "openai": {
      const openai = new OpenAI({ apiKey: config.apiKey });
      const isOSeries = config.model.startsWith("o");
      const completion = await openai.chat.completions.create({
        messages: [{ role: isOSeries ? "user" : "system", content: prompt }],
        model: config.model,
        response_format:
          config.model.includes("gpt-4o") || config.model.includes("o3")
            ? { type: "json_object" }
            : undefined,
      });
      return completion.choices[0].message.content || "{}";
    }

    case "anthropic": {
      const anthropic = new Anthropic({ apiKey: config.apiKey });
      const msg = await anthropic.messages.create({
        model: config.model,
        max_tokens: 1024,
        system:
          "You are a JSON-only response bot for a grand strategy game's diplomacy system. Never explain your answer, only return valid JSON.",
        messages: [{ role: "user", content: prompt }],
      });
      if (msg.content[0].type === "text") {
        return msg.content[0].text;
      }
      return "{}";
    }

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// ---------------------------------------------------------------------------
// POST /api/chat
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { allowed, retryAfterMs } = rateLimit(`chat:${ip}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await req.json();

    const {
      message,
      playerNation,
      targetNation,
      chatHistory,
      gameContext,
      relations,
      recentEvents,
      config,
      promptOverrides: rawPromptOverrides,
    } = body as {
      message: string;
      playerNation: string;
      targetNation: string;
      chatHistory: Array<{ sender: string; content: string; turnYear: number }>;
      gameContext: { year: number; scenario: string; difficulty: string };
      relations?: { type: string; treaties: string[] } | null;
      recentEvents?: Array<{ year: number; description: string }>;
      config: { provider: string; apiKey: string; model: string };
      promptOverrides?: unknown;
    };

    const promptOverrides = sanitizePromptOverrides(rawPromptOverrides);

    // --- Validation ---
    if (config?.provider !== "local" && config?.provider !== "free-ai" && !config?.apiKey) {
      return NextResponse.json(
        { error: "API Key missing" },
        { status: 400 }
      );
    }
    if (!message || !playerNation || !targetNation) {
      return NextResponse.json(
        { error: "Missing required fields: message, playerNation, targetNation" },
        { status: 400 }
      );
    }
    if (typeof message !== "string" || message.length > 2000) {
      return NextResponse.json(
        { error: "Message must be a string under 2000 characters" },
        { status: 400 }
      );
    }

    // --- Build prompt ---
    const prompt = buildDiplomacyPrompt({
      playerNation,
      targetNation,
      message,
      chatHistory: chatHistory || [],
      gameContext: gameContext || { year: 2026, scenario: "", difficulty: "Realistic" },
      relations: relations || null,
      recentEvents: recentEvents || [],
      promptOverrides,
    });

    // --- Call AI ---
    const responseText = await withTimeout(callProvider(prompt, config), config.provider);

    // --- Parse & sanitize ---
    const cleanJson = extractJson(responseText);
    const parsed = JSON.parse(cleanJson);
    const sanitized = sanitizeDiplomacyResponse(parsed);

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Diplomacy Chat Error:", error);

    const status = error instanceof LLMTimeoutError ? 504 : 500;
    return NextResponse.json(
      {
        message:
          "The diplomatic envoy was unable to deliver the message. A courier returns with troubling news of communication failure.",
        tone: "neutral" as DiplomacyTone,
        relationChange: null,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status }
    );
  }
}
