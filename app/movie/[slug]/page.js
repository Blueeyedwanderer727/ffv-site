import Image from "next/image";
import { movies } from "../../data/movies";
import { buildAmazonWatchHref, buildTmdbWatchHref, isAmazonAffiliateEnabled } from "../../data/affiliateLinks";
import { categoryLabels, listLabels } from "../../data/labels";
import { getFearCategory, getFearIndex, getListKeysForMovie, getScariestScore } from "../../data/listRankings";
import { buildSearchHref } from "../../data/searchFilters";
import {
  buildQuizHref,
  formatRecommendationTag,
  getMovieQuizProfile,
  getMovieRecommendationContext,
  getQuizAnswersFromSource,
  getQuizQuestionsForMode,
  getQuizRecommendationForMovie,
  getRelatedMovieMatches,
  getValidQuizMode,
} from "../../data/quiz";
import Link from "next/link";
import { use } from "react";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const movie = movies.find((entry) => entry.slug === resolvedParams.slug);

  if (!movie) {
    return {
      title: "Case File Missing",
      description: "The requested Found Footage Vault case file could not be recovered from the active archive.",
    };
  }

  const fearCategory = getFearCategory(movie);
  const categoryLabel = movie.categories?.[0] ? categoryLabels[movie.categories[0]] || movie.categories[0] : "Found footage archive";

  return {
    title: `${movie.title} (${movie.year})`,
    description: `${movie.title} is filed under ${categoryLabel} with a ${fearCategory.toLowerCase()} rating inside the Found Footage Vault archive.`,
  };
}

function SectionSummary({ title }) {
  return <summary className="cursor-pointer list-none text-2xl font-semibold text-green-50">{title}</summary>;
}

