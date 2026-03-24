import Link from "next/link";
import { notFound } from "next/navigation";
import MovieListItem from "../../components/MovieListItem";
import {
  getGuideBySlug,
  getGuideCount,
  getGuideFearProfile,
  getGuideMovies,
  getGuidePrimaryHref,
  getGuidePrimaryLabel,
  getGuideSearchHref,
  guideEntries,
} from "../../data/guides";

export function generateStaticParams() {
  return guideEntries.map((guide) => ({ slug: guide.slug }));
}

export function generateMetadata({ params }) {
  const guide = getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: "Guide Not Found | Found Footage Vault",
    };
  }

  return {
    title: `${guide.title} | Found Footage Vault`,
    description: guide.description,
    keywords: guide.keywords || [],
    openGraph: {
      title: `${guide.title} | Found Footage Vault`,
      description: guide.description,
      type: "article",
    },
  };
}

export default function GuidePage({ params }) {
  const guide = getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  const guideMovies = getGuideMovies(guide, 12);
  const primaryHref = getGuidePrimaryHref(guide);
  const primaryLabel = getGuidePrimaryLabel(guide);
  const searchHref = getGuideSearchHref(guide);
  const fearProfile = getGuideFearProfile(guide);
  const count = getGuideCount(guide);

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/guides" className="ff-link mb-6 inline-block">
          ← Back to Briefings
        </Link>

        <div className="ff-panel mb-8 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(61,147,88,0.28),_rgba(8,14,10,0.95)_58%)] p-8 md:p-10">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-green-300/70">{guide.eyebrow}</p>
          <h1 className="ff-glow mb-4 text-5xl font-bold text-green-50">{guide.title}</h1>
          <p className="mb-4 max-w-3xl text-lg text-green-50/72">{guide.description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-green-50/72">
            {guide.searchIntent ? <span className="ff-border rounded-full px-4 py-2">Search intent: {guide.searchIntent}</span> : null}
            <span className="ff-border rounded-full px-4 py-2">{count} titles in this route</span>
            <span className="ff-border rounded-full px-4 py-2">Primary route: {primaryLabel}</span>
            {fearProfile ? <span className="ff-border rounded-full px-4 py-2">Fear lane: {fearProfile.title}</span> : null}
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="ff-panel rounded-3xl p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Why This Briefing Exists</h2>
            <p className="mb-4 text-green-50/72">{guide.intro}</p>
            <p className="text-green-100/56">{guide.angle}</p>
          </div>
          <div className="ff-panel rounded-3xl p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Optimization Targets</h2>
            <ul className="space-y-3 text-green-50/72">
              {guide.bullets.map((item) => (
                <li key={item} className="ff-border rounded-2xl bg-black/20 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="ff-panel rounded-3xl p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Best For</h2>
            <ul className="space-y-3 text-green-50/72">
              {(guide.bestFor || []).map((item) => (
                <li key={item} className="ff-border rounded-2xl bg-black/20 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ff-panel rounded-3xl p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Probably Skip This Page If</h2>
            <ul className="space-y-3 text-green-50/72">
              {(guide.avoidIf || []).map((item) => (
                <li key={item} className="ff-border rounded-2xl bg-black/20 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ff-panel mb-8 rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Recommended Exposure Candidates</h2>
            <div className="flex flex-wrap gap-3">
              <Link href={primaryHref} className="ff-button rounded-full px-4 py-2 text-sm">
                Open {primaryLabel}
              </Link>
              <Link href={searchHref} className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
                Open Search
              </Link>
              {fearProfile ? (
                <Link href={fearProfile.href} className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8">
                  Open {fearProfile.title}
                </Link>
              ) : null}
            </div>
          </div>
          <ul className="space-y-3">
            {guideMovies.map((movie, index) => (
              <MovieListItem key={movie.slug} movie={movie} rank={index + 1} showScores={true} />
            ))}
          </ul>
        </div>

        {(guide.faq || []).length > 0 ? (
          <div className="ff-panel mb-8 rounded-3xl p-6 md:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Lab Notes</h2>
            <div className="space-y-4">
              {guide.faq.map((item) => (
                <div key={item.question} className="ff-border rounded-2xl bg-black/20 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-green-50">{item.question}</h3>
                  <p className="text-green-100/56">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="ff-panel rounded-3xl p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Related Briefings</h2>
            <Link href="/guides" className="ff-link text-sm">
              Browse all briefings
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {guideEntries
              .filter((entry) => entry.slug !== guide.slug)
              .slice(0, 3)
              .map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/guides/${entry.slug}`}
                  className="ff-border rounded-2xl bg-black/20 p-4 transition hover:-translate-y-1 hover:bg-green-400/8"
                >
                  <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">{entry.eyebrow}</div>
                  <div className="mb-2 text-lg font-semibold text-green-50">{entry.title}</div>
                  <div className="text-sm text-green-100/56">{entry.description}</div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}