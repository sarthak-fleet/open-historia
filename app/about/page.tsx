import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Open Historia",
  description:
    "Open Historia is an AI grand-strategy game where you command civilizations through natural-language orders and an LLM game master adjudicates the consequences.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-200">
      <Link href="/" className="text-xs text-slate-500 hover:text-amber-400">
        ← Open Historia
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-amber-400">
        About
      </h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        Open Historia is an AI grand-strategy history game. You type natural
        language orders to a civilization you command, an LLM game master
        adjudicates the consequences, and a 3-tier LOD world map renders the
        unfolding state.
      </p>

      <h2 className="mt-8 text-base font-semibold text-amber-500">How a turn works</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-300">
        <li>You issue a command (raise an army, broker a marriage alliance, build a port).</li>
        <li>The Game Master AI returns strict JSON: <code className="text-amber-300">message</code>, <code className="text-amber-300">updates[]</code>, <code className="text-amber-300">newEvents[]</code>, <code className="text-amber-300">relationChanges[]</code>, <code className="text-amber-300">updatedStorySoFar</code>.</li>
        <li>Map state and diplomacy threads update; the timeline gets a new entry you can rewind to.</li>
      </ol>

      <h2 className="mt-8 text-base font-semibold text-amber-500">Pluggable AI</h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        Pick a provider on game setup — Anthropic Claude, OpenAI, Google
        Gemini, DeepSeek, or a local OpenAI-compatible endpoint. Your API
        key stays in your session and is sent only to the provider you chose.
      </p>

      <h2 className="mt-8 text-base font-semibold text-amber-500">Saves &amp; alternate timelines</h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        Cloud save when signed in; rewind to any prior turn and branch a new
        timeline from there. Saves serialize only <code className="text-amber-300">provinceOwners</code> so the format
        survives changes to the underlying TopoJSON IDs.
      </p>

      <h2 className="mt-8 text-base font-semibold text-amber-500">What it isn&apos;t</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>A live multiplayer game. (Yet.)</li>
        <li>A simulation with hard combat math underneath — the LLM is the rules engine, with strict-shape JSON as the contract.</li>
        <li>A chat-with-NPC product. The AI is the world referee, not a character.</li>
      </ul>
    </main>
  );
}
