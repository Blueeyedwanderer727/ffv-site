import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";
import Link from "next/link";
import MovieListItem from "../components/MovieListItem";

export default function PossessionPage() {
  const possessionMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("possession")
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">{categoryLabels["possession"]}</h1>
      <p className="text-gray-300 mb-8">
        Demonic influence, exorcisms, hauntings, and escalating supernatural terror.
      </p>

      <ul className="space-y-3">
        {possessionMovies.map((movie) => (
          <MovieListItem key={movie.slug} movie={movie} />
        ))}
      </ul>
    </main>
  );
}