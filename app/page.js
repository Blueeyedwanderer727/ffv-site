import { movies } from "./data/movies";
import { categoryLabels, listLabels } from "./data/labels";
import { buildSearchHref, getMovieCountForFilters } from "./data/searchFilters";
import { buildSearchHrefForQuiz } from "./data/quiz";
import { getFearCategory, getFearIndex, getListKeysForMovie } from "./data/listRankings";
import Image from "next/image";
import Link from "next/link";
import MovieListItem from "./components/MovieListItem";
import HomeVhsIntro from "./components/HomeVhsIntro";
import HomeTrailerTV from "./components/HomeTrailerTV";

function getFeaturedCaseStatus(movie) {
  const fearCategory = getFearCategory(movie);

  if (fearCategory === "Extreme Terror" || fearCategory === "Terrifying") {
    return { label: "Flagged", tone: "alert" };
  }

  if (movie.hiddenGem) {
    return { label: "Underseen", tone: "muted" };
  }

  if (movie.beginnerFriendly) {
    return { label: "Cleared", tone: "clear" };
  }

  if (Number(movie.realismScore) >= 8) {
    return { label: "Verified", tone: "verified" };
  }

  return { label: "Active", tone: "standard" };
}

function getFeaturedCaseAnnotation(movie, categoryLabel, listLabel) {
  const fearCategory = getFearCategory(movie).toLowerCase();
  const fearIndex = getFearIndex(movie);

  if (listLabel === "Movies That Feel Real") {
    return `Realism ${movie.realismScore}/10 keeps this file in the evidence-heavy stack; fear index ${fearIndex}/10 pushes it into the ${fearCategory} band.`;
  }

  if (listLabel === "Most Disturbing") {
    return `Disturbing level ${movie.disturbingLevel || movie.disturbingScore}/10 is doing the sorting work here, with fear index ${fearIndex}/10 used to separate adjacent files.`;
  }

  if (listLabel === "Scariest") {
    return `Primary filing stays under ${categoryLabel || "general archive"}; the ${fearCategory} band and scare score ${movie.scareScore}/10 keep this in the upper panic routes.`;
  }

  if (movie.hiddenGem || listLabel === "Hidden Gems") {
    return `Filed as an underseen ${categoryLabel ? categoryLabel.toLowerCase() : "archive"} route, with recommendation weight ${movie.recommendationScore}/10 backing the pull.`;
  }

  if (movie.beginnerFriendly || listLabel === "Beginner Friendly") {
    return `Cleared for newer viewers, but still anchored under ${categoryLabel || "core archive"} with a ${fearCategory} fear band.`;
  }

  return `Primary category remains ${categoryLabel || "general archive"}; fear index ${fearIndex}/10 keeps the case filed under the ${fearCategory} lane.`;
}

const discoveryPresets = [
  {
    title: "Start Soft",
    description: "Lower-intensity picks for people easing into found footage.",
    filters: { sort: "scare-asc", maxScore: 5, maxFearIndex: 5, fearCategory: "Mild" },
    icon: "access",
    note: "Built as a low-intensity search route: lower scare score, lower fear index, and a mild fear category so the archive opens with safer first-watch files.",
  },
  {
    title: "Feel Too Real",
    description: "Search for titles with realism and dread pushed high together.",
    filters: { sort: "fear-desc", minFearIndex: 7, fearCategory: "Terrifying" },
    icon: "realism",
    note: "Built to push realism and dread together: higher fear index, a terrifying fear category, and descending fear sort so the results skew invasive and harsh.",
  },
  {
    title: "Creeping Paranoia",
    description: "A quick jump into psychological dread and mid-to-high fear.",
    filters: { category: "psychological", sort: "fear-desc", minFearIndex: 6.5 },
    icon: "mind",
    note: "Built around the psychological route with mid-to-high fear already pinned, so the search starts in paranoia-heavy files instead of general found footage traffic.",
  },
];

