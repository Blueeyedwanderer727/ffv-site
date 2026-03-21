const fs = require("fs");
const path = require("path");

const csvPath = "C:/Users/Niki/Downloads/Found Footage Movie Database - FF Movies w_poster URL.csv";
const outPath = path.join(__dirname, "..", "app", "data", "movies.js");

const CATEGORY_MAP = {
  "Alien": "alien",
  "Anthology": "anthology",
  "Cryptid": "cryptid",
  "Cult / Conspiracy": "cult-conspiracy",
  "Haunted Location": "haunted-location",
  "Monster": "monster",
  "Possession": "possession",
  "Psychological": "psychological",
  "Screenlife": "screenlife",
  "Serial Killer": "serial-killer",
  "Witchcraft": "witchcraft",
  "Zombie / Infection": "zombie-infection",
};

const TITLE_ALIASES = {
  Apocalyptic: "Apocalypse Cult",
};

const TITLE_OVERRIDES = {
  "Apocalypse Cult": {
    posterUrl: "https://image.tmdb.org/t/p/w500//8cUqTiHp0alYeV2JKHiFKu4a9iu.jpg",
    tmdbUrl: "https://www.themoviedb.org/movie/260163",
  },
};

const HEADERS = [
  "title",
  "tmdbId",
  "releaseDate",
  "year",
  "language",
  "country",
  "decade",
  "primaryCategory",
  "recommendationScore",
  "realismScore",
  "runtime",
  "overview",
  "posterUrl",
  "posterPath",
  "tmdbUrl",
  "tmdbSearch",
  "secondaryCategory",
  "format",
  "disturbingLevel",
  "jumpScareLevel",
  "beginnerFriendly",
  "hiddenGem",
  "streamingCapability",
  "streamingLastChecked",
  "because1",
  "because2",
  "because3",
  "vibeTags",
  "settingTags",
  "threatTags",
  "toneTags",
  "scareScore",
  "fearIndex",
  "fearCategory",
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      value = "";
      if (row.length > 1 || row[0] !== "") {
        rows.push(row);
      }
      row = [];
      continue;
    }

    value += char;
  }

  if (value !== "" || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitTags(value) {
  return String(value || "")
    .split(",")
    .map((item) => slugify(item))
    .filter(Boolean);
}

function toNumber(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return 0;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBoolean(value) {
  return String(value || "").trim().toLowerCase() === "yes";
}

function toText(value) {
  return String(value || "").trim();
}

function normalizeTitle(title) {
  return TITLE_ALIASES[title] || title;
}

function applyTitleOverrides(movie) {
  const overrides = TITLE_OVERRIDES[movie.title];
  if (!overrides) {
    return movie;
  }

  return {
    ...movie,
    ...overrides,
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}

function computeFearIndex(realismScore, disturbingLevel, fallbackFearIndex) {
  if (fallbackFearIndex > 0) {
    return fallbackFearIndex;
  }

  return roundToTenth(realismScore * 0.4 + disturbingLevel * 0.6);
}

function computeFearCategory(fearIndex, fallbackFearCategory) {
  if (fallbackFearCategory) {
    return fallbackFearCategory;
  }

  if (fearIndex > 9) {
    return "Extreme Terror";
  }
  if (fearIndex > 8) {
    return "Terrifying";
  }
  if (fearIndex > 7) {
    return "Very Scary";
  }
  if (fearIndex > 6) {
    return "Creepy";
  }

  return "Unsettling";
}

function computeScareScore(disturbingLevel, jumpScareLevel, realismScore, fallbackScareScore) {
  if (disturbingLevel > 0 && jumpScareLevel > 0) {
    return roundToTenth(disturbingLevel * 0.5 + jumpScareLevel * 0.3 + realismScore * 0.2);
  }

  return fallbackScareScore > 0 ? fallbackScareScore : roundToTenth(realismScore * 0.2 + disturbingLevel * 0.8);
}

function buildLists(movie) {
  const lists = [];

  if (movie.scareScore >= 8) {
    lists.push("scariest");
  }
  if (movie.recommendationScore >= 9) {
    lists.push("top-25-most-recommended");
  }
  if (movie.beginnerFriendly) {
    lists.push("beginner-friendly");
  }
  if (movie.hiddenGem) {
    lists.push("hidden-gems");
  }
  if (movie.disturbingScore >= 8) {
    lists.push("most-disturbing");
  }
  if (movie.realismScore >= 8) {
    lists.push("movies-that-feel-real");
  }

  return unique(lists);
}

function main() {
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const dataRows = rows.slice(1);
  const merged = new Map();

  for (const columns of dataRows) {
    const record = Object.fromEntries(HEADERS.map((header, index) => [header, columns[index] || ""]));
    const title = normalizeTitle(toText(record.title));
    if (!title) {
      continue;
    }

    const category = CATEGORY_MAP[toText(record.primaryCategory)];
    if (!category) {
      continue;
    }

    const year = Math.trunc(toNumber(record.year));
    const baseSlug = slugify(title);
    if (!baseSlug) {
      continue;
    }

    const slug = year > 0 ? `${baseSlug}-${year}` : baseSlug;
    const tags = unique([
      ...splitTags(record.vibeTags),
      ...splitTags(record.settingTags),
      ...splitTags(record.threatTags),
      ...splitTags(record.toneTags),
      slugify(record.format),
    ]);

    const realismScore = toNumber(record.realismScore);
    const disturbingLevel = toNumber(record.disturbingLevel);
    const jumpScareLevel = toNumber(record.jumpScareLevel);
    const recommendationScore = toNumber(record.recommendationScore);
    const fearIndex = computeFearIndex(realismScore, disturbingLevel, toNumber(record.fearIndex));
    const fearCategory = computeFearCategory(fearIndex, toText(record.fearCategory));
    const scareScore = computeScareScore(
      disturbingLevel,
      jumpScareLevel,
      realismScore,
      toNumber(record.scareScore)
    );

    const candidate = applyTitleOverrides({
      title,
      year,
      slug,
      synopsis: toText(record.overview),
      categories: [category],
      scareScore,
      realismScore,
      disturbingScore: disturbingLevel,
      disturbingLevel,
      jumpScareLevel,
      recommendationScore,
      fearIndex,
      fearCategory,
      beginnerFriendly: toBoolean(record.beginnerFriendly),
      hiddenGem: toBoolean(record.hiddenGem),
      posterUrl: toText(record.posterUrl),
      tmdbUrl: toText(record.tmdbUrl),
      relatedMovies: unique([toText(record.because1), toText(record.because2), toText(record.because3)]),
      tags,
    });
    candidate.lists = buildLists(candidate);

    const existing = merged.get(slug);
    if (!existing) {
      merged.set(slug, candidate);
      continue;
    }

    existing.categories = unique([...existing.categories, ...candidate.categories]);
    existing.tags = unique([...existing.tags, ...candidate.tags]);
    existing.lists = unique([...existing.lists, ...candidate.lists]);
    existing.relatedMovies = unique([...existing.relatedMovies, ...candidate.relatedMovies]);
    existing.scareScore = Math.max(existing.scareScore, candidate.scareScore);
    existing.realismScore = Math.max(existing.realismScore, candidate.realismScore);
    existing.disturbingScore = Math.max(existing.disturbingScore, candidate.disturbingScore);
    existing.disturbingLevel = Math.max(existing.disturbingLevel, candidate.disturbingLevel);
    existing.jumpScareLevel = Math.max(existing.jumpScareLevel, candidate.jumpScareLevel);
    existing.recommendationScore = Math.max(existing.recommendationScore, candidate.recommendationScore);
    existing.fearIndex = Math.max(existing.fearIndex, candidate.fearIndex);
    if (!existing.fearCategory && candidate.fearCategory) {
      existing.fearCategory = candidate.fearCategory;
    }
    existing.beginnerFriendly = existing.beginnerFriendly || candidate.beginnerFriendly;
    existing.hiddenGem = existing.hiddenGem || candidate.hiddenGem;
    if (!existing.posterUrl && candidate.posterUrl) {
      existing.posterUrl = candidate.posterUrl;
    }
    if (!existing.tmdbUrl && candidate.tmdbUrl) {
      existing.tmdbUrl = candidate.tmdbUrl;
    }
    if (!existing.synopsis && candidate.synopsis) {
      existing.synopsis = candidate.synopsis;
    }
  }

  const movies = [...merged.values()]
    .sort((left, right) => left.title.localeCompare(right.title))
    .map((movie) => ({
      ...movie,
      lists: buildLists(movie),
    }));

  const fileContents = [
    "// movies.js - Found Footage Movie Database",
    "// This file contains an array of movie objects for the site.",
    "",
    `export const movies = ${JSON.stringify(movies, null, 2)};`,
    "",
    "export default movies;",
    "",
  ].join("\n");

  fs.writeFileSync(outPath, fileContents, "utf8");
  console.log(`Wrote ${movies.length} movies to ${outPath}`);
}

main();
