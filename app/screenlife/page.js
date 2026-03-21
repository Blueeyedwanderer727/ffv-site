import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";
import Link from "next/link";
import MovieListItem from "../components/MovieListItem";

export default function ScreenlifeAge() {
  const screenlifeMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("screenlife")
  );

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">{categoryLabels["screenlife"]}</h1>
      <p className="text-gray-300 mb-8">
        Horror that unfolds through computers, webcams, calls, and digital screens.
      </p>

      <ul className="space-y-3">
        {screenlifeMovies.map((movie) => (
          <MovieListItem key={movie.slug} movie={movie} />
        ))}
      </ul>
    </main>
  );
}