const editorRoutes = [
  {
    title: "Screenlife + Terrifying",
    description: "Desktop-native panic with the fear category already pinned to Terrifying.",
    filters: { category: "screenlife", fearCategory: "Terrifying", sort: "fear-desc" },
    icon: "screen",
    note: "An editor-made compound route that pre-combines the Screenlife category with the Terrifying fear band so the search opens in digital panic instead of broad category browse mode.",
  },
  {
    title: "Beginner Friendly + Realism 7+",
    description: "Grounded gateway films that stay accessible without feeling disposable.",
    filters: { beginnerFriendly: true, minRealismScore: 7, sort: "fear-desc" },
    icon: "brief-ranking",
    note: "An editor-made bridge between approachability and realism: it keeps the beginner-friendly gate on while forcing realism to stay at 7 or above.",
  },
];

const categoryPresets = [
  "psychological",
  "screenlife",
  "haunted-location",
  "cult-conspiracy",
];

const categoryBrowseKeys = [
  "alien",
  "anthology",
  "cryptid",
  "cult-conspiracy",
  "haunted-location",
  "monster",
  "possession",
  "psychological",
  "screenlife",
  "serial-killer",
  "witchcraft",
  "zombie-infection",
];

const categoryBrowseIcons = {
  alien: "encounter",
  anthology: "reel",
  cryptid: "tracks",
  "cult-conspiracy": "board",
  "haunted-location": "site",
  monster: "entity",
  possession: "sigil",
  psychological: "mind",
  screenlife: "screen",
  "serial-killer": "target",
  witchcraft: "occult",
  "zombie-infection": "outbreak",
};

const recommendationLaunchers = [
  {
    title: "Open Fear Experiment",
    description: "The branded front door for the recommendation engine: quiz entry, result lanes, and fear archetype thinking in one section.",
    href: "/fear-experiment",
    label: "Open Fear Experiment",
    tone: "feature",
  },
  {
    title: "Gateway Found Footage Night",
    description: "Prefilled search for lower-intensity, more grounded, beginner-friendly picks that still feel essential.",
    href: buildSearchHrefForQuiz("simple", {
      scareLevel: "low",
      realismMode: "realistic",
      pace: "slow-burn",
      beginnerMode: "beginner-friendly",
      discoveryMode: "classic",
    }),
    label: "Open Gateway Search",
    tone: "search",
  },
  {
    title: "Hidden Gem Damage Run",
    description: "Prefilled search for harsher, faster, less beginner-friendly picks with a deeper-cut bias.",
    href: buildSearchHrefForQuiz("simple", {
      scareLevel: "high",
      realismMode: "supernatural",
      pace: "relentless",
      beginnerMode: "no-limits",
      discoveryMode: "hidden-gem",
    }),
    label: "Open Damage Search",
    tone: "search",
  },
];

const operationalRoutes = [
  {
    eyebrow: "Live Route",
    title: "Fear Experiment",
    description: "Four live quiz tracks, two lockable bonus labs, and recommendation lanes already wired into the vault.",
    href: "/fear-experiment",
    label: "Open Fear Experiment",
    icon: "brief-search",
    note: "This route exists as the recommendation-engine front door: quiz input, locked bonus labs, and Fear Experiment handoff logic all converge here.",
  },
  {
    eyebrow: "Live Route",
    title: "Search Console",
    description: "The strongest operational surface for filtering by fear index, realism, category, list, and recommendation weight.",
    href: "/search",
    label: "Open Search",
    icon: "board",
    note: "This is the main control surface for vault discovery. It exposes the deepest combination of category, list, fear, realism, and recommendation filters in one place.",
  },
  {
    eyebrow: "Live Route",
    title: "Ranked Lists",
    description: "Scariest, most disturbing, beginner-friendly, realism-heavy, and top recommended routes are ready to use now.",
    href: "/lists",
    label: "Open Lists",
    icon: "priority",
    note: "This route collects the spreadsheet-derived ranking systems into one board, so users can jump directly into stable ordered discovery instead of browsing raw search first.",
  },
  {
    eyebrow: "Live Route",
    title: "Category Archive",
    description: "Direct subgenre browsing across alien, haunted, possession, screenlife, cult, and other active archive routes.",
    href: "/categories",
    label: "Open Categories",
    icon: "brief-category",
    note: "This route gives direct taxonomy access for users who already know the subgenre or threat type they want and do not need a ranking or quiz to start.",
  },
  {
    eyebrow: "Support Route",
    title: "Support The Vault",
    description: "See how locked labs, share-based unlocks, and future paid Fear Experiment drops are being framed.",
    href: "/support",
    label: "Open Support",
    icon: "access",
    note: "This route sets expectations around locked labs, future unlock campaigns, and the staged support layer without pretending a complete funding flow already exists.",
  },
];

