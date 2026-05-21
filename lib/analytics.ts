/**
 * Owner-facing analytics — the fixed 4-event taxonomy.
 *
 * EVERY fleet project emits exactly these four events — `signup`, `activated`,
 * `core_action`, `returned` — so a single PostHog project can build one
 * cross-fleet funnel (signup -> activated -> core_action) and a D1/D7
 * retention insight, with no custom dashboard.
 *
 * Every event carries a `project` property. This is what makes per-app and
 * cross-fleet views possible from one PostHog login.
 *
 * Open Historia's primary flow runs entirely in the browser, so this wrapper
 * is browser-first — it routes through `@saas-maker/posthog-client` (`track`)
 * and no-ops on the server.
 */

import { track } from "@saas-maker/posthog-client";

const PROJECT = "open-historia" as const;

/**
 * The product-specific action behind a `core_action` event.
 * Open Historia exists to let you steer history one turn at a time:
 *  - `turn_advanced`  — the Game Master processed a command and advanced time.
 *  - `game_started`   — a new game session was configured and begun.
 *  - `game_saved`     — the player saved a game (local or cloud).
 */
export type CoreAction = "turn_advanced" | "game_started" | "game_saved";

/**
 * The fixed taxonomy. Do NOT add events here — the whole point is that all
 * fleet projects emit the same four. Product-specific detail goes in
 * `CoreAction` (or as extra properties), never as a new top-level event name.
 */
interface AnalyticsEventMap {
  /** First session after an account is created. */
  signup: { project: typeof PROJECT };
  /** The user reaches first real value — their first processed turn. */
  activated: { project: typeof PROJECT };
  /** The thing the product exists to do. */
  core_action: { project: typeof PROJECT; action: CoreAction };
  /** A return session by a user with prior activity. */
  returned: { project: typeof PROJECT };
}

function emit<K extends keyof AnalyticsEventMap>(
  event: K,
  props: Omit<AnalyticsEventMap[K], "project">,
): void {
  if (typeof window === "undefined") return;
  try {
    track(event, { project: PROJECT, ...props });
  } catch {
    // Analytics must NEVER break a user flow. Swallow and move on.
  }
}

/** Fire once, on the first session after an account is created. */
export function trackSignup(): void {
  emit("signup", {});
}

const ACTIVATED_KEY = "open-historia:activated";

/**
 * Fire once, when the user first reaches real product value — their first
 * turn processed by the Game Master. De-duplicated per browser via
 * localStorage so it stays a true once-per-user milestone.
 */
export function trackActivated(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(ACTIVATED_KEY)) return;
    window.localStorage.setItem(ACTIVATED_KEY, "1");
  } catch {
    // localStorage unavailable (private mode) — fall through and still emit.
  }
  emit("activated", {});
}

/** Fire on each completion of a core product action. */
export function trackCoreAction(action: CoreAction): void {
  emit("core_action", { action });
}

/** Fire on session start for a user who has prior activity. */
export function trackReturned(): void {
  emit("returned", {});
}
