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

function getGuideRouteType(guide) {
  if (guide.listKey) {
    return "List-backed";
  }

  if (guide.categoryKey) {
    return "Category-backed";
  }

  return "Search-intent";
}

function getGuideStamp(guide) {
  if (guide.listKey) {
    return "Ranking Brief";
  }

  if (guide.categoryKey) {
    return "Category Brief";
  }

  return "Search Brief";
}

function getGuideCode(index) {
  return `GB-${String(index + 1).padStart(2, "0")}`;
}

function getGuideIcon(guide) {
  if (guide.listKey) {
    return "brief-ranking";
  }

  if (guide.categoryKey) {
    return "brief-category";
  }

  return "brief-search";
}

function getGuideHoverNote(guide, primaryLabel, fearProfile) {
  const routeSummary = guide.listKey
    ? `Built from the ${primaryLabel} ranking route, then expanded into an editorial briefing.`
    : guide.categoryKey
      ? `Built from the ${primaryLabel} category route, then narrowed into an editorial briefing.`
      : `Built from the search intent "${guide.searchIntent}" and mapped back into archive routes.`;

  const searchSummary = guide.searchIntent
    ? `Search intent tracked: ${guide.searchIntent}.`
    : null;

  const experimentSummary = fearProfile
    ? `Fear Experiment handoff: ${fearProfile.title}.`
    : null;

  return [routeSummary, searchSummary, experimentSummary].filter(Boolean).join(" ");
}

function getGuideStatus(guide) {
  if (guide.listKey === "scariest") {
    return { label: "Flagged", tone: "alert" };
  }

  if (guide.listKey === "beginner-friendly") {
    return { label: "Cleared", tone: "clear" };
  }

  if (guide.listKey === "hidden-gems") {
    return { label: "Underseen", tone: "muted" };
  }

  if (guide.listKey === "movies-that-feel-real" || guide.categoryKey === "screenlife") {
    return { label: "Verified", tone: "verified" };
  }

  return { label: "Mapped", tone: "standard" };
}

function getGuideAnnotation(guide, primaryLabel, fearProfile, count) {
  if (guide.listKey) {
    return `${count} titles are routed in from ${primaryLabel}; handoff stays pointed at ${fearProfile?.title || "the matching Fear Experiment lane"}.`;
  }

  if (guide.categoryKey) {
    return `${primaryLabel} currently feeds ${count} indexed files; the briefing keeps ${fearProfile?.title || "search handoff"} ready.`;
  }

  return `Search intent "${guide.searchIntent}" currently resolves to ${count} files with a briefing handoff already attached.`;
}

export const metadata = {
  title: "Restricted Briefings | Found Footage Vault",
  description: "Internal-style archive briefings for beginner picks, scariest found footage, realism-heavy movies, hidden gems, and screenlife horror.",
};

export default function GuidesPage() {
  const guides = guideEntries.map((guide, index) => {
    const primaryLabel = getGuidePrimaryLabel(guide);
    const fearProfile = getGuideFearProfile(guide);

    return {
      ...guide,
      count: getGuideCount(guide),
      preview: getGuideMovies(guide, 3),
      primaryHref: getGuidePrimaryHref(guide),
      primaryLabel,
      searchHref: getGuideSearchHref(guide),
      fearProfile,
      routeType: getGuideRouteType(guide),
      stamp: getGuideStamp(guide),
      icon: getGuideIcon(guide),
      status: getGuideStatus(guide),
      code: getGuideCode(index),
      signal: fearProfile ? "Quiz handoff ready" : "Direct route",
      annotation: getGuideAnnotation(guide, primaryLabel, fearProfile, getGuideCount(guide)),
      hoverNote: getGuideHoverNote(guide, primaryLabel, fearProfile),
    };
  });

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="ff-panel ff-dossier-index ff-dossier-index--guides ff-board-surface ff-board-surface--briefing ff-filing-cabinet ff-filing-cabinet--briefing rounded-[2rem] p-6 md:p-8">
          <div className="ff-board-corner">Briefing</div>
          <div className="ff-filing-cabinet__lock" aria-hidden="true">Vault Lock</div>
          <div className="ff-filing-cabinet__label-slot" aria-hidden="true">Drawer C-07 Briefings</div>
          <div className="ff-filing-cabinet__drawer-handle" aria-hidden="true" />
          <div className="ff-dossier-index__header">
            <div>
              <p className="ff-dossier-index__eyebrow">Restricted Vault Briefings</p>
              <h1 className="ff-glow ff-safe-wrap ff-dossier-index__title">Locked Guide Cabinet</h1>
            </div>
            <div className="ff-dossier-index__badge">Open a folder for source logic</div>
          </div>
          <p className="ff-safe-wrap ff-dossier-index__intro">
            Guide files are now stored as restricted vault folders instead of loose dossiers. Each folder shows the briefing route, sample case files, and the logic that connects the editorial page back to the archive data underneath.
          </p>
          <p className="ff-board-filed">Filed Under Briefings Drawer C</p>

          <div className="ff-dossier-grid ff-folder-grid" role="list" aria-label="Guide briefings">
            {guides.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`} className={`ff-dossier-card ff-dossier-card--guide ff-folder-card ff-folder-card--${guide.status.tone}`} role="listitem">
                <div className="ff-dossier-card__frame ff-folder-card__frame">
                  <div className="ff-folder-card__tab">
                    <span className="ff-folder-card__tab-code">{guide.code}</span>
                    <span className="ff-folder-card__tab-label">{guide.routeType}</span>
                  </div>
                  <span className="ff-dossier-card__hardware" aria-hidden="true" />
                  <div className="ff-dossier-card__topline">
                    <span className="ff-dossier-card__code">Drawer {guide.code}</span>
                    <span className="ff-dossier-card__stamp">{guide.stamp}</span>
                  </div>
                  <div className={`ff-dossier-card__status ff-dossier-card__status--${guide.status.tone}`}>{guide.status.label}</div>

                  <div className={`ff-dossier-card__icon-box ff-dossier-card__icon-box--${guide.icon}`} aria-hidden="true">
                    <span className="ff-dossier-card__icon-text">GUIDE</span>
                    <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--primary" />
                    <span className="ff-dossier-card__icon-shape ff-dossier-card__icon-shape--secondary" />
                  </div>

                  <div className="ff-dossier-card__body">
                    <h2 className="ff-safe-wrap ff-dossier-card__title">{guide.title}</h2>
                    <div className="ff-dossier-card__meta">
                      <span>{guide.count} titles</span>
                      <span>{guide.routeType}</span>
                      <span>{guide.signal}</span>
                    </div>
                    <p className="ff-safe-wrap ff-dossier-card__preview">{guide.preview.map((movie) => movie.title).join(" • ")}</p>
                    <p className="ff-safe-wrap ff-dossier-card__annotation">{guide.annotation}</p>
                  </div>

                  <div className="ff-dossier-card__hover" aria-hidden="true">
                    <p className="ff-dossier-card__hover-label">How this briefing was routed</p>
                    <p className="ff-safe-wrap ff-dossier-card__hover-copy">{guide.hoverNote}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}