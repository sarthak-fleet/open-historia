import { describe, expect, it } from "vitest";

import {
  extractJsonCandidate,
  normalizeEventType,
  parseAiTurnResponse,
  sanitizeAiPayload,
} from "../turn-parser";

// ---------------------------------------------------------------------------
// These tests guard the trust boundary between the LLM and game state.
// The single most important invariant: malformed or structurally-invalid AI
// output must NEVER throw and must NEVER produce a state mutation
// (`updates` must be `[]`). A corrupt turn must be a no-op, not a crash.
// ---------------------------------------------------------------------------

const FALLBACK_YEAR = 1500;

describe("normalizeEventType", () => {
  it("passes through every valid event type", () => {
    for (const t of [
      "diplomacy",
      "war",
      "discovery",
      "flavor",
      "economy",
      "crisis",
    ]) {
      expect(normalizeEventType(t)).toBe(t);
    }
  });

  it("falls back to flavor for unknown / invalid types", () => {
    expect(normalizeEventType("nonsense")).toBe("flavor");
    expect(normalizeEventType("War")).toBe("flavor"); // case-sensitive
    expect(normalizeEventType(undefined)).toBe("flavor");
    expect(normalizeEventType(null)).toBe("flavor");
    expect(normalizeEventType(42)).toBe("flavor");
    expect(normalizeEventType({})).toBe("flavor");
  });
});

describe("extractJsonCandidate", () => {
  it("returns plain JSON unchanged", () => {
    expect(extractJsonCandidate('{"message":"hi"}')).toBe('{"message":"hi"}');
  });

  it("strips ```json fences", () => {
    const raw = '```json\n{"message":"hi"}\n```';
    expect(extractJsonCandidate(raw)).toBe('{"message":"hi"}');
  });

  it("strips bare ``` fences", () => {
    const raw = '```\n{"message":"hi"}\n```';
    expect(extractJsonCandidate(raw)).toBe('{"message":"hi"}');
  });

  it("extracts JSON when the model adds prose around it", () => {
    const raw = 'Sure, here is the turn:\n{"message":"hi"}\nHope that helps!';
    expect(extractJsonCandidate(raw)).toBe('{"message":"hi"}');
  });

  it("keeps nested objects intact with the greedy match", () => {
    const raw = 'prefix {"a":{"b":1},"c":2} suffix';
    expect(extractJsonCandidate(raw)).toBe('{"a":{"b":1},"c":2}');
  });

  it("returns null for non-string input", () => {
    expect(extractJsonCandidate(undefined)).toBeNull();
    expect(extractJsonCandidate(null)).toBeNull();
    expect(extractJsonCandidate(123)).toBeNull();
    expect(extractJsonCandidate({})).toBeNull();
  });

  it("returns trimmed text when there is no brace candidate", () => {
    expect(extractJsonCandidate("  just prose  ")).toBe("just prose");
  });

  it("returns null for empty / whitespace-only input", () => {
    expect(extractJsonCandidate("")).toBeNull();
    expect(extractJsonCandidate("   ")).toBeNull();
  });
});

describe("sanitizeAiPayload — happy path", () => {
  it("keeps a well-formed payload with mixed updates", () => {
    const result = sanitizeAiPayload(
      {
        message: "  The empire expands.  ",
        storySoFar: "  A long tale  ",
        updates: [
          { type: "owner", provinceName: " Gaul ", newOwnerId: " player " },
          { type: "time", amount: 5 },
          {
            type: "event",
            description: " A great discovery ",
            eventType: "discovery",
            year: 1492,
          },
          {
            type: "relation",
            nationA: " Rome ",
            nationB: " Carthage ",
            relationType: " war ",
            reason: " border dispute ",
          },
        ],
      },
      FALLBACK_YEAR,
    );

    expect(result.message).toBe("The empire expands.");
    expect(result.storySoFar).toBe("A long tale");
    expect(result.updates).toEqual([
      { type: "owner", provinceName: "Gaul", newOwnerId: "player" },
      { type: "time", amount: 5 },
      {
        type: "event",
        description: "A great discovery",
        eventType: "discovery",
        year: 1492,
      },
      {
        type: "relation",
        nationA: "Rome",
        nationB: "Carthage",
        relationType: "war",
        reason: "border dispute",
      },
    ]);
  });
});

