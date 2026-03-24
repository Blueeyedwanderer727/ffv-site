import Link from "next/link";
import { listLabels } from "../data/labels";
import { getMoviesForList } from "../data/listRankings";

const listOrder = [
  "scariest",
  "beginner-friendly",
  "top-25-most-recommended",
  "hidden-gems",
  "most-disturbing",
  "movies-that-feel-real",
];

export default function ListsPage() {
  const listEntries = listOrder.map((listKey) => {
    const listMovies = getMoviesForList(listKey);

    return {
      key: listKey,
      label: listLabels[listKey],
      href: `/lists/${listKey}`,
      count: listMovies.length,
      previewTitles: listMovies.slice(0, 3).map((movie) => movie.title),
    };
  });

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="max-w-4xl mx-auto">
        <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-green-300/70">Archive Index</p>
        <h1 className="ff-glow ff-safe-wrap mb-4 text-center text-3xl font-bold text-green-50 sm:text-4xl">Ranked List Routes</h1>
        <p className="ff-safe-wrap mb-10 text-center text-green-100/56">
          Recovered ranking routes for fear, realism, gateway access, and deeper-cut discovery. Each path is a stable entry lane into the active vault.
        </p>

        <div className="ff-panel ff-mobile-panel rounded-3xl p-6">
          <ul className="space-y-3 text-green-50/78">
            {listEntries.map((list) => (
              <li key={list.key}>
                <div className="ff-border rounded-2xl bg-black/20 p-4 transition hover:bg-green-400/8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={list.href}
                        className="ff-mobile-chip ff-safe-wrap text-base text-green-50 transition hover:text-green-200"
                      >
                        Open {list.label}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-green-100/52">
                        <span className="ff-border rounded-full px-3 py-1">{list.count} titles</span>
                        <span className="ff-border rounded-full px-3 py-1">Dedicated ranking</span>
                      </div>
                      {list.previewTitles.length > 0 ? (
                        <p className="ff-safe-wrap mt-3 text-sm text-green-100/56">
                          {list.previewTitles.join(" • ")}
                        </p>
                      ) : (
                        <p className="ff-safe-wrap mt-3 text-sm text-green-100/56">
                          No case files are ranked here yet.
                        </p>
                      )}
                    </div>
                    <Link
                      href={list.href}
                      className="ff-border rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em] text-green-50/80 hover:bg-green-400/8"
                    >
                      Open Route
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}