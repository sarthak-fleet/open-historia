"use client";

import React, { useEffect, useState } from "react";

// ============================================================================
// Story Room Prototype — v0 (StoryTunes fit test)
// Isolated, local-only, no core game imports, no saves, no network.
// One repeatable round of submit / vote / canon with apocrypha preservation.
// Playful ritual, deliberately not a document editor.
// ============================================================================

type Phase = "lobby" | "submit" | "vote" | "canon";

type Submission = {
  id: string;
  author: string;
  text: string;
  votes: number;
  isAI?: boolean;
};

type Prompt = {
  id: string;
  title: string;
  short: string;
  seed: string;
  bank: string[];
  aiBank: string[];
};

const PROMPTS: Prompt[] = [
  {
    id: "alexandria",
    title: "CANON FORGE // The Library",
    short: "Alexandria, 48 BC — the night the flames were stopped",
    seed: "Flames licked the Great Library's shelves. Smoke curled around the scrolls of Euclid and Aristotle. Then a shout from the docks, a thrown cloak, a stranger who should not have been there.",
    bank: [
      "A dockworker from Tyre had been paid in gold by a scholar who feared the end of memory. He smothered the nearest brazier with his own body.",
      "The fire was no accident. A rival library in Pergamum had sent agents — but one of them switched sides at the last moment and sounded the alarm.",
      "Cleopatra herself arrived with a cohort of guards and a single order: 'Save the books or do not return.' The soldiers formed a human chain to the harbor.",
      "An earthquake the night before had opened a cistern beneath the stacks. The flood that followed the fire saved more than it destroyed.",
      "A young poet who would one day be called Virgil was visiting. He recited verses so moving that the mob paused — and in the pause the fire was contained.",
    ],
    aiBank: [
      "The fire never reached the inner stacks because the librarians had already moved the most dangerous texts to a hidden temple of Serapis weeks earlier — for entirely different reasons.",
      "A Roman centurion who secretly loved Greek philosophy ordered his men to 'secure the building' and then quietly directed the flames toward the empty wing.",
    ],
  },
  {
    id: "ides",
    title: "CANON FORGE // The Ides",
    short: "Rome, 44 BC — what if the dagger missed?",
    seed: "The senators smiled. The statue of Pompey watched. Brutus raised the knife. In that instant the entire future of the Republic balanced on the edge of bronze.",
    bank: [
      "Caesar turned at the last second — not from warning, but because a messenger from Gaul had just arrived with news of a new victory. The blade caught only his cloak.",
      "The conspirators had one among them who lost his nerve and shouted 'Beware the Ides!' a heartbeat too late for silence, too early for the blow.",
      "A gladiator in the crowd — bought by no one — saw the glint and tackled Brutus. The senators fled. Caesar lived, and the Republic died anyway, just more slowly.",
      "Caesar had already named his heir in a sealed will hidden in the temple of Vesta. The attack only made the succession public and inevitable.",
      "The knife struck true, but Caesar's last words were not 'Et tu' — they were a coded order to his loyalists outside. Civil war began before his body cooled.",
    ],
    aiBank: [
      "History's most famous assassination failed because the 'dictator' was already planning to abdicate that afternoon and sail for Egypt with Cleopatra. The senators killed a man who was already leaving.",
      "Brutus's mother had warned him in a dream the night before. He arrived late, the circle was broken, and the moment passed into awkward silence instead of blood.",
    ],
  },
  {
    id: "columbus",
    title: "CANON FORGE // The Horizon",
    short: "1492 — Columbus turns back, or finds something else",
    seed: "Three ships, a horizon that would not end, crews on the edge of mutiny. The admiral promised India. The men only wanted to see land before they threw him overboard.",
    bank: [
      "On the 33rd day they sighted not the Indies but a chain of islands inhabited by people who already knew the shape of the world — because they had crossed from the other direction centuries earlier.",
      "A storm turned them north. They made landfall in a cold green place where the trees grew taller than any cathedral and the natives traded furs for beads that looked exactly like ones from Venice.",
      "They turned back. The story of the 'western ocean that has no end' became a cautionary tale told in every port for two generations.",
      "One ship was lost in fog. When the other two returned, their logs described mermaids, floating cities of ice, and a current that pulled ships toward a sun that never set.",
      "They found land — but the land already had horses, steel, and writing. The meeting was polite, brief, and ended with the Europeans being told never to return.",
    ],
    aiBank: [
      "The crews mutinied on the 30th day and sailed south instead. They discovered a continent so vast that even the idea of 'India' became a joke told by cartographers.",
      "Columbus's secret Jewish and converso financiers had instructed him to find a new refuge, not a trade route. The 'Indies' he sought were always meant to be a sanctuary.",
    ],
  },
  {
    id: "berlin",
    title: "CANON FORGE // The Wall",
    short: "Berlin, 9 November 1989 — what if the guards fired?",
    seed: "The checkpoints were overwhelmed. The crowds chanted. A confused border guard radioed for orders that never came clearly. The world held its breath.",
    bank: [
      "A single nervous shot rang out. The crowd surged anyway. By morning the wall was rubble and twenty-three people were dead — martyrs who made the end of the Cold War irreversible.",
      "The order came down: 'Hold the line.' The guards obeyed for six hours. Then their own families appeared on the other side and the line dissolved without a single further order.",
      "The wall never fell that night. Instead, a new checkpoint regime lasted another three years — long enough for the Soviet Union to collapse from within first.",
      "Western journalists who had been tipped off broadcast the confusion live. The images of unarmed civilians simply walking through made any violent response politically impossible.",
      "One guard, later known only as 'the man in tower three,' laid down his rifle, opened the gate, and walked into the West with the first wave. No one stopped him.",
    ],
    aiBank: [
      "The 'fall' was a managed illusion. The East German leadership had already decided the wall was too expensive to maintain. The crowds were the excuse they needed to save face while opening the gates.",
      "A low-level KGB officer on the scene recognized the moment and countermanded the local order to fire. His name was never recorded. The 20th century changed because of one mid-level bureaucrat's cold calculation.",
    ],
  },
];

