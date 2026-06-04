import type { Metadata } from "next";
import Link from "next/link";
import StoryRoomPrototype from "@/components/StoryRoomPrototype";

export const metadata: Metadata = {
  title: "Story Room Prototype — StoryTunes Fit Test",
  description:
    "Local prototype for voted collaborative canon, branch archive (replay/revive), and fixture AI co-author suggestions. StoryTunes evaluation for Open Historia.",
  robots: { index: false, follow: false },
};

export default function StoryRoomPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200">
      <div className="mx-auto max-w-3xl px-4 pt-6 pb-12">
        {/* Minimal header */}
        <div className="mb-4 flex items-center justify-between text-xs">
          <Link href="/" className="text-amber-400 hover:text-amber-300 underline decoration-dotted">
            ← back to the game
          </Link>
          <div className="text-slate-600">open-historia • story room v0</div>
          <Link href="/about" className="text-slate-400 hover:text-slate-300">
            about
          </Link>
        </div>

        <StoryRoomPrototype />

        {/* After the prototype: direct links to the brief and task context */}
        <div className="mt-8 border-t border-slate-800 pt-6 text-[11px] text-slate-500 max-w-prose">
          <p>
            StoryTunes prototype: submit/vote/canon, multi-round canon, branch archive with replay and revive, and fixture-only AI co-author suggestions — isolated from strategy-game state and saves.
          </p>
          <p className="mt-2">
            Read the full product brief: <span className="text-amber-400">STORY-ROOMS.md</span> (open the file in the repo root).
          </p>
          <p className="mt-1 text-[10px] text-slate-600">
            Placement note and verification recorded in the Symphony task row after the smallest app check (typecheck).
          </p>
        </div>
      </div>
    </div>
  );
}
