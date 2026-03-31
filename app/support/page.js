import Link from "next/link";
import { siteName } from "../data/site";

export const metadata = {
  title: "Support The Vault",
  description: "Learn how Fear Experiment bonus labs, future unlock campaigns, and paid quiz drops will be supported inside Found Footage Vault.",
};

const supportLanes = [
  {
    eyebrow: "Immediate Unlock",
    title: "Bonus Labs Coming Soon",
    description: "Locked Fear Experiment tracks are visible now as part of the next rollout phase. The unlock campaign layer is being staged, but it is not active yet.",
    ctaLabel: "Open Fear Experiment",
    href: "/fear-experiment/quiz",
  },
  {
    eyebrow: "Funding Path",
    title: "Future Paid Labs",
    description: "Quizzes 5 and 6 are framed as bonus labs so the section can grow beyond the core tracks. This page gives that gating a real explanation instead of a dead-end lock card.",
    ctaLabel: "View Locked Labs",
    href: "/fear-experiment",
  },
  {
    eyebrow: "Archive Support",
    title: "Use The Vault Routes",
    description: "The cleanest current support action is still using the archive: browse movies, open watch links where available, and keep the recommendation surfaces in circulation.",
    ctaLabel: "Browse Top Routes",
    href: "/lists/top-25-most-recommended",
  },
];

const supportNotes = [
  "Locked labs are currently presented as coming soon rather than fully active unlocks.",
  "The unlock campaign layer is being staged separately so the site does not promise a flow that is not ready yet.",
  "The payment layer is not wired to a live processor yet, so this page sets expectation without faking checkout.",
  "When paid support is formalized, the locked-lab messaging can point here without changing the rest of the Fear Experiment flow.",
];

export default function SupportPage() {
  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="ff-panel ff-elevated mb-10 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(84,160,119,0.22),_rgba(8,15,11,0.94)_60%)] p-8 md:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-green-300/70">Support The Vault</p>
          <h1 className="ff-glow ff-safe-wrap mb-4 text-3xl font-bold text-green-50 sm:text-4xl md:text-5xl">How Locked Labs And Future Support Work</h1>
          <p className="max-w-3xl text-lg text-green-50/72">
            {siteName} now uses a two-layer model for Fear Experiment: core quiz tracks stay open, while bonus labs stay visible as coming soon until the next unlock layer and a cleaner paid path are ready.
          </p>
          <div className="ff-signal-strip mt-5">
            <span className="ff-signal-chip">bonus labs coming soon</span>
            <span className="ff-signal-chip">payment path staged</span>
            <span className="ff-signal-chip">no fake checkout</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/fear-experiment/quiz" className="ff-button rounded-full px-5 py-3 text-sm font-medium">
              Open Quiz Lab
            </Link>
            <Link href="/fear-experiment" className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8">
              Review Locked Tracks
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-4 lg:grid-cols-3">
          {supportLanes.map((lane) => (
            <div key={lane.title} className="ff-panel ff-elevated rounded-3xl p-6">
              <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">{lane.eyebrow}</div>
              <h2 className="ff-safe-wrap mb-3 text-2xl font-semibold text-green-50">{lane.title}</h2>
              <p className="mb-5 text-sm text-green-100/60">{lane.description}</p>
              <Link href={lane.href} className="ff-button inline-flex rounded-full px-4 py-2 text-sm">
                {lane.ctaLabel}
              </Link>
            </div>
          ))}
        </div>

        <div className="mb-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="ff-panel ff-elevated rounded-3xl p-6 md:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Current Ground Rules</p>
                <h2 className="ff-safe-wrap text-2xl font-semibold sm:text-3xl">What This Means Right Now</h2>
              </div>
              <span className="text-sm uppercase tracking-[0.18em] text-green-100/45">No fake checkout</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {supportNotes.map((note) => (
                <div key={note} className="ff-border rounded-2xl bg-black/20 p-4 text-sm text-green-50/72">
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div className="ff-panel ff-elevated rounded-3xl p-6 md:p-8">
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">Rollout Shape</div>
            <h2 className="ff-safe-wrap mb-4 text-2xl font-semibold text-green-50">Open Core, Gated Bonus</h2>
            <div className="space-y-3">
              <div className="ff-border rounded-2xl bg-black/20 p-4">
                <div className="mb-1 text-xs uppercase tracking-[0.18em] text-green-300/70">Step 1</div>
                <div className="text-sm text-green-50/78">Keep the main recommendation tracks fully usable so the section still works without friction.</div>
              </div>
              <div className="ff-border rounded-2xl bg-black/20 p-4">
                <div className="mb-1 text-xs uppercase tracking-[0.18em] text-green-300/70">Step 2</div>
                <div className="text-sm text-green-50/78">Keep the bonus labs visible as coming soon until the unlock campaign layer is ready to be switched on.</div>
              </div>
              <div className="ff-border rounded-2xl bg-black/20 p-4">
                <div className="mb-1 text-xs uppercase tracking-[0.18em] text-green-300/70">Step 3</div>
                <div className="text-sm text-green-50/78">Swap in a real payment processor later and keep this route as the explanation layer for the transition.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ff-panel ff-elevated rounded-3xl p-6 md:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Recommended Routes</p>
              <h2 className="ff-safe-wrap text-2xl font-semibold sm:text-3xl">Where To Send People Next</h2>
            </div>
            <span className="text-sm uppercase tracking-[0.18em] text-green-100/45">Clean exits</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/fear-experiment/quiz" className="ff-border rounded-2xl bg-black/20 p-4 text-sm text-green-50/72 transition hover:-translate-y-1 hover:bg-green-400/8">
              Go straight to the quiz lab and let the open tracks do the work while the bonus labs stay in preview.
            </Link>
            <Link href="/fear-experiment" className="ff-border rounded-2xl bg-black/20 p-4 text-sm text-green-50/72 transition hover:-translate-y-1 hover:bg-green-400/8">
              Show the catalog first if you want users to understand which tracks are open versus gated.
            </Link>
            <Link href="/lists/top-25-most-recommended" className="ff-border rounded-2xl bg-black/20 p-4 text-sm text-green-50/72 transition hover:-translate-y-1 hover:bg-green-400/8">
              Route support-minded visitors back into the strongest archive page instead of dropping them on a dead end.
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}