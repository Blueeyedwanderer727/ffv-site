import Image from "next/image";
import Link from "next/link";
import { listLabels } from "../data/labels";
import { getFearIndex, getMoviesForList } from "../data/listRankings";

const listOrder = [
  "scariest",
  "beginner-friendly",
  "top-25-most-recommended",
  "hidden-gems",
  "most-disturbing",
  "movies-that-feel-real",
];

const listNotes = {
  scariest: {
    code: "FR-01",
    stamp: "Threat Matrix",
    rule: "Score-derived",
    icon: "threat",
    detail:
      "Built from the spreadsheet scoring fields imported into the archive: disturbing level carries the most weight, then jump-scare level, then realism score. Ties break on fear index and recommendation score.",
  },
  "beginner-friendly": {
    code: "FR-02",
    stamp: "Access Route",
    rule: "Flag + sort",
    icon: "access",
    detail:
      "Pulled from titles marked beginner-friendly in the spreadsheet, then ordered toward the strongest recommendation scores while keeping fear index and realism lower for an easier first step into found footage.",
  },
  "top-25-most-recommended": {
    code: "FR-03",
    stamp: "Priority Queue",
    rule: "Score threshold",
    icon: "priority",
    detail:
      "Restricted to films with recommendation scores of 9 or higher in the spreadsheet data. The final twenty-five are ordered by recommendation score first, then fear index, then the scariest score.",
  },
  "hidden-gems": {
    code: "FR-04",
    stamp: "Deep Cut",
    rule: "Flag + score",
    icon: "gem",
    detail:
      "This route only pulls entries flagged as hidden gems in the spreadsheet, then ranks them by recommendation score, fear index, and the scariest score so overlooked films still feel curated, not random.",
  },
  "most-disturbing": {
    code: "FR-05",
    stamp: "Damage Report",
    rule: "Severity sort",
    icon: "damage",
    detail:
      "Generated from the disturbing-level column in the spreadsheet. If two files land on the same damage level, the archive breaks the tie with fear index and recommendation score.",
  },
  "movies-that-feel-real": {
    code: "FR-06",
    stamp: "Realism Audit",
    rule: "Score-derived",
    icon: "realism",
    detail:
      "Driven by realism score from the spreadsheet data. Higher realism surfaces first, with fear index and recommendation score used to separate equally convincing files.",
  },
};

function getListStatus(listKey) {
  switch (listKey) {
    case "scariest":
      return { label: "Flagged", tone: "alert" };
    case "beginner-friendly":
      return { label: "Cleared", tone: "clear" };
    case "hidden-gems":
      return { label: "Underseen", tone: "muted" };
    case "movies-that-feel-real":
      return { label: "Verified", tone: "verified" };
    case "top-25-most-recommended":
      return { label: "Priority", tone: "standard" };
    case "most-disturbing":
      return { label: "Severe", tone: "alert" };
    default:
      return { label: "Active", tone: "standard" };
  }
}

