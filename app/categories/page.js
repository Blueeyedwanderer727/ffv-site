import Image from "next/image";
import Link from "next/link";
import { categoryLabels } from "../data/labels";
import { getFearIndex } from "../data/listRankings";
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

const categoryNotes = {
  alien: {
    code: "CT-01",
    stamp: "Encounter File",
    icon: "encounter",
    detail: "Recovered footage built around extraterrestrial contact, abduction, crashed transmissions, or off-world presence entering the frame.",
  },
  anthology: {
    code: "CT-02",
    stamp: "Multi-Case Reel",
    icon: "reel",
    detail: "A single release containing multiple found footage cases, segments, or stitched incident files rather than one uninterrupted investigation.",
  },
  cryptid: {
    code: "CT-03",
    stamp: "Field Sighting",
    icon: "tracks",
    detail: "Files centered on elusive creatures, folklore beasts, or wilderness sightings where the camera is chasing evidence of something barely documented.",
  },
  "cult-conspiracy": {
    code: "CT-04",
    stamp: "Conspiracy Board",
    icon: "board",
    detail: "Material involving secret groups, ritual systems, hidden organizations, cover-ups, or investigators getting pulled into a coordinated belief structure.",
  },
  "haunted-location": {
    code: "CT-05",
    stamp: "Site Survey",
    icon: "site",
    detail: "The threat is anchored to a place: abandoned hospitals, tunnels, houses, hotels, or any location where the environment itself becomes the evidence.",
  },
  monster: {
    code: "CT-06",
    stamp: "Entity File",
    icon: "entity",
    detail: "Creature-forward footage where the danger is a physical being, predator, or large-scale attacking entity rather than a purely supernatural force.",
  },
  possession: {
    code: "CT-07",
    stamp: "Exorcism Record",
    icon: "sigil",
    detail: "Cases documenting spiritual takeover, demonic influence, religious escalation, or gradual loss of control inside one subject or family unit.",
  },
  psychological: {
    code: "CT-08",
    stamp: "Mindstate Review",
    icon: "mind",
    detail: "Footage where uncertainty, paranoia, unreliable perception, or mental collapse drive the fear as much as any visible threat in the frame.",
  },
  screenlife: {
    code: "CT-09",
    stamp: "Desktop Capture",
    icon: "screen",
    detail: "Stories told through webcams, desktops, phones, chat logs, or captured screens where the interface itself is the found footage format.",
  },
  "serial-killer": {
    code: "CT-10",
    stamp: "Case Priority",
    icon: "target",
    detail: "Recovered material focused on human predators, stalking patterns, murder documentation, or investigations orbiting a repeat offender.",
  },
  witchcraft: {
    code: "CT-11",
    stamp: "Occult Registry",
    icon: "occult",
    detail: "Files involving spells, covens, folk horror rites, occult practice, or supernatural systems tied specifically to witchcraft imagery or ritual use.",
  },
  "zombie-infection": {
    code: "CT-12",
    stamp: "Outbreak Map",
    icon: "outbreak",
    detail: "Footage documenting spread, contamination, infected behavior, collapse scenarios, or survival inside a transmissible-body-horror event.",
  },
};

function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}

function getCategoryStatus(categoryMovies, avgFearIndex, avgRealism) {
  const beginnerCount = categoryMovies.filter((movie) => movie.beginnerFriendly).length;

  if (avgFearIndex >= 7.4) {
    return { label: "Flagged", tone: "alert" };
  }

  if (avgRealism >= 7.5) {
    return { label: "Verified", tone: "verified" };
  }

  if (beginnerCount >= Math.max(1, Math.ceil(categoryMovies.length / 3))) {
    return { label: "Cleared", tone: "clear" };
  }

  if (categoryMovies.length <= 8) {
    return { label: "Sparse", tone: "muted" };
  }

  return { label: "Active", tone: "standard" };
}

function getCategoryAnnotation(categoryMovies, avgFearIndex, beginnerCount) {
  const anchorMovie = categoryMovies[0];

  if (!anchorMovie) {
    return "No filed evidence is attached to this route yet.";
  }

  return `${beginnerCount} files are beginner-cleared here; average fear index holds at ${avgFearIndex}/10 around ${anchorMovie.title}.`;
}

function getDeterministicIndex(seed, length) {
  if (length <= 0) {
    return -1;
  }

  let hash = 0;
  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash % length;
}

function getRandomFeedMovies(seed, moviesForFeed) {
  if (moviesForFeed.length === 0) {
    return { primaryMovie: null, secondaryMovie: null };
  }

  const primaryIndex = getDeterministicIndex(`${seed}-primary`, moviesForFeed.length);
  const primaryMovie = moviesForFeed[primaryIndex];

  if (moviesForFeed.length === 1) {
    return { primaryMovie, secondaryMovie: null };
  }

  const secondaryIndex = getDeterministicIndex(`${seed}-secondary`, moviesForFeed.length - 1);
  const remainingMovies = moviesForFeed.filter((_, index) => index !== primaryIndex);

  return {
    primaryMovie,
    secondaryMovie: remainingMovies[secondaryIndex],
  };
}

