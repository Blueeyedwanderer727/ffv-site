import Link from "next/link";
import MovieListItem from "./MovieListItem";
import RouteContextLinks from "./RouteContextLinks";

export function CategoryCollectionPage({ title, description, movies }) {
  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/categories" className="ff-link mb-6 inline-block">
          ← Back to Categories
        </Link>

        <RouteContextLinks />

        <div className="ff-panel ff-mobile-panel mb-8 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(61,147,88,0.22),_rgba(7,14,10,0.94)_60%)] p-6 md:p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.34em] text-green-300/70">Category Route File</p>
          <h1 className="ff-glow ff-safe-wrap mb-3 text-3xl font-bold text-green-50 sm:text-4xl md:text-5xl">{title}</h1>
          <p className="ff-safe-wrap max-w-3xl text-sm leading-7 text-green-50/70 md:text-base">{description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-green-100/52">
            <span className="ff-border ff-mobile-chip rounded-full px-3 py-2">Archive Route Live</span>
            <span className="ff-border ff-mobile-chip rounded-full px-3 py-2">{movies.length} Titles Indexed</span>
          </div>
        </div>

        <div className="ff-panel ff-mobile-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="ff-safe-wrap text-2xl font-semibold text-green-50">Recovered Titles</h2>
              <p className="ff-safe-wrap text-sm text-green-100/56">{movies.length} titles indexed under this active category route.</p>
            </div>
            <Link href="/search" className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
              Open Full Search
            </Link>
          </div>

          {movies.length > 0 ? (
            <ul className="space-y-3">
              {movies.map((movie) => (
                <MovieListItem key={movie.slug} movie={movie} />
              ))}
            </ul>
          ) : (
            <div className="ff-border ff-safe-wrap rounded-2xl bg-black/20 p-5 text-green-100/56">This category route exists, but no titles are indexed here yet. Open full search or return to the archive map for a populated lane.</div>
          )}
        </div>
      </div>
    </main>
  );
}

export function ListCollectionPage({ title, description, movies }) {
  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/lists" className="ff-link mb-6 inline-block">
          ← Back to Lists
        </Link>

        <RouteContextLinks />

        <div className="ff-panel ff-mobile-panel mb-8 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(61,147,88,0.22),_rgba(7,14,10,0.94)_60%)] p-6 md:p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.34em] text-green-300/70">Ranked Route File</p>
          <h1 className="ff-glow ff-safe-wrap mb-3 text-3xl font-bold text-green-50 sm:text-4xl md:text-5xl">{title}</h1>
          <p className="ff-safe-wrap max-w-3xl text-sm leading-7 text-green-50/70 md:text-base">{description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-green-100/52">
            <span className="ff-border ff-mobile-chip rounded-full px-3 py-2">Ranking Route Live</span>
            <span className="ff-border ff-mobile-chip rounded-full px-3 py-2">{movies.length} Files Logged</span>
          </div>
        </div>

        <div className="ff-panel ff-mobile-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="ff-safe-wrap text-2xl font-semibold text-green-50">Ranked Case Files</h2>
              <p className="ff-safe-wrap text-sm text-green-100/56">{movies.length} titles currently logged in this ranking route.</p>
            </div>
            <Link href="/search" className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
              Open Full Search
            </Link>
          </div>

          {movies.length > 0 ? (
            <ul className="space-y-3">
              {movies.map((movie, index) => (
                <MovieListItem key={movie.slug} movie={movie} rank={index + 1} showScores={true} />
              ))}
            </ul>
          ) : (
            <div className="ff-border ff-safe-wrap rounded-2xl bg-black/20 p-5 text-green-100/56">This ranking route is staged but not yet populated. Return to the list index or use full search to enter a route with active files.</div>
          )}
        </div>
      </div>
    </main>
  );
}