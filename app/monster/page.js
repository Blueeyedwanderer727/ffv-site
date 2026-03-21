import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";
import Link from "next/link";
import MovieListItem from "../components/MovieListItem";

export default function MonsterPage() {
  const monsterMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("monster")
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">{categoryLabels["monster"]}</h1>
      <p className="text-gray-300 mb-8">
        Giant threats, hidden beasts, and things that should not exist.
      </p>

      <ul className="space-y-3">
        {monsterMovies.map((movie) => (
          <MovieListItem key={movie.slug} movie={movie} />
        ))}
      </ul>
    </main>
  );
}