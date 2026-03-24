import Link from "next/link";
import QuizModePoster from "../components/QuizModePoster";
import { getQuizModeMeta } from "../data/quiz";
import {
  fearExperimentLockedModes,
  fearExperimentQuizModes,
  fearExperimentProfiles,
  getFearExperimentPreview,
  getFearExperimentResultsHref,
  getFearExperimentSearchHref,
} from "../data/fearExperiment";

export const metadata = {
  title: "Fear Experiment",
  description: "Browse the incident-report side of Found Footage Vault: quiz tracks, fear archetypes, and recommendation surfaces.",
};

export default function FearExperimentPage() {
  const quizModes = fearExperimentQuizModes
    .map((mode) => getQuizModeMeta(mode))
    .filter(Boolean);
  const activeQuizCount = quizModes.filter((mode) => !fearExperimentLockedModes.includes(mode.id)).length;
  const lockedQuizCount = quizModes.length - activeQuizCount;
  const operationalLinks = [
    {
      title: "Search Console",
      description: "Open the live filter surface for category, fear index, realism, and recommendation score tuning.",
      href: "/search",
    },
    {
      title: "List Routes",
      description: "Jump straight into the ranked list surfaces that already have stable data and clear recommendation value.",
      href: "/lists",
    },
    {
      title: "Category Routes",
      description: "Browse the archive by working subgenre routes instead of unfinished editorial layers.",
      href: "/categories",
    },
    {
      title: "Support The Vault",
      description: "See how locked labs, share unlocks, and future paid support are being framed without leaving the archive.",
      href: "/support",
    },
  ];
  const profiles = fearExperimentProfiles.map((profile) => ({
    ...profile,
    preview: getFearExperimentPreview(profile, 3),
    resultsHref: getFearExperimentResultsHref(profile),
    searchHref: getFearExperimentSearchHref(profile),
  }));

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="ff-panel ff-elevated mb-10 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(61,147,88,0.28),_rgba(6,12,8,0.92)_58%)] p-8 md:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-green-300/70">Fear Experiment</p>
          <h1 className="ff-glow ff-safe-wrap mb-4 text-3xl font-bold text-green-50 sm:text-4xl md:text-5xl">The Recommendation Engine, Archived As An Incident Report</h1>
          <p className="max-w-3xl text-lg text-green-50/72">
            This is where the vault turns your taste into direction: live quiz tracks, recommendation lanes, fear archetypes, and a cleaner way to move from mood to movie.
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.18em] text-green-300/70">
            {activeQuizCount} live tracks now · {lockedQuizCount} bonus labs unlockable
          </p>
          <div className="ff-signal-strip mt-5">
            <span className="ff-signal-chip">quiz routing live</span>
            <span className="ff-signal-chip">share unlocks enabled</span>
            <span className="ff-signal-chip">support route live</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/fear-experiment/quiz"
              className="ff-button rounded-full px-5 py-3 text-sm font-medium"
            >
              Open Quiz Lab
            </Link>
            <Link
              href="/fear-experiment/results"
              className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8"
            >
              Open Result Profiles
            </Link>
          </div>
        </div>

        <div className="ff-panel mb-12 rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Quiz Catalog</p>
              <h2 className="ff-safe-wrap text-2xl font-semibold sm:text-3xl">Fear Experiment Quiz Catalog</h2>
            </div>
            <p className="max-w-2xl text-sm text-green-100/58">
              Four tracks are live right now. Two bonus labs stay locked until someone shares the section or helps fund the next round of quiz expansion.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quizModes.map((mode) => (
              fearExperimentLockedModes.includes(mode.id) ? (
                <div key={mode.id} className="ff-border ff-elevated rounded-3xl bg-black/20 p-5">
                  <QuizModePoster mode={mode} />
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm uppercase tracking-[0.18em] text-green-300/70">
                    <span>{mode.eyebrow}</span>
                    <span className="ff-border rounded-full px-3 py-1 text-[11px] text-green-50/78">Locked</span>
                  </div>
                  <h3 className="ff-safe-wrap mb-2 text-xl font-semibold text-green-50 sm:text-2xl">{mode.title}</h3>
                  <p className="mb-4 text-sm text-green-100/58">{mode.description}</p>
                  <p className="mb-5 text-sm text-green-100/56">Unlock this lab from the quiz page by sharing the Fear Experiment, or open support details for the paid-track path and future funding options.</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/fear-experiment/quiz?mode=${mode.id}`} className="ff-button rounded-full px-4 py-2 text-sm">
                      Unlock Options
                    </Link>
                    <Link href="/support" className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
                      Support The Vault
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  key={mode.id}
                  href={`/fear-experiment/quiz?mode=${mode.id}`}
                  className="ff-border ff-elevated rounded-3xl bg-black/20 p-5 transition hover:-translate-y-1 hover:bg-green-400/8"
                >
                  <QuizModePoster mode={mode} />
                  <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">{mode.eyebrow}</div>
                  <h3 className="ff-safe-wrap mb-2 text-xl font-semibold text-green-50 sm:text-2xl">{mode.title}</h3>
                  <p className="text-sm text-green-100/58">{mode.description}</p>
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="ff-panel rounded-3xl p-6">
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">Route 1</div>
            <h2 className="ff-safe-wrap mb-2 text-2xl font-semibold">/fear-experiment</h2>
            <p className="text-sm text-green-100/58">Landing, archetypes, and the brand frame for this part of the site.</p>
          </div>
          <div className="ff-panel rounded-3xl p-6">
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">Route 2</div>
            <h2 className="ff-safe-wrap mb-2 text-2xl font-semibold">/fear-experiment/quiz</h2>
            <p className="text-sm text-green-100/58">The live quiz interface with four active labs and two locked bonus tracks.</p>
          </div>
          <div className="ff-panel rounded-3xl p-6">
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">Route 3</div>
            <h2 className="ff-safe-wrap mb-2 text-2xl font-semibold">/fear-experiment/results</h2>
            <p className="text-sm text-green-100/58">Fear archetypes, recommendation summaries, and reusable result cards tied to the active quiz logic.</p>
          </div>
        </div>

        <div className="ff-panel ff-elevated mb-12 rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Fear Archetypes</p>
              <h2 className="ff-safe-wrap text-2xl font-semibold sm:text-3xl">Three Starting Lanes</h2>
            </div>
            <p className="max-w-2xl text-sm text-green-100/58">
              These archetypes give the section a clear point of view now, while still feeding directly into working results and search links.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {profiles.map((profile) => (
              <div key={profile.slug} className="ff-border ff-elevated rounded-3xl bg-black/20 p-5">
                <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">Archetype</div>
                <h3 className="ff-safe-wrap mb-2 text-xl font-semibold text-green-50 sm:text-2xl">{profile.title}</h3>
                <p className="mb-4 text-sm text-green-50/72">{profile.description}</p>
                <p className="mb-4 text-sm text-green-100/56">{profile.archetype}</p>
                <div className="ff-border mb-4 rounded-2xl bg-black/20 p-4 text-sm text-green-50/72">
                  <div className="mb-2 text-xs uppercase tracking-[0.18em] text-green-300/70">You May Be Into</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.youMayBeInto.map((item) => (
                      <span key={item} className="ff-border rounded-full px-3 py-1 text-xs text-green-50/78">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-5 text-sm text-green-100/56">{profile.categoryStyle}</div>
                <div className="mb-5 space-y-2 text-sm text-green-50/72">
                  {profile.preview.map((result) => (
                    <div key={result.movie.slug} className="ff-border flex items-center justify-between gap-3 rounded-xl px-3 py-2">
                      <span>{result.movie.title}</span>
                      <span className="text-xs text-green-100/45">Score {result.score}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={profile.resultsHref} className="ff-button rounded-full px-4 py-2 text-sm">
                    Open Results
                  </Link>
                  <Link href={profile.searchHref} className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
                    Open Search
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ff-panel ff-elevated rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Operational Layer</p>
              <h2 className="ff-safe-wrap text-2xl font-semibold sm:text-3xl">Routes With Live Data Behind Them</h2>
            </div>
            <span className="text-sm uppercase tracking-[0.18em] text-green-100/45">Operational now</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {operationalLinks.map((entry) => (
              <Link
                key={entry.title}
                href={entry.href}
                className="ff-border rounded-2xl bg-black/20 p-5 transition hover:-translate-y-1 hover:bg-green-400/8"
              >
                <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Live Route</div>
                <div className="ff-safe-wrap mb-2 text-xl font-semibold text-green-50 sm:text-2xl">{entry.title}</div>
                <p className="text-sm text-green-100/56">{entry.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}