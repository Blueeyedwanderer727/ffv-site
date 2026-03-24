import Image from "next/image";
import Link from "next/link";
import { buildAmazonWatchHref, isAmazonAffiliateEnabled } from "../data/affiliateLinks";
import { getFearCategory, getFearIndex, getScariestScore } from "../data/listRankings";

export default function MovieListItem({
  movie,
  rank,
  showSynopsis = false,
  showMeta = false,
  showScores = false,
  showAmazonLink = true,
  amazonLabel = "Check Amazon",
}) {
  const amazonWatchHref = buildAmazonWatchHref(movie);
  const showAffiliateLink = showAmazonLink && isAmazonAffiliateEnabled();

  return (
    <li className="ff-border border-b pb-3 last:border-b-0">
      <div className="-m-2 rounded-2xl p-3 transition duration-200 hover:bg-green-400/8">
        <div className="flex gap-4">
          <Link href={`/movie/${movie.slug}`} className="group shrink-0">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                width={64}
                height={96}
                className="h-24 w-16 rounded-xl object-cover"
                sizes="64px"
              />
            ) : (
              <div className="ff-panel flex h-24 w-16 items-center justify-center rounded-xl text-center text-[10px] uppercase tracking-[0.2em] text-green-100/45">
                No Poster
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={`/movie/${movie.slug}`} className="group block">
              <div className="ff-safe-wrap font-semibold text-green-50 group-hover:text-green-200">
                {typeof rank === "number" ? `#${rank} ` : ""}
                {movie.title} <span className="font-normal text-green-100/50">({movie.year})</span>
              </div>

              {showSynopsis ? (
                <p className="ff-safe-wrap mt-2 line-clamp-3 text-sm text-green-50/68">{movie.synopsis}</p>
              ) : null}
            </Link>

            {showScores ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="ff-button rounded-full px-2 py-1 text-green-50">
                  Fear Index: {getFearIndex(movie)}/10
                </span>
                <span className="ff-border rounded-full px-2 py-1 text-green-50/78">
                  {getFearCategory(movie)}
                </span>
                <span className="ff-border rounded-full px-2 py-1 text-green-50/78">
                  Scariest Score: {getScariestScore(movie)}/10
                </span>
              </div>
            ) : null}

            {showMeta ? (
              <>
                <div className="mt-2 text-xs text-green-200/90">Scare Score: {movie.scareScore}</div>
                <div className="mt-1 text-xs text-green-100/55">
                  Categories: {Array.isArray(movie.categories) ? movie.categories.join(", ") : "None"}
                </div>
                <div className="mt-1 text-xs text-green-100/55">
                  Tags: {Array.isArray(movie.tags) ? movie.tags.join(", ") : "None"}
                </div>
              </>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link href={`/movie/${movie.slug}`} className="ff-border rounded-full px-3 py-1 text-green-50/80 hover:bg-green-400/8">
                Open Case File
              </Link>
              {showAffiliateLink ? (
                <a
                  href={amazonWatchHref}
                  target="_blank"
                  rel="noreferrer"
                  className="ff-affiliate-button rounded-full px-3 py-1 text-green-50"
                >
                  {amazonLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}