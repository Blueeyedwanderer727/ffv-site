import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";
import Link from "next/link";
import MovieListItem from "../components/MovieListItem";

export default function CultConspiracyPage() {
  const categoryKey = "cult-conspiracy";

  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-red-400 hover:text-red-300 inline-block mb-6"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">{categoryLabels[categoryKey]}</h1>
        <p className="text-gray-300 mb-8">
          Browse all titles in this category.
        </p>

        <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
          {categoryMovies.length > 0 ? (
            <ul className="space-y-3">
              {categoryMovies.map((movie) => (
                <MovieListItem key={movie.slug} movie={movie} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No movies added to this category yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}