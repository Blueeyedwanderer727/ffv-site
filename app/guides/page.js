import Link from "next/link";
import {
  getGuideCount,
  getGuideFearProfile,
  getGuidePrimaryHref,
  getGuidePrimaryLabel,
  getGuideSearchHref,
  getGuideMovies,
  guideEntries,
} from "../data/guides";

export const metadata = {
  title: "Restricted Briefings | Found Footage Vault",
  description: "Internal-style archive briefings for beginner picks, scariest found footage, realism-heavy movies, hidden gems, and screenlife horror.",
};

export default function GuidesPage() {
  const guides = guideEntries.map((guide) => ({
    ...guide,
    count: getGuideCount(guide),
    preview: getGuideMovies(guide, 3),
    primaryHref: getGuidePrimaryHref(guide),
    primaryLabel: getGuidePrimaryLabel(guide),
    searchHref: getGuideSearchHref(guide),
    fearProfile: getGuideFearProfile(guide),
  }));

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="ff-panel mb-10 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(61,147,88,0.28),_rgba(8,14,10,0.94)_58%)] p-8 md:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-green-300/70">Restricted Briefings</p>
          <h1 className="ff-glow mb-4 text-5xl font-bold text-green-50">Recovered Lab Briefings And Archive Notes</h1>
          <p className="max-w-3xl text-lg text-green-50/72">
            These briefing files are written like internal notes instead of blog posts. They stay grounded in the vault&apos;s rankings, categories, search filters, and Fear Experiment profiles so even the editorial layer still behaves like a recommendation tool.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => (
            <article key={guide.slug} className="ff-panel rounded-3xl p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm uppercase tracking-[0.18em] text-green-300/70">{guide.eyebrow}</span>
                <span className="ff-border rounded-full px-3 py-1 text-xs text-green-50/72">{guide.count} titles</span>
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-green-50">{guide.title}</h2>
              <p className="mb-4 text-sm text-green-50/72">{guide.description}</p>
              <div className="ff-border mb-4 rounded-2xl bg-black/20 p-4 text-sm text-green-100/56">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-green-300/70">Candidate Titles</div>
                <div className="space-y-2">
                  {guide.preview.map((movie) => (
                    <div key={movie.slug} className="ff-border flex items-center justify-between gap-3 rounded-xl px-3 py-2">
                      <span>{movie.title}</span>
                      <span className="text-xs text-green-100/45">{movie.year}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-5 flex flex-wrap gap-2 text-xs text-green-100/56">
                {guide.searchIntent ? (
                  <span className="ff-border rounded-full px-3 py-1">Briefing intent: {guide.searchIntent}</span>
                ) : null}
                <span className="ff-border rounded-full px-3 py-1">Primary route: {guide.primaryLabel}</span>
                {guide.fearProfile ? (
                  <span className="ff-border rounded-full px-3 py-1">Experiment lane: {guide.fearProfile.title}</span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/guides/${guide.slug}`} className="ff-button rounded-full px-4 py-2 text-sm">
                  Open Briefing
                </Link>
                <Link href={guide.primaryHref} className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
                  Open {guide.primaryLabel}
                </Link>
                <Link href={guide.searchHref} className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
                  Open Search
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}