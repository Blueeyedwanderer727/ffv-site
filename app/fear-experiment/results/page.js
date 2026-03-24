import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  fearExperimentProfiles,
  getFearExperimentProfileBySlug,
  getFearExperimentQuizHref,
  getFearExperimentResultsHref,
  getFearExperimentSearchHref,
} from "../../data/fearExperiment";
import {
  buildQuizHref,
  formatQuizOptionLabel,
  formatQuizQuestionLabel,
  getQuizAnswersFromSource,
  getQuizQuestionsForMode,
  getQuizResultsForMode,
  getValidQuizMode,
} from "../../data/quiz";

function getResolvedExperimentState(searchParams) {
  const profile = getFearExperimentProfileBySlug(searchParams.profile);
  const queryMode = getValidQuizMode(searchParams.mode);
  const mode = queryMode || profile?.mode || "simple";
  const questions = getQuizQuestionsForMode(mode);
  const answersFromQuery = getQuizAnswersFromSource(searchParams, questions);
  const hasAnswersFromQuery = Object.keys(answersFromQuery).length > 0;
  const answers = hasAnswersFromQuery ? answersFromQuery : (profile?.answers || {});

  return { profile, mode, questions, answers };
}

export default function FearExperimentResultsPage({ searchParams }) {
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const { profile, mode, questions, answers } = getResolvedExperimentState(resolvedSearchParams);
  const results = getQuizResultsForMode(mode, answers).slice(0, 6);
  const bestMatch = results[0];
  const answerSummary = questions
    .map((question) => {
      const value = answers[question.id];
      if (!value) {
        return null;
      }

      return {
        id: question.id,
        label: formatQuizQuestionLabel(question.id),
        valueLabel: formatQuizOptionLabel(question.id, value),
      };
    })
    .filter(Boolean);
  const quizHref = profile ? getFearExperimentQuizHref(profile) : buildQuizHref(mode, answers, "/fear-experiment/quiz");
  const searchHref = profile ? getFearExperimentSearchHref(profile) : getFearExperimentSearchHref({ mode, answers });

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-3 text-sm uppercase tracking-[0.24em] text-green-300/70">Fear Experiment Results</p>
            <h1 className="ff-glow ff-safe-wrap mb-3 text-3xl font-bold text-green-50 sm:text-4xl">{profile ? profile.title : "Current Recommendation Lane"}</h1>
            <p className="ff-safe-wrap max-w-3xl text-green-50/72">
              {profile ? profile.description : "A live recommendation state built from the quiz answers you selected."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/fear-experiment" className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
              Fear Experiment Home
            </Link>
            <Link href={quizHref} className="ff-button rounded-full px-4 py-2 text-sm">
              Refine In Quiz
            </Link>
            <Link href={searchHref} className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
              Open In Search
            </Link>
          </div>
        </div>

        {profile ? (
          <div className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="ff-panel ff-mobile-panel rounded-3xl p-6">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Fear Archetype</div>
              <p className="ff-safe-wrap text-green-50/78">{profile.archetype}</p>
            </div>
            <div className="ff-panel ff-mobile-panel rounded-3xl p-6">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">You May Be Into...</div>
              <div className="flex flex-wrap gap-2">
                {profile.youMayBeInto.map((item) => (
                  <span key={item} className="ff-border ff-mobile-chip rounded-full px-3 py-1 text-sm text-green-50/78">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {answerSummary.length > 0 ? (
          <div className="ff-panel ff-mobile-panel mb-8 rounded-3xl p-6">
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">Recommendation Inputs</div>
            <div className="flex flex-wrap gap-2">
              {answerSummary.map((item) => (
                <span key={item.id} className="ff-border ff-mobile-chip ff-safe-wrap rounded-full px-3 py-1 text-sm text-green-50/78">
                  {item.label}: {item.valueLabel}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {bestMatch ? (
          <div className="ff-panel ff-mobile-panel mb-8 grid gap-6 rounded-3xl p-6 md:grid-cols-[220px_minmax(0,1fr)] md:p-8">
            <div className="ff-border relative overflow-hidden rounded-2xl bg-black/20 aspect-[2/3]">
              {bestMatch.movie.posterUrl ? (
                <Image
                  src={bestMatch.movie.posterUrl}
                  alt={`${bestMatch.movie.title} poster`}
                  fill
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 220px"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-green-100/45">Archive image unavailable</div>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.22em] text-green-300/70">Top Recommendation</p>
              <h2 className="ff-safe-wrap mb-3 text-3xl font-bold text-green-50 sm:text-4xl">{bestMatch.movie.title}</h2>
              <p className="ff-safe-wrap mb-4 text-green-50/72">{bestMatch.movie.synopsis}</p>
              <div className="mb-5 flex flex-wrap gap-2 text-sm">
                {bestMatch.matchedTraits.map((trait) => (
                  <span key={trait} className="ff-button ff-mobile-chip rounded-full px-3 py-1">
                    {trait}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={buildQuizHref(mode, answers, `/movie/${bestMatch.movie.slug}`)}
                  className="ff-button rounded-full px-5 py-3 text-sm font-medium"
                >
                  View Movie
                </Link>
                <Link href={searchHref} className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8">
                  Open In Search
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="ff-panel ff-mobile-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="ff-safe-wrap text-2xl font-semibold">More Results</h3>
            <Link href={searchHref} className="ff-link text-sm">
              Open full search
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.slice(1).map((result) => (
              <Link
                key={result.movie.slug}
                href={buildQuizHref(mode, answers, `/movie/${result.movie.slug}`)}
                className="ff-border ff-mobile-panel rounded-2xl bg-black/20 p-4 transition hover:-translate-y-1 hover:bg-green-400/8"
              >
                <div className="ff-safe-wrap mb-2 text-lg font-semibold text-green-50">{result.movie.title}</div>
                <div className="mb-3 text-sm text-green-100/52">Score {result.score}</div>
                <p className="ff-safe-wrap mb-3 line-clamp-3 text-sm text-green-50/68">{result.movie.synopsis}</p>
                <div className="flex flex-wrap gap-2 text-xs text-green-50/72">
                  {result.matchedTraits.map((trait) => (
                    <span key={trait} className="ff-border ff-mobile-chip rounded-full px-2 py-1">
                      {trait}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="ff-panel ff-mobile-panel mt-8 rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="ff-safe-wrap text-2xl font-semibold">More Fear Experiment Profiles</h3>
            <Link href="/fear-experiment" className="ff-link text-sm">
              Browse all archetypes
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {fearExperimentProfiles.map((item) => (
              <Link
                key={item.slug}
                href={getFearExperimentResultsHref(item)}
                className="ff-border ff-mobile-panel rounded-2xl bg-black/20 p-4 transition hover:-translate-y-1 hover:bg-green-400/8"
              >
                <div className="ff-safe-wrap mb-2 text-lg font-semibold text-green-50">{item.title}</div>
                <div className="ff-safe-wrap text-sm text-green-100/56">{item.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}