const topListRoutes = [
  {
    title: "Scariest",
    href: "/lists/scariest",
    icon: "threat",
    note: "Ordered from spreadsheet scoring with disturbing level weighted highest, then jump-scare level, then realism, with tie breaks from fear index and recommendation score.",
  },
  {
    title: "Beginner Friendly",
    href: "/lists/beginner-friendly",
    icon: "access",
    note: "Pulls from titles flagged as beginner-friendly, then keeps the route safer by preferring stronger recommendations with lower fear and realism extremes.",
  },
  {
    title: "Top 25 Most Recommended",
    href: "/lists/top-25-most-recommended",
    icon: "priority",
    note: "Restricted to titles with recommendation scores of 9 or higher, then ordered by recommendation score, fear index, and scariest score.",
  },
  {
    title: "Hidden Gems",
    href: "/lists/hidden-gems",
    icon: "gem",
    note: "Uses the hidden-gem flag as the gate, then ranks deeper cuts by recommendation score, fear index, and scariest score so discovery stays intentional.",
  },
  {
    title: "Most Disturbing",
    href: "/lists/most-disturbing",
    icon: "damage",
    note: "Built directly from disturbing-level severity, with fear index and recommendation score used when multiple files land on the same damage level.",
  },
  {
    title: "Movies That Feel Real",
    href: "/lists/movies-that-feel-real",
    icon: "realism",
    note: "Prioritizes realism score first, then uses fear index and recommendation score to separate the most convincing evidence-style films.",
  },
];

const spotlightFiles = [
  {
    code: "CF-01",
    slug: "the-blair-witch-project-1999",
    title: "The Blair Witch Project",
    year: 1999,
    tag: "Essential",
    desc: "The landmark tape that made the woods feel cursed forever.",
    href: "/movie/the-blair-witch-project-1999",
  },
  {
    code: "CF-02",
    slug: "rec-2007",
    title: "REC",
    year: 2007,
    tag: "Panic Spiral",
    desc: "Claustrophobic, chaotic, and one of the strongest found footage experiences.",
    href: "/movie/rec-2007",
  },
  {
    code: "CF-03",
    slug: "hell-house-llc-2015",
    title: "Hell House LLC",
    year: 2015,
    tag: "Fan Favorite",
    desc: "A haunted attraction nightmare with major late-night watch energy.",
    href: "/movie/hell-house-llc-2015",
  },
  {
    code: "CF-04",
    slug: "lake-mungo-2008",
    title: "Lake Mungo",
    year: 2008,
    tag: "Disturbing",
    desc: "Quiet, eerie, and emotionally unsettling in all the right ways.",
    href: "/movie/lake-mungo-2008",
  },
];

const trailerChannels = [
  {
    slug: "the-blair-witch-project-1999",
    fallbackTrailerKey: "AcTh2YItSaM",
  },
  {
    slug: "rec-2007",
    fallbackTrailerKey: "OeaUokzE9fI",
  },
  {
    slug: "hell-house-llc-2015",
    fallbackTrailerKey: "FQtqL6UskEY",
  },
  {
    slug: "lake-mungo-2008",
    fallbackTrailerKey: "4n8WNQ9kOac",
  },
  {
    slug: "as-above-so-below-2014",
    fallbackTrailerKey: "wVuv1Ey3oIM",
  },
  {
    slug: "afflicted-2014",
    fallbackTrailerKey: "PtfSuXbPYUU",
  },
  {
    slug: "apollo-18-2011",
    fallbackTrailerKey: "XK_u4GnJAMU",
  },
  {
    slug: "be-my-cat-a-film-for-anne-2015",
    fallbackTrailerKey: "e3J9fNrKE6U",
  },
];

