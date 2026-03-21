import { movies } from "../../data/movies";
import { categoryLabels, listLabels } from "../../data/labels";
import { getFearCategory, getFearIndex, getListKeysForMovie, getScariestScore } from "../../data/listRankings";
import Link from "next/link";
import { use } from "react";

export default function MoviePage({ params }) {
  const { slug } = use(params);
  const movie = movies.find((m) => m.slug === slug);
  const movieLists = movie ? getListKeysForMovie(movie) : [];

  if (!movie) {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-red-400 hover:text-red-300 inline-block mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-6">Movie Not Found</h1>
          <p className="text-gray-400">Sorry, this movie does not exist or could not be found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-red-400 hover:text-red-300 inline-block mb-6"
        >
          ← Back to Home
        </Link>

        <div className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] items-start mb-8">
          <div className="border border-gray-800 rounded-2xl bg-neutral-950 overflow-hidden aspect-[2/3] flex items-center justify-center text-sm text-gray-500">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={`Poster for ${movie.title}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>No Poster</span>
            )}
          </div>

          <div>
            <h1 className="text-5xl font-bold mb-3">{movie.title}</h1>
            <p className="text-gray-400 text-lg mb-4">{movie.year}</p>
            {movie.tmdbUrl ? (
              <a
                href={movie.tmdbUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-red-900/60 px-4 py-2 text-sm text-red-300 hover:border-red-700 hover:text-red-200"
              >
                View on TMDB
              </a>
            ) : null}
          </div>
        </div>

        <div className="border border-red-900/40 rounded-2xl p-6 bg-red-950/20 mb-8">
          <h2 className="text-2xl font-semibold mb-3">Synopsis</h2>
          <p className="text-gray-300">{movie.synopsis}</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-xl font-semibold mb-3">Scare Score</h2>
            <p className="text-3xl font-bold text-red-400">{movie.scareScore}/10</p>
          </div>

          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-xl font-semibold mb-3">Realism Score</h2>
            <p className="text-3xl font-bold text-red-400">{movie.realismScore}/10</p>
          </div>

          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-xl font-semibold mb-3">Disturbing Score</h2>
            <p className="text-3xl font-bold text-red-400">{movie.disturbingScore}/10</p>
          </div>

          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-xl font-semibold mb-3">Fear Index</h2>
            <p className="text-3xl font-bold text-red-400">{getFearIndex(movie)}/10</p>
          </div>

          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-xl font-semibold mb-3">Fear Category</h2>
            <p className="text-2xl font-bold text-red-300">{getFearCategory(movie)}</p>
            <p className="mt-2 text-sm text-gray-400">Weighted scare score: {getScariestScore(movie)}/10</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-2xl font-semibold mb-3">Categories</h2>
            {movie.categories.length > 0 ? (
              <ul className="space-y-2 text-gray-300">
                {movie.categories.map((category) => (
                  <li key={category}>
                    <Link href={`/${category}`} className="hover:text-white">
                      {categoryLabels[category] || category}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No categories listed.</p>
            )}
          </div>

          <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
            <h2 className="text-2xl font-semibold mb-3">Appears In Lists</h2>
            {movieLists.length > 0 ? (
              <ul className="space-y-2 text-gray-300">
                {movieLists.map((list) => (
                  <li key={list}>
                    <Link href={`/lists/${list}`} className="hover:text-white">
                      {listLabels[list] || list}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No list placements yet.</p>
            )}
          </div>
        </div>

        <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
          <h2 className="text-2xl font-semibold mb-3">Vault Tags</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="border border-gray-700 rounded-full px-3 py-1">
              Beginner Friendly: {movie.beginnerFriendly ? "Yes" : "No"}
            </span>
            <span className="border border-gray-700 rounded-full px-3 py-1">
              Hidden Gem: {movie.hiddenGem ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
