import { movies } from "./data/movies";
import { categoryLabels } from "./data/labels";
import { buildSearchHref, getMovieCountForFilters } from "./data/searchFilters";
import { buildSearchHrefForQuiz } from "./data/quiz";
import Link from "next/link";
import MovieListItem from "./components/MovieListItem";

const discoveryPresets = [
  {
    title: "Start Soft",
    description: "Lower-intensity picks for people easing into found footage.",
    filters: { sort: "scare-asc", maxScore: 5, maxFearIndex: 5, fearCategory: "Mild" },
  },
  {
    title: "Feel Too Real",
    description: "Search for titles with realism and dread pushed high together.",
    filters: { sort: "fear-desc", minFearIndex: 7, fearCategory: "Terrifying" },
  },
  {
    title: "Creeping Paranoia",
    description: "A quick jump into psychological dread and mid-to-high fear.",
    filters: { category: "psychological", sort: "fear-desc", minFearIndex: 6.5 },
  },
];

const editorRoutes = [
  {
    title: "Screenlife + Terrifying",
    description: "Desktop-native panic with the fear category already pinned to Terrifying.",
    filters: { category: "screenlife", fearCategory: "Terrifying", sort: "fear-desc" },
  },
  {
    title: "Beginner Friendly + Realism 7+",
    description: "Grounded gateway films that stay accessible without feeling disposable.",
    filters: { beginnerFriendly: true, minRealismScore: 7, sort: "fear-desc" },
  },
];

const categoryPresets = [
  "psychological",
  "screenlife",
  "haunted-location",
  "cult-conspiracy",
];

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
  },
  {
    eyebrow: "Live Route",
    title: "Search Console",
    description: "The strongest operational surface for filtering by fear index, realism, category, list, and recommendation weight.",
    href: "/search",
    label: "Open Search",
  },
  {
    eyebrow: "Live Route",
    title: "Ranked Lists",
    description: "Scariest, most disturbing, beginner-friendly, realism-heavy, and top recommended routes are ready to use now.",
    href: "/lists",
    label: "Open Lists",
  },
  {
    eyebrow: "Live Route",
    title: "Category Archive",
    description: "Direct subgenre browsing across alien, haunted, possession, screenlife, cult, and other active archive routes.",
    href: "/categories",
    label: "Open Categories",
  },
  {
    eyebrow: "Support Route",
    title: "Support The Vault",
    description: "See how locked labs, share-based unlocks, and future paid Fear Experiment drops are being framed.",
    href: "/support",
    label: "Open Support",
  },
];

const spotlightFiles = [
  {
    title: "The Blair Witch Project",
    year: 1999,
    tag: "Essential",
    desc: "The landmark tape that made the woods feel cursed forever.",
    href: "/movie/the-blair-witch-project-1999",
  },
  {
    title: "REC",
    year: 2007,
    tag: "Panic Spiral",
    desc: "Claustrophobic, chaotic, and one of the strongest found footage experiences.",
    href: "/movie/rec-2007",
  },
  {
    title: "Hell House LLC",
    year: 2015,
    tag: "Fan Favorite",
    desc: "A haunted attraction nightmare with major late-night watch energy.",
    href: "/movie/hell-house-llc-2015",
  },
  {
    title: "Lake Mungo",
    year: 2008,
    tag: "Disturbing",
    desc: "Quiet, eerie, and emotionally unsettling in all the right ways.",
    href: "/movie/lake-mungo-2008",
  },
];

