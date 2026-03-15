export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm uppercase tracking-[0.3em] text-red-500 mb-4">
          Found Footage Horror Database
        </p>

        <h1 className="text-5xl font-bold mb-6">
          Found Footage Vault
        </h1>

        <p className="text-lg text-gray-300 max-w-3xl mb-10">
          A curated archive of found footage horror films, ranked by realism,
          fear factor, disturbance level, hidden-gem status, and more.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-2xl font-semibold mb-3">Explore Categories</h2>
            <ul className="space-y-2 text-gray-300">
              <li>Most Realistic</li>
              <li>Scariest Found Footage</li>
              <li>Most Disturbing</li>
              <li>Hidden Gems</li>
              <li>Haunted Locations</li>
            </ul>
          </div>

          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-2xl font-semibold mb-3">What Makes It Different?</h2>
            <p className="text-gray-300">
              Found Footage Vault is built to help horror fans discover movies
              by vibe, scare style, realism, and niche category lists instead
              of digging through random streaming menus.
            </p>
          </div>
        </div>

        <div className="border border-red-900/40 rounded-2xl p-6 bg-red-950/20">
          <h2 className="text-2xl font-semibold mb-3">Coming Soon</h2>
          <p className="text-gray-300">
            Movie database pages, fear index rankings, streaming links,
            recommendations, and curated top lists.
          </p>
        </div>
      </div>
    </main>
  );
}