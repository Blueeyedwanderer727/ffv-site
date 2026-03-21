import Link from "next/link";
import { getFearCategory, getFearIndex, getScariestScore } from "../data/listRankings";

export default function MovieListItem({
  movie,
  rank,
  showSynopsis = false,
  showMeta = false,
  showScores = false,
}) {
  return (
    <li className="border-b border-gray-800 pb-3 last:border-b-0">
      <Link
        href={`/movie/${movie.slug}`}
        className="group -m-2 flex gap-4 rounded-xl p-2 transition-colors hover:bg-neutral-900"
      >
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="h-24 w-16 shrink-0 rounded-md bg-neutral-900 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-md border border-gray-800 bg-neutral-900 text-center text-[10px] uppercase tracking-[0.2em] text-gray-500">
            No Poster
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white group-hover:text-red-400">
            {typeof rank === "number" ? `#${rank} ` : ""}
            {movie.title} <span className="font-normal text-gray-400">({movie.year})</span>
          </div>

          {showSynopsis ? (
            <p className="mt-2 line-clamp-3 text-sm text-gray-300">{movie.synopsis}</p>
          ) : null}

          {showScores ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-red-900/60 px-2 py-1 text-red-300">
                Fear Index: {getFearIndex(movie)}/10
              </span>
              <span className="rounded-full border border-gray-700 px-2 py-1 text-gray-300">
                {getFearCategory(movie)}
              </span>
              <span className="rounded-full border border-gray-700 px-2 py-1 text-gray-300">
                Scariest Score: {getScariestScore(movie)}/10
              </span>
            </div>
          ) : null}

          {showMeta ? (
            <>
              <div className="mt-2 text-xs text-red-400">Scare Score: {movie.scareScore}</div>
              <div className="mt-1 text-xs text-gray-400">
                Categories: {Array.isArray(movie.categories) ? movie.categories.join(", ") : "None"}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Tags: {Array.isArray(movie.tags) ? movie.tags.join(", ") : "None"}
              </div>
            </>
          ) : null}
        </div>
      </Link>
    </li>
  );
}