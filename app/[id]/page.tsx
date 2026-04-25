export const dynamic = "force-dynamic";

import GameClientWrapper from "../_components/GameClientWrapper";

export default async function GameByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GameClientWrapper initialGameId={id} />;
}
