import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";
import Link from "next/link";
import MovieListItem from "../components/MovieListItem";

export default function WitchcraftPage() {
  const witchcraftMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("witchcraft")
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">{categoryLabels["witchcraft"]}</h1>
      <p className="text-gray-300 mb-8">
        Curses, folklore, rituals, and dark magic captured on camera.
      </p>

      <ul className="space-y-3">
        {witchcraftMovies.map((movie) => (
          <MovieListItem key={movie.slug} movie={movie} />
        ))}
      </ul>
    </main>
  );
}