export default function CategoriesPage() {
  const categoryEntries = categoryOrder.map((categoryKey) => {
    const categoryMovies = movies.filter(
      (movie) => Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
    );
    const note = categoryNotes[categoryKey];
    const beginnerCount = categoryMovies.filter((movie) => movie.beginnerFriendly).length;
    const avgFearIndex = categoryMovies.length
      ? roundToTenth(categoryMovies.reduce((total, movie) => total + getFearIndex(movie), 0) / categoryMovies.length)
      : 0;
    const avgRealism = categoryMovies.length
      ? roundToTenth(categoryMovies.reduce((total, movie) => total + Number(movie.realismScore || 0), 0) / categoryMovies.length)
      : 0;
    const status = getCategoryStatus(categoryMovies, avgFearIndex, avgRealism);
    const { primaryMovie, secondaryMovie } = getRandomFeedMovies(categoryKey, categoryMovies);

    return {
      key: categoryKey,
      label: categoryLabels[categoryKey],
      href: `/${categoryKey}`,
      count: categoryMovies.length,
      code: note.code,
      stamp: note.stamp,
      icon: note.icon,
      status,
      signal: categoryMovies.length ? `Avg fear ${avgFearIndex}/10` : "Awaiting data",
      annotation: getCategoryAnnotation(categoryMovies, avgFearIndex, beginnerCount),
      detail: note.detail,
      leadTitle: primaryMovie?.title ?? null,
      leadPosterUrl: primaryMovie?.posterUrl ?? null,
      backupPosterUrl: secondaryMovie?.posterUrl ?? null,
      previewTitles: categoryMovies.slice(0, 3).map((movie) => movie.title),
    };
  });

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="ff-panel ff-dossier-index ff-dossier-index--categories ff-board-surface ff-board-surface--taxonomy ff-records-archive ff-records-archive--taxonomy ff-monitor-archive ff-monitor-archive--taxonomy rounded-[2rem] p-6 md:p-8">
          <div className="ff-board-corner">Taxonomy</div>
          <div className="ff-records-archive__label" aria-hidden="true">Monitor Grid B-03</div>
          <div className="ff-records-archive__rail" aria-hidden="true" />
          <div className="ff-dossier-index__header">
            <div>
              <p className="ff-dossier-index__eyebrow">Recovered Camera Grid</p>
              <h1 className="ff-glow ff-safe-wrap ff-dossier-index__title">Taxonomy Feed Bank</h1>
            </div>
            <div className="ff-dossier-index__badge">Open feed notes</div>
          </div>
          <p className="ff-safe-wrap ff-dossier-index__intro">
            Category routes are presented like recovered camera feeds rather than static files. Each screen opens a category route, and the attached HUD note explains what kind of footage belongs in that live bank.
          </p>
          <p className="ff-board-filed">Filed Under Taxonomy Feed Bank</p>

          <div className="ff-dossier-grid ff-record-grid" role="list" aria-label="Category routes">
            {categoryEntries.map((category) => (
              <Link key={category.key} href={category.href} className={`ff-dossier-card ff-dossier-card--category ff-record-card ff-record-card--taxonomy ff-record-card--${category.status.tone} ff-monitor-card ff-monitor-card--taxonomy`} role="listitem">
                <div className="ff-dossier-card__frame ff-record-card__frame ff-monitor-card__frame">
                  <div className="ff-record-card__index-strip" aria-hidden="true">
                    <span className="ff-record-card__index-label">Channel Feed</span>
                    <span className="ff-record-card__barcode" />
                  </div>
                  <span className="ff-dossier-card__hardware" aria-hidden="true" />
                  <div className="ff-dossier-card__topline">
                    <span className="ff-dossier-card__code">Feed {category.code}</span>
                    <span className="ff-dossier-card__stamp">{category.stamp}</span>
                  </div>
                  <div className={`ff-dossier-card__status ff-dossier-card__status--${category.status.tone}`}>{category.status.label}</div>

                  <div className="ff-monitor-feed" aria-hidden="true">
                    <div className="ff-monitor-feed__screen">
                      <div className="ff-monitor-feed__hud ff-monitor-feed__hud--top">
                        <span>REC</span>
                        <span>CH {category.code}</span>
                        <span>{category.count} FILES</span>
                      </div>
                      <div className="ff-monitor-feed__main">
                        {category.leadPosterUrl ? (
                          <Image
                            src={category.leadPosterUrl}
                            alt=""
                            fill
                            className="h-full w-full object-cover"
                            sizes="(max-width: 768px) 100vw, 220px"
                          />
                        ) : (
                          <span className="ff-monitor-feed__fallback">Signal lost</span>
                        )}
                        <div className="ff-monitor-feed__scanlines" />
                        <div className="ff-monitor-feed__noise" />
                      </div>
                      <div className="ff-monitor-feed__pip">
                        {category.backupPosterUrl ? (
                          <Image
                            src={category.backupPosterUrl}
                            alt=""
                            fill
                            className="h-full w-full object-cover"
                            sizes="120px"
                          />
                        ) : (
                          <span className="ff-monitor-feed__fallback">PIP</span>
                        )}
                      </div>
                      <div className="ff-monitor-feed__hud ff-monitor-feed__hud--bottom">
                        <span>{category.leadTitle || category.label}</span>
                        <span>TC 00:14:27</span>
                      </div>
                    </div>
                    <div className="ff-monitor-feed__caption">Recovered taxonomy feed</div>
                  </div>

                  <div className="ff-dossier-card__body">
                    <h2 className="ff-safe-wrap ff-dossier-card__title">{category.label}</h2>
                    <div className="ff-dossier-card__meta">
                      <span>{category.count} titles</span>
                      <span>Route file</span>
                      <span>{category.signal}</span>
                    </div>
                    <p className="ff-safe-wrap ff-dossier-card__preview">
                      {category.previewTitles.length > 0 ? category.previewTitles.join(" • ") : "No case files are indexed in this route yet."}
                    </p>
                    <p className="ff-safe-wrap ff-dossier-card__annotation">{category.annotation}</p>
                  </div>

                  <div className="ff-dossier-card__hover" aria-hidden="true">
                    <p className="ff-dossier-card__hover-label">What this category means</p>
                    <p className="ff-safe-wrap ff-dossier-card__hover-copy">{category.detail}</p>
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