describe("sanitizeAiPayload — invalid output must not corrupt state", () => {
  it("returns a safe default for non-object payloads", () => {
    for (const bad of [null, undefined, "a string", 42, true]) {
      const result = sanitizeAiPayload(bad, FALLBACK_YEAR);
      expect(result.updates).toEqual([]);
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.storySoFar).toBeUndefined();
    }
  });

  it("treats a top-level array payload as empty (no updates)", () => {
    const result = sanitizeAiPayload([{ type: "owner" }], FALLBACK_YEAR);
    expect(result.updates).toEqual([]);
  });

  it("drops updates when `updates` is not an array", () => {
    const result = sanitizeAiPayload(
      { message: "hi", updates: "not-an-array" },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([]);
  });

  it("skips owner updates missing required fields", () => {
    const result = sanitizeAiPayload(
      {
        updates: [
          { type: "owner", provinceName: "Gaul" }, // no newOwnerId
          { type: "owner", newOwnerId: "player" }, // no provinceName
          { type: "owner", provinceName: "", newOwnerId: "player" }, // empty
          { type: "owner", provinceName: "Gaul", newOwnerId: 5 }, // wrong type
        ],
      },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([]);
  });

  it("skips time updates whose amount is not finite", () => {
    const result = sanitizeAiPayload(
      {
        updates: [
          { type: "time", amount: "abc" },
          { type: "time", amount: NaN },
          { type: "time", amount: Infinity },
          { type: "time" },
        ],
      },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([]);
  });

  it("coerces numeric-string time amounts and truncates", () => {
    const result = sanitizeAiPayload(
      { updates: [{ type: "time", amount: "7.9" }] },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([{ type: "time", amount: 7 }]);
  });

  it("uses the fallback year when an event year is missing or invalid", () => {
    const result = sanitizeAiPayload(
      {
        updates: [
          { type: "event", description: "no year" },
          { type: "event", description: "bad year", year: "not-a-year" },
        ],
      },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([
      {
        type: "event",
        description: "no year",
        eventType: "flavor",
        year: FALLBACK_YEAR,
      },
      {
        type: "event",
        description: "bad year",
        eventType: "flavor",
        year: FALLBACK_YEAR,
      },
    ]);
  });

  it("skips event updates without a usable description", () => {
    const result = sanitizeAiPayload(
      {
        updates: [
          { type: "event", eventType: "war" }, // no description
          { type: "event", description: "   ", eventType: "war" }, // blank
          { type: "event", description: 123 }, // wrong type
        ],
      },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([]);
  });

  it("skips relation updates missing required fields", () => {
    const result = sanitizeAiPayload(
      {
        updates: [
          { type: "relation", nationA: "Rome", nationB: "Gaul" }, // no relationType
          { type: "relation", nationA: "Rome", relationType: "war" }, // no nationB
          {
            type: "relation",
            nationA: "",
            nationB: "Gaul",
            relationType: "war",
          },
        ],
      },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([]);
  });

  it("ignores unknown update types entirely", () => {
    const result = sanitizeAiPayload(
      {
        updates: [
          { type: "nuke", provinceName: "Gaul" },
          { type: "owner", provinceName: "Gaul", newOwnerId: "player" },
        ],
      },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([
      { type: "owner", provinceName: "Gaul", newOwnerId: "player" },
    ]);
  });

  it("skips non-object entries inside the updates array", () => {
    const result = sanitizeAiPayload(
      {
        updates: [
          null,
          "string",
          42,
          [],
          { type: "owner", provinceName: "Gaul", newOwnerId: "player" },
        ],
      },
      FALLBACK_YEAR,
    );
    expect(result.updates).toEqual([
      { type: "owner", provinceName: "Gaul", newOwnerId: "player" },
    ]);
  });

  it("drops a blank message and substitutes a safe default", () => {
    const result = sanitizeAiPayload({ message: "   " }, FALLBACK_YEAR);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("handles a non-finite fallback year without producing NaN", () => {
    const result = sanitizeAiPayload(
      { updates: [{ type: "event", description: "ev" }] },
      NaN,
    );
    expect(result.updates[0]).toMatchObject({ type: "event", year: 0 });
  });
});

describe("parseAiTurnResponse — malformed AI output is a safe no-op", () => {
  it("flags truncated JSON as a parse error with zero updates", () => {
    const result = parseAiTurnResponse(
      '{"message":"war begins","updates":[{"type":"owner"',
      FALLBACK_YEAR,
    );
    expect(result.parseError).toBe(true);
    expect(result.updates).toEqual([]);
    expect(result.message.length).toBeGreaterThan(0);
  });

  it("flags pure prose (no JSON) as a parse error", () => {
    const result = parseAiTurnResponse(
      "I'm sorry, I cannot complete that request.",
      FALLBACK_YEAR,
    );
    expect(result.parseError).toBe(true);
    expect(result.updates).toEqual([]);
  });

  it("flags an empty response as a parse error", () => {
    const result = parseAiTurnResponse("", FALLBACK_YEAR);
    expect(result.parseError).toBe(true);
    expect(result.updates).toEqual([]);
  });

  it("flags a non-string response (null/undefined) as a parse error", () => {
    for (const bad of [null, undefined, {}, 123]) {
      const result = parseAiTurnResponse(bad, FALLBACK_YEAR);
      expect(result.parseError).toBe(true);
      expect(result.updates).toEqual([]);
    }
  });

  it("flags JSON with single quotes (not valid JSON) as a parse error", () => {
    const result = parseAiTurnResponse(
      "{'message':'oops'}",
      FALLBACK_YEAR,
    );
    expect(result.parseError).toBe(true);
    expect(result.updates).toEqual([]);
  });

  it("parses valid JSON wrapped in a fenced code block", () => {
    const result = parseAiTurnResponse(
      '```json\n{"message":"The siege holds.","updates":[{"type":"time","amount":1}]}\n```',
      FALLBACK_YEAR,
    );
    expect(result.parseError).toBe(false);
    expect(result.message).toBe("The siege holds.");
    expect(result.updates).toEqual([{ type: "time", amount: 1 }]);
  });

  it("parses valid JSON with surrounding prose", () => {
    const result = parseAiTurnResponse(
      'Here you go: {"message":"Onward.","updates":[]} — good luck!',
      FALLBACK_YEAR,
    );
    expect(result.parseError).toBe(false);
    expect(result.message).toBe("Onward.");
    expect(result.updates).toEqual([]);
  });

  it("does NOT flag valid JSON of the wrong shape, but drops bad updates", () => {
    // Valid JSON, structurally wrong — parseError is false (it parsed) but the
    // garbage updates are all dropped, so game state stays intact.
    const result = parseAiTurnResponse(
      '{"message":42,"updates":[{"type":"owner","provinceName":null}]}',
      FALLBACK_YEAR,
    );
    expect(result.parseError).toBe(false);
    expect(result.updates).toEqual([]);
    expect(result.message.length).toBeGreaterThan(0); // safe default
  });

  it("treats a JSON array response as having no updates", () => {
    // `[1,2,3]` is valid JSON but the wrong shape — it parses cleanly, so
    // `parseError` is false, yet the array is coerced to an empty payload so
    // no updates ever reach game state.
    const result = parseAiTurnResponse("[1,2,3]", FALLBACK_YEAR);
    expect(result.parseError).toBe(false);
    expect(result.updates).toEqual([]);
  });

  it("never throws on a wide range of hostile inputs", () => {
    const hostile: unknown[] = [
      undefined,
      null,
      "",
      "{",
      "}",
      "{}{}",
      '{"updates":',
      "```json```",
      '{"updates":[{},{},{}]}',
      " ",
      "{".repeat(1000),
      JSON.stringify({ updates: Array(500).fill({ type: "bogus" }) }),
    ];
    for (const input of hostile) {
      expect(() => parseAiTurnResponse(input, FALLBACK_YEAR)).not.toThrow();
      const result = parseAiTurnResponse(input, FALLBACK_YEAR);
      expect(Array.isArray(result.updates)).toBe(true);
    }
  });
});
