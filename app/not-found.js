import Link from "next/link";

const recoveryLinks = [
  {
    eyebrow: "Recovery Route",
    title: "Return To Search Console",
    description: "Re-enter the recovered footage vault and pull titles by name, category, vibe, or archive flag.",
    href: "/search",
    label: "Open Search",
  },
  {
    eyebrow: "Recovery Route",
    title: "Open Fear Experiment",
    description: "Jump back into the classified recommendation engine and quiz-based archive paths.",
    href: "/fear-experiment",
    label: "Open Fear Experiment",
  },
  {
    eyebrow: "Recovery Route",
    title: "Browse Ranked Lists",
    description: "Use the stable list routes to recover a watch path without rebuilding filters manually.",
    href: "/lists",
    label: "Open Lists",
  },
];

export default function NotFound() {
  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="ff-panel mb-8 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(61,147,88,0.22),_rgba(7,14,10,0.94)_58%)] p-8 md:p-10">
          <p className="mb-3 text-xs uppercase tracking-[0.34em] text-green-300/70">Archive Error 404</p>
          <h1 className="ff-glow ff-safe-wrap mb-4 text-3xl font-bold text-green-50 sm:text-4xl md:text-5xl">
            Requested Case File Could Not Be Recovered
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-green-50/72 md:text-base">
            The route you tried to access is missing from the active vault index, was moved, or never resolved into a valid archive surface.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-green-100/52">
            <span className="ff-border rounded-full px-3 py-2">Case File Missing</span>
            <span className="ff-border rounded-full px-3 py-2">Route Index Failed</span>
            <span className="ff-border rounded-full px-3 py-2">Recovery Paths Available</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="ff-button rounded-full px-5 py-3 text-sm font-medium">
              Return Home
            </Link>
            <Link href="/search" className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8">
              Open Search Console
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {recoveryLinks.map((entry) => (
            <Link
              key={entry.title}
              href={entry.href}
              className="ff-panel rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-green-400/8"
            >
              <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">{entry.eyebrow}</div>
              <h2 className="ff-safe-wrap mb-2 text-2xl font-semibold text-green-50">{entry.title}</h2>
              <p className="ff-safe-wrap mb-4 text-sm text-green-100/58">{entry.description}</p>
              <span className="ff-link text-sm">{entry.label}</span>
            </Link>
          ))}
        </div>

        <div className="ff-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Recovery Advice</p>
              <h2 className="ff-safe-wrap text-2xl font-semibold sm:text-3xl">Where To Go Next</h2>
            </div>
            <span className="text-sm uppercase tracking-[0.18em] text-green-100/45">Operational now</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="ff-border rounded-2xl bg-black/20 p-5">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">1</div>
              <p className="ff-safe-wrap text-sm text-green-50/72">Use search if you know the title, category, or vibe you were trying to reach.</p>
            </div>
            <div className="ff-border rounded-2xl bg-black/20 p-5">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">2</div>
              <p className="ff-safe-wrap text-sm text-green-50/72">Use lists if you want a stable route with ranked discovery already prepared.</p>
            </div>
            <div className="ff-border rounded-2xl bg-black/20 p-5">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">3</div>
              <p className="ff-safe-wrap text-sm text-green-50/72">Use categories if you want to re-enter by subgenre instead of exact title matching.</p>
            </div>
            <div className="ff-border rounded-2xl bg-black/20 p-5">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">4</div>
              <p className="ff-safe-wrap text-sm text-green-50/72">Use Fear Experiment if you want the archive to suggest a route for you.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}