export default function Home() {
  const featuredMovies = movies.slice(0, 12);
  const spotlightEntries = spotlightFiles.map((file) => {
    const movie = movies.find((entry) => entry.slug === file.slug);
    const categoryKey = movie?.categories?.[0] || null;
    const listKey = movie ? getListKeysForMovie(movie)[0] : null;
    const categoryLabel = categoryKey ? categoryLabels[categoryKey] : null;
    const listLabel = listKey ? listLabels[listKey] : null;
    const status = movie ? getFeaturedCaseStatus(movie) : { label: "Active", tone: "standard" };

    return {
      ...file,
      categoryLabel,
      listLabel,
      posterUrl: movie?.posterUrl ?? null,
      annotation: movie ? getFeaturedCaseAnnotation(movie, categoryLabel, listLabel) : "Recovered archive file.",
      status,
    };
  });
  const trailerMovies = trailerChannels
    .map((channel) => {
      const movie = movies.find((entry) => entry.slug === channel.slug);

      if (!movie?.tmdbUrl) {
        return null;
      }

      return {
        ...movie,
        fallbackTrailerKey: channel.fallbackTrailerKey,
      };
    })
    .filter(Boolean);
  const discoveryLinks = discoveryPresets.map((preset) => ({
    ...preset,
    href: buildSearchHref(preset.filters),
    count: getMovieCountForFilters(movies, preset.filters),
  }));
  const editorRouteLinks = editorRoutes.map((route) => ({
    ...route,
    href: buildSearchHref(route.filters),
    count: getMovieCountForFilters(movies, route.filters),
  }));
  const categoryQuickLinks = categoryPresets.map((categoryKey) => ({
    key: categoryKey,
    label: categoryLabels[categoryKey],
    href: buildSearchHref({ category: categoryKey }),
    count: getMovieCountForFilters(movies, { category: categoryKey }),
  }));
  const browseCategoryRoutes = categoryBrowseKeys.map((categoryKey) => ({
    key: categoryKey,
    label: categoryLabels[categoryKey],
    href: `/${categoryKey}`,
    icon: categoryBrowseIcons[categoryKey],
    count: movies.filter((movie) => Array.isArray(movie.categories) && movie.categories.includes(categoryKey)).length,
  }));

  return (
    <HomeVhsIntro>
      <main className="min-h-screen px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <div className="ff-panel rounded-3xl p-6 md:p-10">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-green-300/70">
              Archived Visual Evidence
            </p>

            <h1 className="ff-glow ff-safe-wrap text-3xl font-bold uppercase tracking-[0.08em] text-green-100 sm:text-4xl md:text-6xl md:tracking-wide">
              Found Footage Vault
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-green-50/75 md:text-base">
              An operational discovery archive for found footage horror: live search,
              ranked lists, active category routes, and a quiz-driven recommendation engine
              built around the data already working in the vault.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-green-100/52">
              <span className="ff-border rounded-full px-3 py-2">Search Console Live</span>
              <span className="ff-border rounded-full px-3 py-2">4 Live Tracks + 2 Locked Labs</span>
              <span className="ff-border rounded-full px-3 py-2">Ranked Lists Active</span>
              <span className="ff-border rounded-full px-3 py-2">Category Routes Indexed</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/search" className="ff-button rounded-full px-5 py-2 text-sm font-semibold">
                Open Search
              </Link>
              <Link href="/fear-experiment" className="ff-button rounded-full px-5 py-2 text-sm font-semibold">
                Open Fear Experiment
              </Link>
              <Link href="/lists" className="ff-button rounded-full px-5 py-2 text-sm font-semibold">
                Open Ranked Lists
              </Link>
            </div>
          </div>
        </header>

        <HomeTrailerTV movies={trailerMovies} />

        <section className="mb-10 ff-board-surface ff-board-surface--evidence">
          <div className="ff-board-corner">Evidence</div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-green-300/60">
                Case Files
              </p>
              <h2 className="ff-safe-wrap text-2xl font-semibold text-green-50 md:text-3xl">
                Essential Found Footage Watches
              </h2>
              <p className="ff-board-filed">Filed Under Essential Evidence</p>
            </div>
          </div>

          <div className="ff-featured-case-grid grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {spotlightEntries.map((movie) => (
              <article key={movie.title} className="ff-featured-case">
                <div className="ff-featured-case__frame">
                  <span className="ff-featured-case__hardware" aria-hidden="true" />
                  <div className="ff-featured-case__topline">
                    <span className="ff-featured-case__code">{movie.code}</span>
                    <span className="ff-featured-case__tag">{movie.tag}</span>
                  </div>
                  <div className={`ff-featured-case__status ff-featured-case__status--${movie.status.tone}`}>
                    {movie.status.label}
                  </div>
                  <div className="ff-featured-case__body">
                    <div className="ff-featured-case__evidence">
                      <div className="ff-featured-case__photo">
                        {movie.posterUrl ? (
                          <Image
                            src={movie.posterUrl}
                            alt={`Poster evidence for ${movie.title}`}
                            fill
                            className="h-full w-full object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 180px"
                          />
                        ) : (
                          <span className="ff-featured-case__photo-fallback">Image pending</span>
                        )}
                      </div>
                      <div className="ff-featured-case__year">{movie.year}</div>
                    </div>
                    <div className="ff-featured-case__content">
                      <h3 className="ff-safe-wrap ff-featured-case__title">{movie.title}</h3>
                      <p className="ff-featured-case__copy">{movie.desc}</p>
                      <p className="ff-safe-wrap ff-featured-case__annotation">{movie.annotation}</p>
                    </div>
                  </div>
                  <div className="ff-featured-case__meta">
                    {movie.categoryLabel ? (
                      <span>{movie.categoryLabel}</span>
                    ) : null}
                    {movie.listLabel ? (
                      <span>{movie.listLabel}</span>
                    ) : null}
                  </div>
                  <Link href={movie.href} className="ff-button ff-featured-case__cta rounded-full px-4 py-2 text-sm">
                    Open Case File
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="ff-panel rounded-2xl p-5">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-green-300/60">
              Live Engine
            </p>
            <h3 className="mb-2 text-lg font-semibold text-green-50">
              Fear Experiment Suite
            </h3>
            <p className="text-sm leading-6 text-green-50/70">
              Four active quiz tracks plus two locked bonus labs that convert taste, fear tolerance, and subgenre preference into recommendation results.
            </p>
          </div>

          <div className="ff-panel rounded-2xl p-5">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-green-300/60">
              Live Lists
            </p>
            <h3 className="mb-2 text-lg font-semibold text-green-50">
              Ranked Vault Routes
            </h3>
            <p className="text-sm leading-6 text-green-50/70">
              Stable ranking surfaces for scariest, disturbing, realism-heavy, hidden-gem, and beginner-friendly discovery.
            </p>
          </div>

          <div className="ff-panel rounded-2xl p-5">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-green-300/60">
              Live Archive
            </p>
            <h3 className="mb-2 text-lg font-semibold text-green-50">
              Search + Category System
            </h3>
            <p className="text-sm leading-6 text-green-50/70">
              Filter by subgenre, tone, fear level, realism, and recommendation score or jump directly into active category routes.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {recommendationLaunchers.map((launcher) => (
            <Link
              key={launcher.title}
              href={launcher.href}
              className="ff-panel rounded-3xl p-6 transition hover:-translate-y-1"
            >
              <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">
                {launcher.tone === "feature" ? "Recommendation Engine" : "Quiz To Search"}
              </div>
              <div className="mb-2 text-2xl font-semibold text-green-50">{launcher.title}</div>
              <p className="mb-5 text-sm text-green-50/70">{launcher.description}</p>
              <span className="ff-button inline-flex rounded-full px-4 py-2 text-sm">
                {launcher.label}
              </span>
            </Link>
          ))}
          {operationalRoutes.slice(1, 2).map((route) => (
            <Link
              key={route.title}
              href={route.href}
              className="ff-panel rounded-3xl p-6 transition hover:-translate-y-1"
            >
              <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">Operational Route</div>
              <div className="mb-2 text-2xl font-semibold text-green-50">{route.title}</div>
              <p className="mb-5 text-sm text-green-50/70">{route.description}</p>
              <span className="ff-button inline-flex rounded-full px-4 py-2 text-sm">{route.label}</span>
            </Link>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="ff-panel ff-home-board ff-home-board--felt ff-home-discovery-panel rounded-3xl p-6 md:p-8">
            <h2 className="mb-3 text-2xl font-semibold text-green-50">Search by Feeling</h2>
            <p className="mb-5 text-green-50/70">
              Jump straight into curated search paths built around fear level, realism, and intensity.
            </p>
            <div className="ff-home-discovery-grid grid gap-3 md:grid-cols-3">
              {discoveryLinks.map((preset) => (
                <Link
                  key={preset.title}
                  href={preset.href}
                  className="ff-home-discovery-card"
                >
                  <div className="ff-home-discovery-card__frame">
                    <div className="ff-home-discovery-card__topline">
                      <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Preset</div>
                      <span className="rounded-full border border-green-400/20 px-2 py-0.5 text-xs text-green-100/80">
                        {preset.count}
                      </span>
                    </div>
                    <div className={`ff-dossier-card__icon-box ff-dossier-card__icon-box--${preset.icon} ff-dossier-card__icon-box--compact`} aria-hidden="true">
                      <span className="ff-dossier-card__icon-text">PATH</span>
                      <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--primary" />
                      <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--secondary" />
                    </div>
                    <div className="mb-2 text-lg font-semibold text-green-50">{preset.title}</div>
                    <div className="text-sm text-green-50/65">{preset.description}</div>
                    <div className="ff-home-discovery-card__hover" aria-hidden="true">
                      <p className="ff-dossier-card__hover-label">Why this route exists</p>
                      <p className="ff-safe-wrap ff-dossier-card__hover-copy">{preset.note}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-green-300/10 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-green-50">Editor&apos;s Routes</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-green-100/40">Direct combos</span>
              </div>
              <div className="ff-home-discovery-grid ff-home-discovery-grid--editor grid gap-3 md:grid-cols-2">
                {editorRouteLinks.map((route) => (
                  <Link
                    key={route.title}
                    href={route.href}
                    className="ff-home-discovery-card ff-home-discovery-card--editor"
                  >
                    <div className="ff-home-discovery-card__frame">
                      <div className="ff-home-discovery-card__topline">
                        <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Editor&apos;s route</div>
                        <span className="rounded-full border border-green-400/20 px-2 py-0.5 text-xs text-green-100/85">
                          {route.count}
                        </span>
                      </div>
                      <div className={`ff-dossier-card__icon-box ff-dossier-card__icon-box--${route.icon} ff-dossier-card__icon-box--compact`} aria-hidden="true">
                        <span className="ff-dossier-card__icon-text">EDIT</span>
                        <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--primary" />
                        <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--secondary" />
                      </div>
                      <div className="mb-2 text-lg font-semibold text-green-50">{route.title}</div>
                      <div className="text-sm text-green-50/70">{route.description}</div>
                      <div className="ff-home-discovery-card__hover" aria-hidden="true">
                        <p className="ff-dossier-card__hover-label">How this route was tuned</p>
                        <p className="ff-safe-wrap ff-dossier-card__hover-copy">{route.note}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="ff-panel ff-home-board ff-home-board--steel rounded-3xl p-6 md:p-8">
            <h2 className="mb-3 text-2xl font-semibold text-green-50">Fast Category Starts</h2>
            <p className="mb-5 text-green-50/70">
              Open search already narrowed to some of the vault&apos;s strongest subgenres.
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryQuickLinks.map((category) => (
                <Link
                  key={category.key}
                  href={category.href}
                  className="ff-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                >
                  <span>{category.label}</span>
                  <span className="rounded-full border border-green-300/20 px-2 py-0.5 text-xs text-green-50/80">
                    {category.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="ff-panel ff-home-board ff-home-board--blueprint rounded-3xl p-6 md:p-8">
            <h2 className="mb-3 text-2xl font-semibold text-green-50">Browse by Category</h2>
            <p className="ff-board-filed">Filed Under Taxonomy Routes</p>
            <div className="ff-home-category-grid">
              {browseCategoryRoutes.map((category) => (
                <Link key={category.key} href={category.href} className="ff-home-category-chip">
                  <div className="ff-home-category-chip__frame">
                    <div className={`ff-dossier-card__icon-box ff-dossier-card__icon-box--${category.icon} ff-home-category-chip__icon`} aria-hidden="true">
                      <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--primary" />
                      <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--secondary" />
                    </div>
                    <div className="ff-home-category-chip__body">
                      <span className="ff-home-category-chip__label">{category.label}</span>
                      <span className="ff-home-category-chip__count">{category.count}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="ff-panel ff-home-board ff-home-board--carbon rounded-3xl p-6 md:p-8">
            <h2 className="mb-3 text-2xl font-semibold text-green-50">What Makes It Different?</h2>
            <p className="mb-4 text-green-50/70">
              Found Footage Vault helps horror fans discover movies by category,
              scare style, realism, and curated experiences instead of digging
              through random streaming menus.
            </p>
            <p className="text-sm leading-7 text-green-100/55">
              The site now combines a searchable archive, recommendation-engine routes, branded quiz paths, and operational discovery surfaces built around what already has usable data.
            </p>
          </div>
        </section>

        <section id="lists" className="mt-10 ff-panel ff-home-board ff-home-board--ledger rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-green-50">Browse Top Lists</h2>
              <p className="ff-board-filed">Filed Under Ranking Routes</p>
            </div>
            <Link href="/lists" className="ff-link text-sm">
              View all lists
            </Link>
          </div>
          <div className="ff-home-route-grid grid gap-3 md:grid-cols-3">
            {topListRoutes.map((route) => (
              <Link key={route.title} href={route.href} className="ff-home-discovery-card ff-home-discovery-card--route">
                <div className="ff-home-discovery-card__frame">
                  <div className="ff-home-discovery-card__topline">
                    <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">List route</div>
                  </div>
                  <div className={`ff-dossier-card__icon-box ff-dossier-card__icon-box--${route.icon} ff-dossier-card__icon-box--compact`} aria-hidden="true">
                    <span className="ff-dossier-card__icon-text">LIST</span>
                    <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--primary" />
                    <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--secondary" />
                  </div>
                  <div className="mb-2 text-lg font-semibold text-green-50">{route.title}</div>
                  <div className="ff-home-discovery-card__hover" aria-hidden="true">
                    <p className="ff-dossier-card__hover-label">How this list is built</p>
                    <p className="ff-safe-wrap ff-dossier-card__hover-copy">{route.note}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 ff-panel ff-home-board ff-home-board--casefile rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-green-50">Operational Discovery Routes</h2>
              <p className="ff-board-filed">Filed Under Live Operations</p>
            </div>
            <span className="text-sm uppercase tracking-[0.18em] text-green-100/45">Live now</span>
          </div>
          <div className="ff-home-route-grid ff-home-route-grid--ops grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {operationalRoutes.map((route) => (
              <Link
                key={route.title}
                href={route.href}
                className="ff-home-discovery-card ff-home-discovery-card--route"
              >
                <div className="ff-home-discovery-card__frame">
                  <div className="ff-home-discovery-card__topline">
                    <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">{route.eyebrow}</div>
                  </div>
                  <div className={`ff-dossier-card__icon-box ff-dossier-card__icon-box--${route.icon} ff-dossier-card__icon-box--compact`} aria-hidden="true">
                    <span className="ff-dossier-card__icon-text">ROUTE</span>
                    <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--primary" />
                    <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--secondary" />
                  </div>
                  <div className="mb-2 text-xl font-semibold text-green-50">{route.title}</div>
                  <div className="mb-4 text-sm text-green-50/65">{route.description}</div>
                  <span className="ff-button inline-flex rounded-full px-4 py-2 text-sm">{route.label}</span>
                  <div className="ff-home-discovery-card__hover" aria-hidden="true">
                    <p className="ff-dossier-card__hover-label">Why this route matters</p>
                    <p className="ff-safe-wrap ff-dossier-card__hover-copy">{route.note}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 ff-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-green-50">Featured Movies</h2>
            <Link href="/search" className="ff-link text-sm">
              View all
            </Link>
          </div>
          <ul className="grid gap-3 text-green-50/75 md:grid-cols-2">
            {featuredMovies.map((movie) => (
              <MovieListItem key={movie.slug} movie={movie} />
            ))}
          </ul>
        </section>
        </div>
      </main>
    </HomeVhsIntro>
  );
}