import Link from "next/link";
import { categoryLabels } from "../data/labels";
import { movies } from "../data/movies";

const categoryOrder = [
  "alien",
  "anthology",
  "cryptid",
  "cult-conspiracy",
  "haunted-location",
  "monster",
  "possession",
  "psychological",
  "screenlife",
  "serial-killer",
  "witchcraft",
  "zombie-infection",
];

export default function CategoriesPage() {
  const categoryEntries = categoryOrder.map((categoryKey) => {
    const categoryMovies = movies.filter(
      (movie) => Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
    );

    return {
      key: categoryKey,
      label: categoryLabels[categoryKey],
      href: `/${categoryKey}`,
      count: categoryMovies.length,
      previewTitles: categoryMovies.slice(0, 3).map((movie) => movie.title),
    };
  });

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="max-w-4xl mx-auto">
        <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-green-300/70">Archive Taxonomy</p>
        <h1 className="ff-glow ff-safe-wrap mb-4 text-center text-3xl font-bold text-green-50 sm:text-4xl">Category Archive Routes</h1>
        <p className="ff-safe-wrap mb-10 text-center text-green-100/56">
          Browse the active subgenre map of the vault: route files organized by threat type, setting logic, and recovered footage behavior.
        </p>

        <div className="ff-panel ff-mobile-panel rounded-3xl p-6">
          <ul className="space-y-3 text-green-50/78">
            {categoryEntries.map((category) => (
              <li key={category.key}>
                <div className="ff-border rounded-2xl bg-black/20 p-4 transition hover:bg-green-400/8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={category.href}
                        className="ff-mobile-chip ff-safe-wrap text-base text-green-50 transition hover:text-green-200"
                      >
                        Open {category.label}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-green-100/52">
                        <span className="ff-border rounded-full px-3 py-1">{category.count} titles</span>
                        <span className="ff-border rounded-full px-3 py-1">Dedicated route</span>
                      </div>
                      {category.previewTitles.length > 0 ? (
                        <p className="ff-safe-wrap mt-3 text-sm text-green-100/56">
                          {category.previewTitles.join(" • ")}
                        </p>
                      ) : (
                        <p className="ff-safe-wrap mt-3 text-sm text-green-100/56">
                          No case files are indexed in this route yet.
                        </p>
                      )}
                    </div>
                    <Link
                      href={category.href}
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