function getListAnnotation(listKey, listMovies) {
  const leadMovie = listMovies[0];

  if (!leadMovie) {
    return "No ranked case files are attached to this route yet.";
  }

  switch (listKey) {
    case "scariest":
      return `${leadMovie.title} currently fronts the board with a fear index of ${getFearIndex(leadMovie)}/10.`;
    case "beginner-friendly":
      return `${listMovies.length} files are cleared for new viewers; ${leadMovie.title} opens the route.`;
    case "top-25-most-recommended":
      return `${listMovies.length} files made the 9/10 recommendation gate; ${leadMovie.title} remains near the top.`;
    case "hidden-gems":
      return `${listMovies.length} underseen files are tagged here; ${leadMovie.title} is one of the strongest pulls.`;
    case "most-disturbing":
      return `${leadMovie.title} leads the damage stack at disturbing level ${leadMovie.disturbingLevel || leadMovie.disturbingScore}/10.`;
    case "movies-that-feel-real":
      return `${leadMovie.title} helps anchor the realism board at ${leadMovie.realismScore}/10 realism.`;
    default:
      return `${leadMovie.title} is currently one of the anchor files for this route.`;
  }
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

export default function ListsPage() {
  const listEntries = listOrder.map((listKey) => {
    const listMovies = getMoviesForList(listKey);
    const note = listNotes[listKey];
    const leadMovie = listMovies[0];
    const status = getListStatus(listKey);
    const { primaryMovie, secondaryMovie } = getRandomFeedMovies(listKey, listMovies);

    return {
      key: listKey,
      label: listLabels[listKey],
      href: `/lists/${listKey}`,
      count: listMovies.length,
      code: note.code,
      stamp: note.stamp,
      rule: note.rule,
      icon: note.icon,
      detail: note.detail,
      status,
      annotation: getListAnnotation(listKey, listMovies),
      signal: leadMovie ? `Lead fear ${getFearIndex(leadMovie)}/10` : "Awaiting data",
      leadTitle: primaryMovie?.title ?? null,
      leadPosterUrl: primaryMovie?.posterUrl ?? null,
      backupPosterUrl: secondaryMovie?.posterUrl ?? null,
      previewTitles: listMovies.slice(0, 3).map((movie) => movie.title),
    };
  });

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <section className="ff-panel ff-dossier-index ff-dossier-index--lists ff-board-surface ff-board-surface--priority ff-records-archive ff-records-archive--priority ff-monitor-archive ff-monitor-archive--priority rounded-[2rem] p-6 md:p-8">
          <div className="ff-board-corner">Priority</div>
          <div className="ff-records-archive__label" aria-hidden="true">Monitor Grid A-01</div>
          <div className="ff-records-archive__rail" aria-hidden="true" />
          <div className="ff-dossier-index__header">
            <div>
              <p className="ff-dossier-index__eyebrow">Recovered Camera Grid</p>
              <h1 className="ff-glow ff-safe-wrap ff-dossier-index__title">Priority Feed Bank</h1>
            </div>
            <div className="ff-dossier-index__badge">Open feed logic</div>
          </div>
          <p className="ff-safe-wrap ff-dossier-index__intro">
            Ranked routes are presented like recovered surveillance feeds inside the vault. Each screen opens a list route, while the attached HUD note shows which spreadsheet signals and control flags pushed that feed into the live bank.
          </p>
          <p className="ff-board-filed">Filed Under Priority Feed Bank</p>

          <div className="ff-dossier-grid ff-record-grid" role="list" aria-label="Ranked list routes">
            {listEntries.map((list) => (
              <Link key={list.key} href={list.href} className={`ff-dossier-card ff-dossier-card--list ff-record-card ff-record-card--priority ff-record-card--${list.status.tone} ff-monitor-card ff-monitor-card--priority`} role="listitem">
                <div className="ff-dossier-card__frame ff-record-card__frame ff-monitor-card__frame">
                  <div className="ff-record-card__index-strip" aria-hidden="true">
                    <span className="ff-record-card__index-label">Channel Feed</span>
                    <span className="ff-record-card__barcode" />
                  </div>
                  <span className="ff-dossier-card__hardware" aria-hidden="true" />
                  <div className="ff-dossier-card__topline">
                    <span className="ff-dossier-card__code">Feed {list.code}</span>
                    <span className="ff-dossier-card__stamp">{list.stamp}</span>
                  </div>
                  <div className={`ff-dossier-card__status ff-dossier-card__status--${list.status.tone}`}>{list.status.label}</div>

                  <div className="ff-monitor-feed" aria-hidden="true">
                    <div className="ff-monitor-feed__screen">
                      <div className="ff-monitor-feed__hud ff-monitor-feed__hud--top">
                        <span>REC</span>
                        <span>CH {list.code}</span>
                        <span>{list.count} FILES</span>
                      </div>
                      <div className="ff-monitor-feed__main">
                        {list.leadPosterUrl ? (
                          <Image
                            src={list.leadPosterUrl}
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
                        {list.backupPosterUrl ? (
                          <Image
                            src={list.backupPosterUrl}
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
                        <span>{list.leadTitle || list.label}</span>
                        <span>TC 00:14:27</span>
                      </div>
                    </div>
                    <div className="ff-monitor-feed__caption">Recovered ranking feed</div>
                  </div>

                  <div className="ff-dossier-card__body">
                    <h2 className="ff-safe-wrap ff-dossier-card__title">{list.label}</h2>
                    <div className="ff-dossier-card__meta">
                      <span>{list.count} titles</span>
                      <span>{list.rule}</span>
                      <span>{list.signal}</span>
                    </div>
                    <p className="ff-safe-wrap ff-dossier-card__preview">
                      {list.previewTitles.length > 0 ? list.previewTitles.join(" • ") : "No case files are ranked here yet."}
                    </p>
                    <p className="ff-safe-wrap ff-dossier-card__annotation">{list.annotation}</p>
                  </div>

                  <div className="ff-dossier-card__hover" aria-hidden="true">
                    <p className="ff-dossier-card__hover-label">How this list was built</p>
                    <p className="ff-safe-wrap ff-dossier-card__hover-copy">{list.detail}</p>
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