export default function MoviePage({ params, searchParams }) {
  const { slug } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const movie = movies.find((m) => m.slug === slug);
  const movieLists = movie ? getListKeysForMovie(movie) : [];
  const quizProfile = movie ? getMovieQuizProfile(movie) : [];
  const recommendationContext = movie ? getMovieRecommendationContext(movie) : null;
  const relatedMovies = movie ? getRelatedMovieMatches(movie, 4) : [];
  const quizMode = getValidQuizMode(resolvedSearchParams?.mode);
  const quizAnswers = quizMode ? getQuizAnswersFromSource(resolvedSearchParams, getQuizQuestionsForMode(quizMode)) : {};
  const quizRecommendation = movie && quizMode ? getQuizRecommendationForMovie(quizMode, quizAnswers, movie) : null;
  const amazonWatchHref = movie ? buildAmazonWatchHref(movie) : null;
  const tmdbWatchHref = movie ? buildTmdbWatchHref(movie) : null;
  const showAmazonAffiliate = isAmazonAffiliateEnabled();
  const nearbySearchHref = movie
    ? buildSearchHref({
        searchText: movie.title,
        category: movie.categories?.[0],
        tags: movie.quizTraits?.vibe?.[0] ? [movie.quizTraits.vibe[0]] : [],
      })
    : "/search";

  if (!movie) {
    return (
      <main className="min-h-screen px-6 py-12 text-white">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="ff-link inline-block mb-6">
            ← Back to Home
          </Link>
          <div className="ff-panel rounded-3xl p-6 md:p-8">
            <h1 className="ff-safe-wrap mb-4 text-3xl font-bold text-green-50">Movie Not Found</h1>
            <p className="ff-safe-wrap text-green-100/56">This case file is missing from the active vault index or the route is no longer valid.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="ff-link inline-block mb-6">
          ← Back to Home
        </Link>

        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <Link href="/search" className="ff-border rounded-full px-4 py-2 text-green-50/80 hover:bg-green-400/8">
            Return To Vault Search
          </Link>
          <Link href={nearbySearchHref} className="ff-border rounded-full px-4 py-2 text-green-50/80 hover:bg-green-400/8">
            Search Nearby Matches
          </Link>
        </div>

        <div className="ff-panel mb-6 grid items-start gap-8 rounded-[2rem] p-6 md:grid-cols-[220px_minmax(0,1fr)] md:p-8">
          <div className="ff-border relative aspect-[2/3] overflow-hidden rounded-2xl bg-black/20 text-sm text-green-100/45 flex items-center justify-center">
            {movie.posterUrl ? (
              <Image src={movie.posterUrl} alt={`Poster for ${movie.title}`} fill className="h-full w-full object-cover" sizes="(max-width: 768px) 100vw, 220px" />
            ) : (
              <span className="ff-safe-wrap px-4 text-center">Archive image unavailable</span>
            )}
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.34em] text-green-300/70">Recovered Case File</p>
            <h1 className="ff-glow ff-safe-wrap mb-3 text-3xl font-bold text-green-50 sm:text-4xl md:text-5xl">{movie.title}</h1>
            <p className="mb-4 text-lg text-green-100/52">{movie.year}</p>
            <p className="ff-safe-wrap max-w-3xl text-sm leading-7 text-green-50/72 md:text-base">{movie.synopsis}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Fear Category: {getFearCategory(movie)}</span>
              <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Fear Index: {getFearIndex(movie)}/10</span>
              <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Scare: {movie.scareScore}/10</span>
              <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Realism: {movie.realismScore}/10</span>
              <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Disturbing: {movie.disturbingScore}/10</span>
              <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Weighted Score: {getScariestScore(movie)}/10</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {movie.tmdbUrl ? (
                <a
                  href={movie.tmdbUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ff-button inline-flex items-center rounded-full px-4 py-2 text-sm"
                >
                  View on TMDB
                </a>
              ) : null}
              <Link href={`/${movie.categories?.[0]}`} className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
                Open Category Route
              </Link>
            </div>
          </div>
        </div>

        <div className="ff-panel mb-8 rounded-2xl p-6">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="ff-safe-wrap text-2xl font-semibold text-green-50">Where To Watch</h2>
              <p className="ff-safe-wrap mt-1 text-sm text-green-100/56">
                No login required here. TMDB watch options stay current on their public page, and Amazon can be restored later when affiliate mode is enabled again.
              </p>
            </div>
            {showAmazonAffiliate ? (
              <span className="ff-border rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] text-green-50/72">
                Amazon First
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {showAmazonAffiliate && amazonWatchHref ? (
              <a
                href={amazonWatchHref}
                target="_blank"
                rel="noreferrer"
                className="ff-affiliate-button rounded-full px-4 py-2 text-sm"
              >
                Watch / Buy On Amazon
              </a>
            ) : null}
            {tmdbWatchHref ? (
              <a
                href={tmdbWatchHref}
                target="_blank"
                rel="noreferrer"
                className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8"
              >
                Open Live Watch Options
              </a>
            ) : null}
            {movie.tmdbUrl ? (
              <a
                href={movie.tmdbUrl}
                target="_blank"
                rel="noreferrer"
                className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8"
              >
                Open TMDB Record
              </a>
            ) : null}
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="ff-panel rounded-2xl p-6">
            <h2 className="ff-safe-wrap mb-3 text-2xl font-semibold">File Placement</h2>
            {movie.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-sm text-green-50/72">
                {movie.categories.map((category) => (
                  <Link key={category} href={`/${category}`} className="ff-border rounded-full px-3 py-1 text-green-50/78 hover:bg-green-400/8">
                    {categoryLabels[category] || category}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="ff-safe-wrap text-green-100/52">No category route has been assigned to this file yet.</p>
            )}

            <div className="mt-6">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Archive Flags</div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Beginner Friendly: {movie.beginnerFriendly ? "Yes" : "No"}</span>
                <span className="ff-border rounded-full px-3 py-1 text-green-50/78">Hidden Gem: {movie.hiddenGem ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          <div className="ff-panel rounded-2xl p-6">
            <h2 className="ff-safe-wrap mb-3 text-2xl font-semibold">Archive Lists</h2>
            {movieLists.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-sm text-green-50/72">
                {movieLists.map((list) => (
                  <Link key={list} href={`/lists/${list}`} className="ff-border rounded-full px-3 py-1 text-green-50/78 hover:bg-green-400/8">
                    {listLabels[list] || list}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="ff-safe-wrap text-green-100/52">This file has not been placed into a ranked route yet.</p>
            )}

            {movie.tags?.length ? (
              <div className="mt-6">
                <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Vault Tags</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {movie.tags.map((tag) => (
                    <Link key={tag} href={buildSearchHref({ tags: [tag] })} className="ff-border rounded-full px-3 py-1 text-green-50/78 hover:bg-green-400/8">
                      {formatRecommendationTag(tag)}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {recommendationContext ? (
          <details className="ff-panel mb-8 rounded-2xl p-6" open>
            <SectionSummary title="Recommendation Notes" />
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="ff-safe-wrap mb-3 text-xl font-semibold">Where It Fits Best</h2>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Categories</div>
                    <div className="flex flex-wrap gap-2">
                      {recommendationContext.whereItFitsBest.categories.map((category) => (
                        <Link key={category} href={`/${category}`} className="ff-border rounded-full px-3 py-1 text-sm text-green-50/78 hover:bg-green-400/8">
                          {categoryLabels[category] || category}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Lists</div>
                    <div className="flex flex-wrap gap-2">
                      {recommendationContext.whereItFitsBest.lists.map((listKey) => (
                        <Link key={listKey} href={`/lists/${listKey}`} className="ff-border rounded-full px-3 py-1 text-sm text-green-50/78 hover:bg-green-400/8">
                          {listLabels[listKey] || listKey}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {recommendationContext.whereItFitsBest.tags.map((tag) => (
                        <Link key={tag} href={buildSearchHref({ tags: [tag] })} className="ff-border rounded-full px-3 py-1 text-sm text-green-50/78 hover:bg-green-400/8">
                          {formatRecommendationTag(tag)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="ff-safe-wrap mb-3 text-xl font-semibold">Why It Was Recommended</h2>
                <ul className="space-y-3 text-green-50/72">
                  {recommendationContext.recommendationReasons.map((reason) => (
                    <li key={reason} className="ff-border rounded-xl bg-black/20 px-4 py-3">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        ) : null}

        {quizRecommendation ? (
          <details className="ff-panel mb-8 rounded-2xl p-6">
            <SectionSummary title="Quiz Match Notes" />
            <div className="mt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="ff-safe-wrap mb-1 text-xl font-semibold">Recommended From Your Quiz</h2>
                  <p className="ff-safe-wrap text-sm text-green-50/72">This explanation uses the exact quiz answers attached to the link you opened.</p>
                </div>
                <Link href={quizRecommendation.quizHref} className="ff-button rounded-full px-4 py-2 text-sm">
                  Back To Quiz Results
                </Link>
              </div>

              {quizRecommendation.selectedAnswers.length > 0 ? (
                <div className="mb-5">
                  <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">You Picked</div>
                  <div className="flex flex-wrap gap-2">
                    {quizRecommendation.selectedAnswers.map((answer) => (
                      <span key={answer.id} className="ff-border ff-safe-wrap rounded-full px-3 py-1 text-sm text-green-50/78">
                        {answer.label}: {answer.valueLabel}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Why This Matched</div>
                  <div className="flex flex-wrap gap-2">
                    {quizRecommendation.matchedTraits.length > 0 ? (
                      quizRecommendation.matchedTraits.map((trait) => (
                        <span key={trait} className="ff-border rounded-full px-3 py-1 text-sm text-green-50/78">
                          {trait}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-green-100/52">This title survived mainly on overall ranking tie-breakers rather than direct trait hits.</span>
                    )}
                  </div>
                </div>

                {quizRecommendation.fit ? (
                  <div>
                    <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Recommendation Fit</div>
                    <div className="space-y-3 text-sm text-green-50/78">
                      {quizRecommendation.fit.categories?.length ? <div>Categories: {quizRecommendation.fit.categories.map((category) => categoryLabels[category] || category).join(", ")}</div> : null}
                      {quizRecommendation.fit.lists?.length ? <div>Lists: {quizRecommendation.fit.lists.map((listKey) => listLabels[listKey] || listKey).join(", ")}</div> : null}
                      {quizRecommendation.fit.tags?.length ? <div>Tags: {quizRecommendation.fit.tags.map((tag) => formatRecommendationTag(tag)).join(", ")}</div> : null}
                      {quizRecommendation.fit.quizTraits?.length ? <div>Quiz Traits: {quizRecommendation.fit.quizTraits.join(", ")}</div> : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </details>
        ) : null}

        {quizProfile.length > 0 ? (
          <details className="ff-panel mt-8 rounded-2xl p-6">
            <SectionSummary title="Manual Quiz Traits" />
            <div className="mt-5">
              <p className="ff-safe-wrap mb-4 text-green-100/56">
                This title has manual quiz traits attached, so the quiz can explain exactly why it matches a viewer profile.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {quizProfile.map((item) => (
                  <div key={item.label} className="ff-border rounded-xl bg-black/20 px-4 py-3">
                    <div className="mb-1 text-xs uppercase tracking-[0.18em] text-green-300/70">{item.label}</div>
                    <div className="text-sm text-green-50/78">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </details>
        ) : null}

        {relatedMovies.length > 0 ? (
          <div className="ff-panel mt-8 rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="ff-safe-wrap mb-1 text-2xl font-semibold">Related Movies</h2>
                <p className="ff-safe-wrap text-sm text-green-100/56">Similar files based on shared category, list placement, tags, and quiz traits.</p>
              </div>
              <Link href="/search" className="ff-link text-sm">
                Open full search
              </Link>
            </div>
            <div className="space-y-2">
              {relatedMovies.map((related) => (
                <div
                  key={related.movie.slug}
                  className="ff-border rounded-2xl bg-black/20 p-4 transition hover:bg-green-400/8"
                >
                  <div className="flex gap-4">
                    <Link href={quizMode ? buildQuizHref(quizMode, quizAnswers, `/movie/${related.movie.slug}`) : `/movie/${related.movie.slug}`} className="shrink-0">
                      {related.movie.posterUrl ? (
                        <Image
                          src={related.movie.posterUrl}
                          alt={`${related.movie.title} poster`}
                          width={76}
                          height={112}
                          className="h-28 w-[76px] rounded-lg object-cover"
                          sizes="76px"
                        />
                      ) : (
                        <div className="ff-panel flex h-28 w-[76px] items-center justify-center rounded-lg px-2 text-center text-[10px] uppercase tracking-[0.16em] text-green-100/45">
                          Image Missing
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={quizMode ? buildQuizHref(quizMode, quizAnswers, `/movie/${related.movie.slug}`) : `/movie/${related.movie.slug}`} className="block">
                        <div className="ff-safe-wrap mb-1 text-lg font-semibold text-green-50 hover:text-green-200">{related.movie.title}</div>
                        <div className="mb-2 text-sm text-green-100/52">{related.movie.year}</div>
                        <p className="ff-safe-wrap mb-3 line-clamp-2 text-sm text-green-50/68">{related.movie.synopsis}</p>
                      </Link>
                      <div className="flex flex-wrap gap-2 text-xs text-green-50/72">
                        {related.reasons.map((reason) => (
                          <span key={reason} className="ff-border ff-safe-wrap rounded-full px-2 py-1">
                            {reason}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <Link
                          href={quizMode ? buildQuizHref(quizMode, quizAnswers, `/movie/${related.movie.slug}`) : `/movie/${related.movie.slug}`}
                          className="ff-border rounded-full px-3 py-1 text-green-50/80 hover:bg-green-400/8"
                        >
                          Open Case File
                        </Link>
                        {showAmazonAffiliate ? (
                          <a
                            href={buildAmazonWatchHref(related.movie)}
                            target="_blank"
                            rel="noreferrer"
                            className="ff-affiliate-button rounded-full px-3 py-1 text-green-50"
                          >
                            View On Amazon
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
