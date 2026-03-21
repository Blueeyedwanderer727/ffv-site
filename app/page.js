"use client";
import { movies } from "./data/movies";
import { categoryLabels } from "./data/labels";
import { buildSearchHref, getMovieCountForFilters } from "./data/searchFilters";
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
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm uppercase tracking-[0.3em] text-red-500 mb-4">
          Found Footage Horror Database
        </p>
        <h1 className="text-5xl font-bold mb-6 text-center">
          Found Footage Vault
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-10 text-center">
          Discover the best found footage horror films by category, scare style, realism, and curated lists. Start your journey below.
        </p>

        <div className="flex justify-center mb-10">
          <Link
            href="/search"
            className="rounded-full border border-red-700 bg-red-950/40 px-5 py-3 text-sm font-medium text-red-200 hover:bg-red-950/70"
          >
            Search All {movies.length} Movies
          </Link>
        </div>

        <div className="grid gap-6 mb-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-2xl font-semibold mb-3">Search by Feeling</h2>
            <p className="text-gray-300 mb-5">
              Jump straight into curated search paths built around fear level, realism, and intensity.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {discoveryLinks.map((preset) => (
                <Link
                  key={preset.title}
                  href={preset.href}
                  className="rounded-2xl border border-gray-800 bg-black/40 p-4 hover:border-red-700 hover:bg-red-950/20"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm uppercase tracking-[0.18em] text-red-400">Preset</div>
                    <span className="rounded-full border border-gray-700 px-2 py-0.5 text-xs text-gray-300">
                      {preset.count}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">{preset.title}</div>
                  <div className="text-sm text-gray-400">{preset.description}</div>
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-800 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">Editor&apos;s Routes</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-gray-500">Direct combos</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {editorRouteLinks.map((route) => (
                  <Link
                    key={route.title}
                    href={route.href}
                    className="rounded-2xl border border-red-900/40 bg-red-950/15 p-4 hover:border-red-700 hover:bg-red-950/30"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="text-sm uppercase tracking-[0.18em] text-red-300">Editor&apos;s route</div>
                      <span className="rounded-full border border-red-900/50 px-2 py-0.5 text-xs text-red-100">
                        {route.count}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-white mb-2">{route.title}</div>
                    <div className="text-sm text-gray-300">{route.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-red-900/40 rounded-2xl p-6 bg-red-950/20">
            <h2 className="text-2xl font-semibold mb-3">Fast Category Starts</h2>
            <p className="text-gray-300 mb-5">
              Open search already narrowed to some of the vault&apos;s strongest subgenres.
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryQuickLinks.map((category) => (
                <Link
                  key={category.key}
                  href={category.href}
                  className="inline-flex items-center gap-2 rounded-full border border-red-900/60 px-4 py-2 text-sm text-red-100 hover:border-red-700 hover:text-white"
                >
                  <span>{category.label}</span>
                  <span className="rounded-full border border-red-900/60 px-2 py-0.5 text-xs text-red-100/90">
                    {category.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-2xl font-semibold mb-3">Browse by Category</h2>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/alien" className="hover:text-red-400">Alien</a></li>
              <li><a href="/anthology" className="hover:text-red-400">Anthology</a></li>
              <li><a href="/cryptid" className="hover:text-red-400">Cryptid</a></li>
              <li><a href="/cult-conspiracy" className="hover:text-red-400">Cult / Conspiracy</a></li>
              <li><a href="/haunted-location" className="hover:text-red-400">Haunted Location</a></li>
              <li><a href="/monster" className="hover:text-red-400">Monster</a></li>
              <li><a href="/possession" className="hover:text-red-400">Possession</a></li>
              <li><a href="/psychological" className="hover:text-red-400">Psychological</a></li>
              <li><a href="/screenlife" className="hover:text-red-400">Screenlife</a></li>
              <li><a href="/serial-killer" className="hover:text-red-400">Serial Killer</a></li>
              <li><a href="/witchcraft" className="hover:text-red-400">Witchcraft</a></li>
              <li><a href="/zombie-infection" className="hover:text-red-400">Zombie / Infection</a></li>
            </ul>
          </div>
          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-2xl font-semibold mb-3">What Makes It Different?</h2>
            <p className="text-gray-300">
              Found Footage Vault helps horror fans discover movies by category,
              scare style, realism, and curated experiences instead of digging
              through random streaming menus.
            </p>
          </div>
        </div>

        {/* Top Lists Cards */}
        <div id="lists" className="border border-red-900/40 rounded-2xl p-6 bg-red-950/20 mt-10">
          <h2 className="text-2xl font-semibold mb-3">Browse Top Lists</h2>
          <ul className="space-y-2 text-gray-300">
            <li><a href="/lists/scariest" className="hover:text-red-400">Scariest</a></li>
            <li><a href="/lists/beginner-friendly" className="hover:text-red-400">Beginner Friendly</a></li>
            <li><a href="/lists/top-25-most-recommended" className="hover:text-red-400">Top 25 Most Recommended</a></li>
            <li><a href="/lists/hidden-gems" className="hover:text-red-400">Hidden Gems</a></li>
            <li><a href="/lists/most-disturbing" className="hover:text-red-400">Most Disturbing</a></li>
            <li><a href="/lists/movies-that-feel-real" className="hover:text-red-400">Movies That Feel Real</a></li>
          </ul>
        </div>

        <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950 mt-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-semibold">Featured Movies</h2>
            <Link href="/search" className="text-sm text-red-400 hover:text-red-300">
              View all
            </Link>
          </div>
          <ul className="grid md:grid-cols-2 gap-3 text-gray-300">
            {featuredMovies.map((movie) => (
              <MovieListItem key={movie.slug} movie={movie} />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}