const PARTICIPANTS = {
  you: "You (TimeWeaver)",
  scribe1: "Cassandra of the Fork",
  scribe2: "The Byzantine What-If",
};

const AI_AUTHOR = "Grok • Speculative Engine";

const MAX_CHARS = 220;

function createId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function getVerdict(winnerVotes: number, totalVotes: number, numSubs: number): string {
  if (numSubs <= 1) return "The only telling. The scribes were of one mind.";
  const margin = winnerVotes - (totalVotes - winnerVotes);
  const share = winnerVotes / Math.max(1, totalVotes);
  if (share >= 0.8) return "The hall roared as one. The canon was never in doubt.";
  if (share >= 0.6) return "A clear voice carried the night. The scribes nodded.";
  if (margin > 0) return "Narrowly carried. The hall was split but the winner emerged.";
  return "A whisper of consensus. History is sometimes decided by the smallest margin.";
}

function pickUnused(bank: string[], used: string[]): string {
  const available = bank.filter((t) => !used.includes(t));
  if (available.length === 0) return bank[Math.floor(Math.random() * bank.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export default function StoryRoomPrototype() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [promptId, setPromptId] = useState<string>(PROMPTS[0].id);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userInput, setUserInput] = useState("");
  const [userVoteId, setUserVoteId] = useState<string | null>(null);
  const [runningCanon, setRunningCanon] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [lastCanonized, setLastCanonized] = useState<Submission | null>(null);
  const [lastApocrypha, setLastApocrypha] = useState<Submission[]>([]);
  const [lastVerdict, setLastVerdict] = useState("");
  const [timer, setTimer] = useState(45);
  const [timerActive, setTimerActive] = useState(false);

  const currentPrompt = PROMPTS.find((p) => p.id === promptId)!;
  const totalVotes = submissions.reduce((sum, s) => sum + s.votes, 0);

  // Visual timer (demo only — phase advance is manual)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && (phase === "submit" || phase === "vote") && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, phase, timer]);

  function resetTimer(start = 45) {
    setTimer(start);
    setTimerActive(true);
  }

  function stopTimer() {
    setTimerActive(false);
  }

  function enterRoom() {
    setPhase("submit");
    setSubmissions([]);
    setUserInput("");
    setUserVoteId(null);
    setLastCanonized(null);
    setLastApocrypha([]);
    setLastVerdict("");
    resetTimer(45);
  }

  function submitUserBeat() {
    const text = userInput.trim();
    if (!text || text.length > MAX_CHARS) return;

    const newSub: Submission = {
      id: createId(),
      author: PARTICIPANTS.you,
      text,
      votes: 0,
    };

    setSubmissions((prev) => [...prev, newSub]);
    setUserInput("");
  }

  function simulateOthers() {
    const usedTexts = submissions.map((s) => s.text);
    const newSubs: Submission[] = [];

    // Scribe 1
    const t1 = pickUnused(currentPrompt.bank, usedTexts);
    newSubs.push({
      id: createId(),
      author: PARTICIPANTS.scribe1,
      text: t1,
      votes: 0,
    });
    usedTexts.push(t1);

    // Scribe 2
    const t2 = pickUnused(currentPrompt.bank, usedTexts);
    newSubs.push({
      id: createId(),
      author: PARTICIPANTS.scribe2,
      text: t2,
      votes: 0,
    });
    usedTexts.push(t2);

    // Optional AI
    if (aiEnabled) {
      const tAI = pickUnused(currentPrompt.aiBank, usedTexts);
      newSubs.push({
        id: createId(),
        author: AI_AUTHOR,
        text: tAI,
        votes: 0,
        isAI: true,
      });
    }

    setSubmissions((prev) => [...prev, ...newSubs]);
  }

  function advanceToVote() {
    if (submissions.length === 0) return;
    stopTimer();
    setPhase("vote");
    resetTimer(30);
  }

  function castVote(subId: string) {
    if (phase !== "vote") return;

    setSubmissions((prev) => {
      // Remove previous user vote if any
      let next = prev.map((s) => {
        if (userVoteId && s.id === userVoteId) {
          return { ...s, votes: Math.max(0, s.votes - 1) };
        }
        return s;
      });

      // Add to new choice
      next = next.map((s) => {
        if (s.id === subId) {
          return { ...s, votes: s.votes + 1 };
        }
        return s;
      });

      return next;
    });

    setUserVoteId(subId);
  }

  function simulateCrowd() {
    if (phase !== "vote" || submissions.length === 0) return;

    setSubmissions((prev) => {
      if (prev.length === 0) return prev;
      // Pick 1-2 subs that are not the current user vote (or any if none)
      const candidates = prev.filter((s) => s.id !== userVoteId);
      if (candidates.length === 0) return prev;

      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      const toBoost = shuffled.slice(0, Math.min(2, shuffled.length));

      return prev.map((s) => {
        if (toBoost.some((b) => b.id === s.id)) {
          return { ...s, votes: s.votes + 1 };
        }
        return s;
      });
    });
  }

  function declareCanon() {
    if (submissions.length === 0) return;
    stopTimer();

    // Determine winner: highest votes, tie-break by array order (earlier submit wins)
    const sorted = [...submissions].sort((a, b) => {
      if (b.votes !== a.votes) return b.votes - a.votes;
      return submissions.indexOf(a) - submissions.indexOf(b);
    });

    const winner = sorted[0];
    const apocrypha = submissions.filter((s) => s.id !== winner.id);

    const verdict = getVerdict(winner.votes, totalVotes, submissions.length);

    // Append to canon
    const newCanonLine = winner.text;
    setRunningCanon((prev) => [...prev, newCanonLine]);

    setLastCanonized(winner);
    setLastApocrypha(apocrypha);
    setLastVerdict(verdict);

    setPhase("canon");
  }

  function nextRound() {
    // Grow the canon (already appended), reset for next round on same evolving story
    setSubmissions([]);
    setUserInput("");
    setUserVoteId(null);
    setLastCanonized(null);
    setLastApocrypha([]);
    setLastVerdict("");
    setRound((r) => r + 1);
    setPhase("submit");
    resetTimer(45);
  }

  function forgeNewLegend() {
    // Full reset — new room feel
    setSubmissions([]);
    setUserInput("");
    setUserVoteId(null);
    setRunningCanon([]);
    setLastCanonized(null);
    setLastApocrypha([]);
    setLastVerdict("");
    setRound(1);
    setPhase("lobby");
    stopTimer();
    setTimer(45);
  }

  function changePrompt(newId: string) {
    if (phase !== "lobby") return;
    setPromptId(newId);
  }

  const canSubmitUser = userInput.trim().length > 0 && userInput.trim().length <= MAX_CHARS;
  const hasUserSubmitted = submissions.some((s) => s.author === PARTICIPANTS.you);
  const allSimulated = submissions.length >= (aiEnabled ? 4 : 3);
  const userHasVoted = userVoteId !== null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 font-mono text-sm">
      {/* Prototype banner — loud and clear */}
      <div className="mb-6 rounded-xl border border-amber-500/60 bg-amber-950/30 px-4 py-3 text-amber-200">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg">⚒︎</span>
          <div className="flex-1">
            <div className="font-bold uppercase tracking-[2px] text-[10px] text-amber-400">PROTOTYPE v0 — LOCAL ONLY</div>
            <div className="mt-1 text-[12px] leading-snug text-amber-100/90">
              StoryTunes voted story room test. No persistence. No multi-user. No connection to core strategy saves or timeline.
              This demonstrates exactly one (repeatable) round of submit / vote / canon + rejected branch preservation.
            </div>
            <div className="mt-1 text-[10px] text-amber-400/70">
              See <span className="underline">STORY-ROOMS.md</span> for the product brief. Playful ritual, not a document editor.
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[3px] text-amber-500/70">OPEN HISTORIA • STORY ROOM MODE</div>
          <div className="font-serif text-2xl text-slate-100">{currentPrompt.title}</div>
          <div className="text-slate-400 text-xs mt-0.5">{currentPrompt.short}</div>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          ROUND {round}
          <br />
          {phase.toUpperCase()}
        </div>
      </div>

      {/* Running canon (grows across rounds) */}
      {runningCanon.length > 0 && (
        <div className="mb-6 rounded-lg border border-emerald-900/40 bg-emerald-950/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-400 text-[10px] uppercase tracking-widest">
            <span>✧</span> CANON SO FAR (the record grows)
          </div>
          <div className="space-y-2 text-emerald-100/90 text-[12px] leading-relaxed">
            {runningCanon.map((line, i) => (
              <div key={i} className="border-l-2 border-emerald-700/60 pl-3">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOBBY */}
      {phase === "lobby" && (
        <div className="space-y-6">
          <div className="text-slate-300 text-[13px] leading-relaxed max-w-prose">
            A small hall of scribes and speculators. One prompt. Short offerings. A vote. A single telling becomes canon.
            Everything else is lovingly preserved as the roads not taken.
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">CHOOSE A LEGEND TO FORGE</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => changePrompt(p.id)}
                  className={`text-left rounded-lg border px-3 py-2 transition ${
                    promptId === p.id
                      ? "border-amber-500/70 bg-amber-950/30 text-amber-200"
                      : "border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="font-bold text-sm">{p.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.short}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="accent-amber-500"
              />
              <span className="text-slate-300">Include AI co-author (Grok • Speculative Engine)</span>
            </label>
          </div>

          <button
            onClick={enterRoom}
            className="w-full rounded-lg bg-amber-500 py-3 font-bold uppercase tracking-[2px] text-slate-950 hover:bg-amber-400 active:bg-amber-600 transition"
          >
            Enter the Canon Forge
          </button>

          <div className="text-[10px] text-slate-600 text-center">
            4 participants • 1–3 sentence offerings only • one vote each • canon is chosen, the rest preserved
          </div>
        </div>
      )}

      {/* SUBMIT PHASE */}
      {phase === "submit" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-amber-900/40 bg-slate-950/60 px-3 py-2 text-xs">
            <div>
              <span className="uppercase tracking-widest text-amber-400">SUBMISSIONS OPEN</span>
              <span className="ml-2 text-slate-500">• timer is visual only (demo)</span>
            </div>
            <div className="font-mono text-amber-300">
              {timer}s left
            </div>
          </div>

          {/* Seed */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-[12px] leading-relaxed text-slate-300">
            {currentPrompt.seed}
          </div>

          {/* Your input */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
              <div>YOUR TELLING</div>
              <div className={userInput.length > MAX_CHARS ? "text-rose-400" : ""}>
                {userInput.length}/{MAX_CHARS}
              </div>
            </div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="One surprising ripple (1–3 sentences). No essays — the hall is waiting."
              className="w-full min-h-[92px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-amber-500/60 focus:outline-none"
            />
            <div className="mt-1.5 flex gap-2">
              <button
                onClick={submitUserBeat}
                disabled={!canSubmitUser}
                className="flex-1 rounded bg-amber-500 py-2 text-xs font-bold uppercase tracking-widest text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400"
              >
                Submit my beat
              </button>
              <button
                onClick={simulateOthers}
                disabled={allSimulated}
                className="flex-1 rounded border border-slate-700 py-2 text-xs uppercase tracking-widest text-slate-300 hover:bg-slate-900 disabled:opacity-40"
              >
                Scribes have their say (sim others)
              </button>
            </div>
          </div>

          {/* Current submissions this round */}
          {submissions.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                OFFERINGS SO FAR ({submissions.length})
              </div>
              <div className="space-y-2">
                {submissions.map((s) => (
                  <div key={s.id} className="rounded border border-slate-800 bg-slate-950/60 p-2.5 text-[12px]">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                      <span className={s.isAI ? "text-sky-400" : ""}>{s.author}</span>
                      {s.isAI && <span className="text-[9px] text-sky-500/70">AI CO-AUTHOR</span>}
                    </div>
                    <div className="text-slate-200 leading-snug">{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={advanceToVote}
              disabled={submissions.length === 0}
              className="w-full rounded-lg border border-amber-500/70 py-2.5 text-xs uppercase tracking-[2px] text-amber-400 hover:bg-amber-950/40 disabled:border-slate-800 disabled:text-slate-600"
            >
              Close submissions &amp; open the vote
            </button>
            <div className="mt-1 text-center text-[10px] text-slate-600">
              You can still submit or simulate after others — the hall is patient.
            </div>
          </div>
        </div>
      )}

      {/* VOTE PHASE */}
      {phase === "vote" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-sky-900/40 bg-slate-950/60 px-3 py-2 text-xs">
            <div>
              <span className="uppercase tracking-widest text-sky-400">THE VOTE IS CAST</span>
              <span className="ml-2 text-slate-500">• choose the telling that rings truest</span>
            </div>
            <div className="font-mono text-sky-300">{timer}s</div>
          </div>

          <div className="grid gap-3">
            {submissions.map((s) => {
              const isChosen = userVoteId === s.id;
              return (
                <div
                  key={s.id}
                  className={`rounded-xl border p-3 transition ${isChosen ? "border-emerald-500/70 bg-emerald-950/10" : "border-slate-800 bg-slate-950/40"}`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={s.isAI ? "text-sky-400" : "text-slate-400"}>{s.author}</span>
                      {s.isAI && <span className="text-[9px] text-sky-500/60">AI</span>}
                    </div>
                    <div className="font-mono text-emerald-400/80 tabular-nums">
                      {s.votes} vote{s.votes === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-slate-200 text-[13px] leading-snug mb-3">{s.text}</div>
                  <button
                    onClick={() => castVote(s.id)}
                    className={`w-full rounded py-1.5 text-[10px] uppercase tracking-widest transition ${
                      isChosen
                        ? "bg-emerald-500/90 text-emerald-950"
                        : "border border-emerald-700/60 text-emerald-400 hover:bg-emerald-950/30"
                    }`}
                  >
                    {isChosen ? "You support this telling" : "Support this telling"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={simulateCrowd}
              className="flex-1 rounded border border-slate-700 py-2 text-xs uppercase tracking-widest text-slate-300 hover:bg-slate-900"
            >
              Simulate the hall’s murmurs
            </button>
            <button
              onClick={declareCanon}
              disabled={!userHasVoted && submissions.length > 1}
              className="flex-1 rounded bg-emerald-500 py-2 text-xs font-bold uppercase tracking-widest text-emerald-950 disabled:opacity-40"
            >
              Seal the canon with the tally
            </button>
          </div>
          {!userHasVoted && submissions.length > 1 && (
            <div className="text-center text-[10px] text-rose-400/70">Cast your vote before sealing (or let the crowd decide alone).</div>
          )}
        </div>
      )}

      {/* CANON PHASE */}
      {phase === "canon" && lastCanonized && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/10 p-4">
            <div className="uppercase tracking-[3px] text-emerald-400 text-[10px] mb-1">CANONIZED</div>
            <div className="font-serif text-lg text-emerald-100 leading-tight mb-2">{lastCanonized.text}</div>
            <div className="text-emerald-400/70 text-xs">— {lastCanonized.author}</div>

            <div className="mt-4 border-t border-emerald-900/50 pt-3 text-[12px] text-emerald-300/90">
              {lastVerdict}
            </div>
          </div>

          {/* Apocrypha — rejected branches preserved */}
          {lastApocrypha.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-[10px] uppercase tracking-widest mb-2">
                <span>✕</span> APOCRYPHA — THE BRANCHES NOT TAKEN (PRESERVED)
              </div>
              <div className="space-y-2">
                {lastApocrypha.map((s, idx) => (
                  <div key={idx} className="rounded border border-rose-900/40 bg-rose-950/5 p-2.5 text-[12px]">
                    <div className="text-rose-400/70 text-[10px] mb-0.5">{s.author}</div>
                    <div className="text-rose-100/80 leading-snug">{s.text}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-rose-400/60">
                Nothing is lost. These are the roads history did not take — yet.
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={nextRound}
              className="flex-1 rounded-lg bg-amber-500 py-3 text-sm font-bold uppercase tracking-[2px] text-slate-950 hover:bg-amber-400"
            >
              Begin the next round on this canon
            </button>
            <button
              onClick={forgeNewLegend}
              className="flex-1 rounded-lg border border-slate-700 py-3 text-sm uppercase tracking-[2px] text-slate-300 hover:bg-slate-900"
            >
              Forge an entirely new legend
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-600">
            The canon grows. The apocrypha remain. This is the shape of collaborative history.
          </div>
        </div>
      )}

      {/* Footer ritual */}
      <div className="mt-10 border-t border-slate-800 pt-4 text-[10px] text-slate-600 flex items-center justify-between">
        <div>
          Local prototype • {aiEnabled ? "AI co-author enabled" : "AI co-author off"} • {submissions.length} offerings this round
        </div>
        <button onClick={forgeNewLegend} className="underline decoration-dotted hover:text-slate-400">
          reset everything
        </button>
      </div>
    </div>
  );
}
