"use client";

import dynamic from "next/dynamic";

const GameClient = dynamic(() => import("./GameClient"), { ssr: false });

export default function GameClientWrapper({
  initialGameId,
}: {
  initialGameId?: string;
}) {
  return <GameClient initialGameId={initialGameId} />;
}
