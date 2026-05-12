import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { buildGameMasterPrompt } from "@/lib/ai-prompts";
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

const normalizeGeminiModel = (model: string | undefined) => {
  if (!model) return DEFAULT_GEMINI_MODEL;
  const trimmed = model.trim();
  if (!trimmed) return DEFAULT_GEMINI_MODEL;
  return trimmed.startsWith("models/") ? trimmed.slice("models/".length) : trimmed;
};

const normalizeFreeAiModel = (model: string | undefined) => {
  const trimmed = model?.trim();
  return !trimmed || trimmed === "auto" ? DEFAULT_FREE_AI_MODEL : trimmed;
};

const isModelSelectionError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("not found") ||
    message.includes("unsupported") ||
    message.includes("invalid model") ||
    message.includes("404")
  );
};

// ---------------------------------------------------------------------------
// Update types -- expanded to include "relation", "economy", and "crisis"
// ---------------------------------------------------------------------------

type ParsedUpdate =
  | { type: "owner"; provinceName: string; newOwnerId: string }
  | { type: "time"; amount: number }
  | { type: "event"; description: string; eventType: "diplomacy" | "war" | "discovery" | "flavor" | "economy" | "crisis"; year: number }
  | { type: "relation"; nationA: string; nationB: string; relationType: string; reason: string };

const normalizeEventType = (
  eventType: unknown
): "diplomacy" | "war" | "discovery" | "flavor" | "economy" | "crisis" => {
  if (
    eventType === "diplomacy" ||
    eventType === "war" ||
    eventType === "discovery" ||
    eventType === "flavor" ||
    eventType === "economy" ||
    eventType === "crisis"
  ) {
    return eventType;
  }
  return "flavor";
};

const sanitizeAiPayload = (
  payload: unknown,
  fallbackYear: number
): { message: string; updates: ParsedUpdate[]; storySoFar?: string } => {
  const safePayload = (payload && typeof payload === "object" ? payload : {}) as {
    message?: unknown;
    updates?: unknown;
    storySoFar?: unknown;
  };

  const message =
    typeof safePayload.message === "string" && safePayload.message.trim()
      ? safePayload.message.trim()
      : "The world watches your move. Issue your next command.";

  const updates: ParsedUpdate[] = [];
  if (Array.isArray(safePayload.updates)) {
    safePayload.updates.forEach((update) => {
      if (!update || typeof update !== "object") return;
      const u = update as Record<string, unknown>;

      if (u.type === "owner" && typeof u.provinceName === "string" && typeof u.newOwnerId === "string") {
        updates.push({
          type: "owner",
          provinceName: u.provinceName.trim(),
          newOwnerId: u.newOwnerId.trim(),
        });
      }

      if (u.type === "time") {
        const rawAmount = typeof u.amount === "number" ? u.amount : Number(u.amount);
        if (Number.isFinite(rawAmount)) {
          updates.push({
            type: "time",
            amount: Math.trunc(rawAmount),
          });
        }
      }

      if (u.type === "event" && typeof u.description === "string") {
        const rawYear = typeof u.year === "number" ? u.year : Number(u.year);
        updates.push({
          type: "event",
          description: u.description.trim(),
          eventType: normalizeEventType(u.eventType),
          year: Number.isFinite(rawYear) ? Math.trunc(rawYear) : fallbackYear,
        });
      }

      if (
        u.type === "relation" &&
        typeof u.nationA === "string" &&
        typeof u.nationB === "string" &&
        typeof u.relationType === "string"
      ) {
        updates.push({
          type: "relation",
          nationA: u.nationA.trim(),
          nationB: u.nationB.trim(),
          relationType: u.relationType.trim(),
          reason: typeof u.reason === "string" ? u.reason.trim() : "",
        });
      }
    });
  }

  const storySoFar = typeof safePayload.storySoFar === "string" && safePayload.storySoFar.trim()
    ? safePayload.storySoFar.trim()
    : undefined;

  return { message, updates, storySoFar };
};

