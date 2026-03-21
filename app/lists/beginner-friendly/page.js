import { listLabels } from "../../data/labels";
import { getMoviesForList } from "../../data/listRankings";
import Link from "next/link";
import MovieListItem from "../../components/MovieListItem";

export default function BeginnerFriendlyPage() {
  const listKey = "beginner-friendly";

  const listMovies = getMoviesForList(listKey);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-red-400 hover:text-red-300 inline-block mb-6"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">{listLabels[listKey]}</h1>
        <p className="text-gray-300 mb-8">
          Browse all titles in this curated list.
        </p>

        <div className="border border-gray-800 rounded-2xl p-6 bg-neutral-950">
          {listMovies.length > 0 ? (
            <ul className="space-y-3">
              {listMovies.map((movie, index) => (
                <MovieListItem key={movie.slug} movie={movie} rank={index + 1} showScores={true} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No movies added to this list yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}