export default function Home() {
  const featuredMovies = movies.slice(0, 12);
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

  return (
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

        <section className="mb-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-green-300/60">
                Case Files
              </p>
              <h2 className="ff-safe-wrap text-2xl font-semibold text-green-50 md:text-3xl">
                Essential Found Footage Watches
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {spotlightFiles.map((movie) => (
              <article
                key={movie.title}
                className="ff-panel rounded-2xl p-5 transition duration-200 hover:-translate-y-1"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs uppercase tracking-wider text-green-200">
                    {movie.tag}
                  </span>
                  <span className="text-sm text-green-100/60">{movie.year}</span>
                </div>

                <h3 className="mb-2 text-xl font-semibold text-green-50">
                  {movie.title}
                </h3>

                <p className="text-sm leading-6 text-green-50/70">
                  {movie.desc}
                </p>

                <Link href={movie.href} className="mt-5 inline-block text-sm font-medium text-green-300 hover:text-green-200">
                  Open Movie →
                </Link>
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
          <div className="ff-panel rounded-3xl p-6 md:p-8">
            <h2 className="mb-3 text-2xl font-semibold text-green-50">Search by Feeling</h2>
            <p className="mb-5 text-green-50/70">
              Jump straight into curated search paths built around fear level, realism, and intensity.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {discoveryLinks.map((preset) => (
                <Link
                  key={preset.title}
                  href={preset.href}
                  className="ff-border rounded-2xl bg-black/20 p-4 transition hover:-translate-y-1 hover:bg-green-400/8"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Preset</div>
                    <span className="rounded-full border border-green-400/20 px-2 py-0.5 text-xs text-green-100/80">
                      {preset.count}
                    </span>
                  </div>
                  <div className="mb-2 text-lg font-semibold text-green-50">{preset.title}</div>
                  <div className="text-sm text-green-50/65">{preset.description}</div>
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-green-300/10 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-green-50">Editor&apos;s Routes</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-green-100/40">Direct combos</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {editorRouteLinks.map((route) => (
                  <Link
                    key={route.title}
                    href={route.href}
                    className="ff-border rounded-2xl bg-green-400/6 p-4 transition hover:-translate-y-1 hover:bg-green-400/10"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Editor&apos;s route</div>
                      <span className="rounded-full border border-green-400/20 px-2 py-0.5 text-xs text-green-100/85">
                        {route.count}
                      </span>
                    </div>
                    <div className="mb-2 text-lg font-semibold text-green-50">{route.title}</div>
                    <div className="text-sm text-green-50/70">{route.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="ff-panel rounded-3xl p-6 md:p-8">
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
          <div className="ff-panel rounded-3xl p-6 md:p-8">
            <h2 className="mb-3 text-2xl font-semibold text-green-50">Browse by Category</h2>
            <ul className="grid gap-2 text-green-50/75 sm:grid-cols-2">
              <li><Link href="/alien" className="ff-link">Alien</Link></li>
              <li><Link href="/anthology" className="ff-link">Anthology</Link></li>
              <li><Link href="/cryptid" className="ff-link">Cryptid</Link></li>
              <li><Link href="/cult-conspiracy" className="ff-link">Cult / Conspiracy</Link></li>
              <li><Link href="/haunted-location" className="ff-link">Haunted Location</Link></li>
              <li><Link href="/monster" className="ff-link">Monster</Link></li>
              <li><Link href="/possession" className="ff-link">Possession</Link></li>
              <li><Link href="/psychological" className="ff-link">Psychological</Link></li>
              <li><Link href="/screenlife" className="ff-link">Screenlife</Link></li>
              <li><Link href="/serial-killer" className="ff-link">Serial Killer</Link></li>
              <li><Link href="/witchcraft" className="ff-link">Witchcraft</Link></li>
              <li><Link href="/zombie-infection" className="ff-link">Zombie / Infection</Link></li>
            </ul>
          </div>

          <div className="ff-panel rounded-3xl p-6 md:p-8">
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

        <section id="lists" className="mt-10 ff-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-green-50">Browse Top Lists</h2>
            <Link href="/lists" className="ff-link text-sm">
              View all lists
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/lists/scariest" className="ff-border rounded-2xl bg-black/20 p-4 text-green-50/75 transition hover:bg-green-400/8">Scariest</Link>
            <Link href="/lists/beginner-friendly" className="ff-border rounded-2xl bg-black/20 p-4 text-green-50/75 transition hover:bg-green-400/8">Beginner Friendly</Link>
            <Link href="/lists/top-25-most-recommended" className="ff-border rounded-2xl bg-black/20 p-4 text-green-50/75 transition hover:bg-green-400/8">Top 25 Most Recommended</Link>
            <Link href="/lists/hidden-gems" className="ff-border rounded-2xl bg-black/20 p-4 text-green-50/75 transition hover:bg-green-400/8">Hidden Gems</Link>
            <Link href="/lists/most-disturbing" className="ff-border rounded-2xl bg-black/20 p-4 text-green-50/75 transition hover:bg-green-400/8">Most Disturbing</Link>
            <Link href="/lists/movies-that-feel-real" className="ff-border rounded-2xl bg-black/20 p-4 text-green-50/75 transition hover:bg-green-400/8">Movies That Feel Real</Link>
          </div>
        </section>

        <section className="mt-10 ff-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-green-50">Operational Discovery Routes</h2>
            <span className="text-sm uppercase tracking-[0.18em] text-green-100/45">Live now</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {operationalRoutes.map((route) => (
              <Link
                key={route.title}
                href={route.href}
                className="ff-border rounded-2xl bg-black/20 p-5 transition hover:-translate-y-1 hover:bg-green-400/8"
              >
                <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">{route.eyebrow}</div>
                <div className="mb-2 text-xl font-semibold text-green-50">{route.title}</div>
                <div className="mb-4 text-sm text-green-50/65">{route.description}</div>
                <span className="ff-button inline-flex rounded-full px-4 py-2 text-sm">{route.label}</span>
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
  );
}