// ---------------------------------------------------------------------------
// POST /api/turn
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { allowed, retryAfterMs } = rateLimit(`turn:${ip}`, { maxRequests: 20, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const { command, gameState, config, history, events, relations, provinceSummary, storySoFar, promptOverrides } = await req.json();

    if (typeof command !== "string" || command.trim().length === 0) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }
    if (command.length > 2000) {
      return NextResponse.json(
        { error: "Command is too long (max 2000 characters)" },
        { status: 400 },
      );
    }
    if (!config || typeof config.provider !== "string") {
      return NextResponse.json({ error: "Provider config is required" }, { status: 400 });
    }

    if (config.provider !== "local" && config.provider !== "free-ai" && !config.apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 400 });
    }

    const systemPrompt = buildGameMasterPrompt({
      command,
      gameState,
      config,
      history,
      events,
      relations,
      provinceSummary,
      storySoFar,
      promptOverrides,
    });

    let responseText = "";

    switch (config.provider) {
      case "local": {
        responseText = await withTimeout(
          callLocalAI({
            provider: config.model || "claude",
            prompt: systemPrompt,
            systemPrompt: "You are a JSON-only response bot for a grand strategy game. Never explain your answer, only return valid JSON.",
          }),
          "local",
        );
        break;
      }
      case "google": {
        const genAI = new GoogleGenerativeAI(config.apiKey);
        const preferredModel = normalizeGeminiModel(config.model);

        const requestGemini = async (modelName: string) => {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" },
          });
          const result = await withTimeout(model.generateContent(systemPrompt), "google");
          return result.response.text();
        };

        const modelCandidates = Array.from(
          new Set([preferredModel, ...FALLBACK_GEMINI_MODELS])
        );

        let lastModelError: unknown = null;
        for (const modelName of modelCandidates) {
          try {
            responseText = await requestGemini(modelName);
            lastModelError = null;
            break;
          } catch (error) {
            if (!isModelSelectionError(error)) throw error;
            lastModelError = error;
          }
        }

        if (!responseText && lastModelError) {
          throw lastModelError;
        }
        break;
      }
      case "free-ai": {
        const gateway = new OpenAI({
          apiKey: config.apiKey || process.env.AI_GATEWAY_API_KEY || process.env.FREE_AI_API_KEY || "x",
          baseURL: process.env.FREE_AI_GATEWAY_URL || "https://free-ai-gateway.sarthakagrawal927.workers.dev/v1",
          defaultHeaders: { "x-gateway-project-id": "open-historia" },
        });
        const freeAiCompletion = await withTimeout(
          gateway.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: normalizeFreeAiModel(config.model),
          }),
          "free-ai",
        );
        responseText = freeAiCompletion.choices[0].message.content || "{}";
        break;
      }
      case "deepseek": {
        const deepseek = new OpenAI({
          apiKey: config.apiKey,
          baseURL: "https://api.deepseek.com",
        });
        const completion = await withTimeout(
          deepseek.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: config.model,
          }),
          "deepseek",
        );
        responseText = completion.choices[0].message.content || "{}";
        break;
      }
      case "openai": {
        const openai = new OpenAI({ apiKey: config.apiKey });
        const isOSeries = config.model.startsWith("o");
        const completion = await withTimeout(
          openai.chat.completions.create({
            messages: [{ role: isOSeries ? "user" : "system", content: systemPrompt }],
            model: config.model,
            response_format:
              config.model.includes("gpt-4o") || config.model.includes("o3")
                ? { type: "json_object" }
                : undefined,
          }),
          "openai",
        );
        responseText = completion.choices[0].message.content || "{}";
        break;
      }
      case "anthropic": {
        const anthropic = new Anthropic({ apiKey: config.apiKey });
        const message = await withTimeout(
          anthropic.messages.create({
            model: config.model,
            max_tokens: 2048,
            system:
              "You are a JSON-only response bot for a grand strategy game. Never explain your answer, only return valid JSON.",
            messages: [{ role: "user", content: systemPrompt }],
          }),
          "anthropic",
        );
        if (message.content[0].type === "text") {
          responseText = message.content[0].text;
        }
        break;
      }
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }

    // Robust JSON cleaning
    const cleanJson =
      responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .match(/(\{[\s\S]*\})/)?.[1] || responseText.trim();

    const parsed = JSON.parse(cleanJson);
    const sanitized = sanitizeAiPayload(parsed, gameState.turn);
    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("AI Error:", error);
    const status = error instanceof LLMTimeoutError ? 504 : 500;
    return NextResponse.json(
      {
        message: `The Game Master encountered an error: ${error instanceof Error ? error.message : "Internal Server Error"}`,
        updates: [],
      },
      { status }
    );
  }
}
