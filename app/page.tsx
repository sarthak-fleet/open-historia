import GameClientWrapper from "./_components/GameClientWrapper";

// GameClientWrapper is already `ssr: false`, so `force-dynamic` was buying
// nothing except a per-request Worker invocation. Removing it lets the
// route be statically rendered; the game still boots client-side as before.
export default function Page() {
  return <GameClientWrapper />;
}
