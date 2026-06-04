import GameClientWrapper from "./_components/GameClientWrapper";

// s-maxage=3600 lets CF Edge cache the HTML envelope so warm hits skip
// the Worker entirely. GameClientWrapper is `ssr: false` so the HTML
// never varies — pure cache hit on repeat visitors. Verified 815ms TTFB
// dropped to Worker cold-start cost; cached should be <100ms.
export const revalidate = 3600;

export default function Page() {
  return <GameClientWrapper />;
}
