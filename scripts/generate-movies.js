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

const EXCLUDED_TMDB_IDS = new Set([
  "1533683",
]);

const TITLE_OVERRIDES = {
  "Apocalypse Cult": {
    posterUrl: "https://image.tmdb.org/t/p/w500//8cUqTiHp0alYeV2JKHiFKu4a9iu.jpg",
    tmdbUrl: "https://www.themoviedb.org/movie/260163",
  },
  "The Blair Witch Project": {
    extraTags: ["quiz-core", "quiz-starter", "slow-burn", "woods", "folk-horror", "bleak-ending"],
    quizTraits: {
      scareLevel: "high",
      pace: "slow-burn",
      realism: "high",
      threat: "unseen-witch",
      setting: "woods",
      format: "camcorder",
      vibe: ["bleak", "minimalist", "paranoid"],
    },
  },
  "Blair Witch": {
    extraTags: ["quiz-core", "quiz-starter", "woods", "jump-scares", "night-vision", "chaotic"],
    quizTraits: {
      scareLevel: "high",
      pace: "relentless",
      realism: "medium",
      threat: "unseen-witch",
      setting: "woods",
      format: "camcorder",
      vibe: ["chaotic", "claustrophobic", "panic"],
    },
  },
  "REC": {
    extraTags: ["quiz-core", "quiz-starter", "infection", "apartment-block", "reporter", "relentless"],
    quizTraits: {
      scareLevel: "extreme",
      pace: "relentless",
      realism: "high",
      threat: "infection",
      setting: "apartment-building",
      format: "news-camera",
      vibe: ["chaotic", "trapped", "intense"],
    },
  },
  "Paranormal Activity": {
    extraTags: ["quiz-core", "quiz-starter", "suburban-house", "minimalist", "demonic", "creeping-dread"],
    quizTraits: {
      scareLevel: "medium",
      pace: "slow-burn",
      realism: "high",
      threat: "demonic-entity",
      setting: "house",
      format: "home-surveillance",
      vibe: ["minimalist", "tense", "domestic"],
    },
  },
  "Hell House LLC": {
    extraTags: ["quiz-core", "quiz-starter", "haunted-house", "found-footage-crew", "clown-mannequins", "escalating"],
    quizTraits: {
      scareLevel: "high",
      pace: "balanced",
      realism: "medium",
      threat: "haunting",
      setting: "haunted-attraction",
      format: "documentary-mix",
      vibe: ["creepy", "escalating", "claustrophobic"],
    },
  },
  "The Taking of Deborah Logan": {
    extraTags: ["quiz-core", "quiz-starter", "medical-doc", "possession", "elderly-lead", "disturbing"],
    quizTraits: {
      scareLevel: "high",
      pace: "balanced",
      realism: "high",
      threat: "possession",
      setting: "house",
      format: "documentary",
      vibe: ["disturbing", "tragic", "escalating"],
    },
  },
  "Grave Encounters": {
    extraTags: ["quiz-core", "quiz-starter", "asylum", "ghost-hunters", "maze-like", "funhouse-nightmare"],
    quizTraits: {
      scareLevel: "high",
      pace: "balanced",
      realism: "medium",
      threat: "haunting",
      setting: "asylum",
      format: "ghost-hunting-show",
      vibe: ["claustrophobic", "surreal", "creepy"],
    },
  },
  "Gonjiam: Haunted Asylum": {
    extraTags: ["quiz-core", "quiz-starter", "asylum", "livestream", "group-watch", "escalating-chaos"],
    quizTraits: {
      scareLevel: "extreme",
      pace: "relentless",
      realism: "medium",
      threat: "haunting",
      setting: "asylum",
      format: "livestream",
      vibe: ["intense", "chaotic", "claustrophobic"],
    },
  },
  "Noroi: The Curse": {
    extraTags: ["quiz-core", "quiz-starter", "occult-investigation", "japanese-horror", "curse", "dense-lore"],
    quizTraits: {
      scareLevel: "high",
      pace: "slow-burn",
      realism: "high",
      threat: "curse",
      setting: "multiple-locations",
      format: "documentary-investigation",
      vibe: ["unsettling", "occult", "layered"],
    },
  },
  "Cloverfield": {
    extraTags: ["quiz-core", "quiz-starter", "monster-attack", "citywide-chaos", "blockbuster", "survival-run"],
    quizTraits: {
      scareLevel: "high",
      pace: "relentless",
      realism: "medium",
      threat: "monster",
      setting: "city",
      format: "party-camcorder",
      vibe: ["chaotic", "spectacle", "urgent"],
    },
  },
  "Host": {
    extraTags: ["quiz-core", "quiz-starter", "screenlife", "seance", "pandemic", "fast-runtime"],
    quizTraits: {
      scareLevel: "high",
      pace: "relentless",
      realism: "medium",
      threat: "demonic-entity",
      setting: "digital-space",
      format: "screenlife",
      vibe: ["tense", "immediate", "modern"],
    },
  },
  "As Above, So Below": {
    extraTags: ["quiz-core", "quiz-batch-2", "catacombs", "occult", "claustrophobic", "expedition"],
    quizTraits: {
      scareLevel: "high",
      pace: "relentless",
      realism: "medium",
      threat: "curse",
      setting: "catacombs",
      format: "expedition-camcorder",
      vibe: ["claustrophobic", "occult", "intense"],
    },
  },
  "Afflicted": {
    extraTags: ["quiz-core", "quiz-batch-2", "travel", "body-horror", "tragic", "infection"],
    quizTraits: {
      scareLevel: "high",
      pace: "relentless",
      realism: "high",
      threat: "infection",
      setting: "multiple-locations",
      format: "travel-documentary",
      vibe: ["tragic", "intense", "disturbing"],
    },
  },
  "Butterfly Kisses": {
    extraTags: ["quiz-core", "quiz-batch-2", "urban-legend", "meta", "curse", "documentary"],
    quizTraits: {
      scareLevel: "medium",
      pace: "slow-burn",
      realism: "high",
      threat: "curse",
      setting: "multiple-locations",
      format: "documentary-investigation",
      vibe: ["creepy", "layered", "paranoid"],
    },
  },
  "The Bay": {
    extraTags: ["quiz-core", "quiz-batch-2", "infection", "coastal-town", "gross-out", "news-footage"],
    quizTraits: {
      scareLevel: "extreme",
      pace: "relentless",
      realism: "high",
      threat: "infection",
      setting: "coastal-town",
      format: "documentary-mix",
      vibe: ["disturbing", "chaotic", "grounded"],
    },
  },
  "The Borderlands": {
    extraTags: ["quiz-core", "quiz-batch-2", "church", "folk-horror", "religious-dread", "bleak"],
    quizTraits: {
      scareLevel: "high",
      pace: "slow-burn",
      realism: "high",
      threat: "haunting",
      setting: "church",
      format: "documentary-investigation",
      vibe: ["bleak", "claustrophobic", "occult"],
    },
  },
  "Willow Creek": {
    extraTags: ["quiz-core", "quiz-batch-2", "cryptid", "woods", "camping", "naturalistic"],
    quizTraits: {
      scareLevel: "medium",
      pace: "slow-burn",
      realism: "high",
      threat: "monster",
      setting: "woods",
      format: "camcorder",
      vibe: ["bleak", "creepy", "naturalistic"],
    },
  },
  "Incantation": {
    extraTags: ["quiz-core", "quiz-batch-2", "curse", "occult", "family-horror", "disturbing"],
    quizTraits: {
      scareLevel: "extreme",
      pace: "relentless",
      realism: "medium",
      threat: "curse",
      setting: "multiple-locations",
      format: "documentary-mix",
      vibe: ["disturbing", "occult", "chaotic"],
    },
  },
  "V/H/S": {
    extraTags: ["quiz-core", "quiz-batch-2", "anthology", "tapes", "wild", "multiple-threats"],
    quizTraits: {
      scareLevel: "high",
      pace: "balanced",
      realism: "low",
      threat: "multiple-threats",
      setting: "multiple-locations",
      format: "anthology-tapes",
      vibe: ["chaotic", "disturbing", "wild"],
    },
  },
  "Unfriended": {
    extraTags: ["quiz-core", "quiz-batch-2", "screenlife", "cyberbullying", "digital-haunting", "modern"],
    quizTraits: {
      scareLevel: "high",
      pace: "relentless",
      realism: "medium",
      threat: "haunting",
      setting: "digital-space",
      format: "screenlife",
      vibe: ["modern", "chaotic", "mean"],
    },
  },
  "Deadstream": {
    extraTags: ["quiz-core", "quiz-batch-2", "livestream", "haunted-house", "horror-comedy", "creator-lead"],
    quizTraits: {
      scareLevel: "medium",
      pace: "relentless",
      realism: "medium",
      threat: "haunting",
      setting: "house",
      format: "livestream",
      vibe: ["funny", "chaotic", "creepy"],
    },
  },
  "The Last Exorcism": {
    extraTags: ["quiz-core", "quiz-batch-2", "possession", "rural", "documentary", "religious"],
    quizTraits: {
      scareLevel: "high",
      pace: "balanced",
      realism: "high",
      threat: "possession",
      setting: "rural-house",
      format: "documentary",
      vibe: ["grim", "religious", "disturbing"],
    },
  },
  "The Sacrament": {
    extraTags: ["quiz-core", "quiz-batch-2", "cult", "compound", "journalism", "bleak"],
    quizTraits: {
      scareLevel: "high",
      pace: "balanced",
      realism: "high",
      threat: "cult",
      setting: "compound",
      format: "documentary",
      vibe: ["bleak", "paranoid", "disturbing"],
    },
  },
  "Savageland": {
    extraTags: ["quiz-core", "quiz-batch-2", "mockumentary", "desert-town", "photo-evidence", "bleak"],
    quizTraits: {
      scareLevel: "high",
      pace: "slow-burn",
      realism: "high",
      threat: "monster",
      setting: "desert-town",
      format: "mockumentary-photo-evidence",
      vibe: ["bleak", "unsettling", "layered"],
    },
  },
  "Lake Mungo": {
    extraTags: ["quiz-core", "quiz-batch-2", "grief-horror", "australian-horror", "fake-documentary", "ghost-story"],
    quizTraits: {
      scareLevel: "medium",
      pace: "slow-burn",
      realism: "high",
      threat: "haunting",
      setting: "multiple-locations",
      format: "documentary",
      vibe: ["bleak", "tragic", "unsettling"],
    },
  },
  "The Visit": {
    extraTags: ["quiz-core", "quiz-batch-2", "mockumentary", "grandparents", "family-horror", "deception"],
    quizTraits: {
      scareLevel: "medium",
      pace: "balanced",
      realism: "high",
      threat: "cult",
      setting: "house",
      format: "documentary",
      vibe: ["creepy", "grounded", "paranoid"],
    },
  },
  Creep: {
    extraTags: ["quiz-core", "quiz-batch-2", "character-study", "awkward-horror", "serial-killer", "uncomfortable"],
    quizTraits: {
      scareLevel: "high",
      pace: "balanced",
      realism: "high",
      threat: "cult",
      setting: "house",
      format: "camcorder",
      vibe: ["paranoid", "disturbing", "grounded"],
    },
  },
};

const MANUAL_MOVIES = [
  {
    title: "REC",
    year: 2007,
    slug: "rec-2007",
    synopsis: "A television reporter and her cameraman become trapped inside a Barcelona apartment building as a violent infection spreads floor by floor and turns a routine night shoot into total panic.",
    categories: ["zombie-infection", "haunted-location"],
    scareScore: 8.4,
    realismScore: 8.6,
    disturbingScore: 8,
    disturbingLevel: 8,
    jumpScareLevel: 8,
    recommendationScore: 9,
    fearIndex: 8.2,
    fearCategory: "Terrifying",
    beginnerFriendly: false,
    hiddenGem: false,
    posterUrl: "https://image.tmdb.org/t/p/w500/3JHY1jN8oDc5bJYM0fZQpJf7j0b.jpg",
    tmdbUrl: "https://www.themoviedb.org/movie/8329",
    relatedMovies: ["Gonjiam: Haunted Asylum", "Hell House LLC", "Paranormal Activity"],
    tags: ["found-footage", "infection", "apartment-building", "reporter", "nightmare", "relentless"],
  },
  {
    title: "Lake Mungo",
    year: 2008,
    slug: "lake-mungo-2008",
    synopsis: "After the accidental death of their teenage daughter, a grieving family begins to experience strange events that push their home-video memories into something far more disturbing.",
    categories: ["haunted-location", "psychological"],
    scareScore: 7.1,
    realismScore: 9,
    disturbingScore: 7,
    disturbingLevel: 7,
    jumpScareLevel: 2,
    recommendationScore: 9,
    fearIndex: 7.8,
    fearCategory: "Very Scary",
    beginnerFriendly: true,
    hiddenGem: true,
    posterUrl: "https://image.tmdb.org/t/p/w500/g0zCELYfBfSv8TOGC13buABVN53.jpg",
    tmdbUrl: "https://www.themoviedb.org/movie/27374",
    relatedMovies: ["Noroi: The Curse", "Butterfly Kisses", "Host"],
    tags: ["found-footage", "documentary", "ghosts", "slow-burn", "grief", "australia"],
  },
  {
    title: "Creep",
    year: 2014,
    slug: "creep-2014",
    synopsis: "A videographer answers an online ad for a one-day job in a remote mountain town and gradually realizes his client is much more dangerous than he first seemed.",
    categories: ["psychological", "serial-killer"],
    scareScore: 7.8,
    realismScore: 9,
    disturbingScore: 8,
    disturbingLevel: 8,
    jumpScareLevel: 3,
    recommendationScore: 9,
    fearIndex: 8.4,
    fearCategory: "Terrifying",
    beginnerFriendly: true,
    hiddenGem: false,
    posterUrl: "https://image.tmdb.org/t/p/w500/qn53D574tT0YRyLgirEFHQwGUXw.jpg",
    tmdbUrl: "https://www.themoviedb.org/movie/250574",
    relatedMovies: ["Host", "The Sacrament", "The Taking of Deborah Logan"],
    tags: ["found-footage", "camcorder", "awkward", "human-threat", "cabin", "killer"],
  },
  {
    title: "The Visit",
    year: 2015,
    slug: "the-visit-2015",
    synopsis: "Two siblings travel to rural Pennsylvania to spend a week with their estranged grandparents, only to document increasingly disturbing behavior that turns a family visit into a trap.",
    categories: ["psychological", "serial-killer"],
    scareScore: 7.1,
    realismScore: 8.6,
    disturbingScore: 6.8,
    disturbingLevel: 7,
    jumpScareLevel: 5,
    recommendationScore: 8,
    fearIndex: 7.6,
    fearCategory: "Very Scary",
    beginnerFriendly: true,
    hiddenGem: false,
    posterUrl: "https://image.tmdb.org/t/p/w500/qoel6LJjVJ9X9V4VQ4tQW4gf0PZ.jpg",
    tmdbUrl: "https://www.themoviedb.org/movie/298312",
    relatedMovies: ["Creep", "Butterfly Kisses", "The Taking of Deborah Logan"],
    tags: ["found-footage", "documentary", "mockumentary", "grandparents", "suburban-house", "family-horror", "deception", "human-threat"],
  },
];

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

function buildTmdbUrl(record) {
  const directUrl = toText(record.tmdbUrl);
  if (/^https?:\/\//i.test(directUrl)) {
    return directUrl;
  }

  const tmdbId = toText(record.tmdbId || record.tmdbUrl).match(/\d+/)?.[0];
  return tmdbId ? `https://www.themoviedb.org/movie/${tmdbId}` : "";
}

function getImportedYear(record) {
  const maxYear = new Date().getFullYear() + 1;
  const explicitYear = Math.trunc(toNumber(record.year));
  if (explicitYear >= 1960 && explicitYear <= maxYear) {
    return explicitYear;
  }

  const releaseYear = Math.trunc(toNumber(String(record.releaseDate || "").slice(0, 4)));
  if (releaseYear >= 1960 && releaseYear <= maxYear) {
    return releaseYear;
  }

  return 0;
}

function hasUsableSynopsis(value) {
  return toText(value).length >= 20;
}

function normalizeTitle(title) {
  return TITLE_ALIASES[title] || title;
}

function applyTitleOverrides(movie) {
  const overrides = TITLE_OVERRIDES[movie.title];
  if (!overrides) {
    return movie;
  }

  const {
    extraTags = [],
    extraRelatedMovies = [],
    ...restOverrides
  } = overrides;

  return {
    ...movie,
    ...restOverrides,
    tags: unique([...(movie.tags || []), ...extraTags]),
    relatedMovies: unique([...(movie.relatedMovies || []), ...extraRelatedMovies]),
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

function mergeMovieRecord(merged, candidate) {
  const existing = merged.get(candidate.slug);
  if (!existing) {
    merged.set(candidate.slug, candidate);
    return;
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
  if (!existing.quizTraits && candidate.quizTraits) {
    existing.quizTraits = candidate.quizTraits;
  }
}

function main() {
  const csvText = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(csvText);
  const dataRows = rows.slice(1);
  const merged = new Map();
  const skippedRecords = [];

  for (const columns of dataRows) {
    const record = Object.fromEntries(HEADERS.map((header, index) => [header, columns[index] || ""]));
    const title = normalizeTitle(toText(record.title));
    if (!title) {
      continue;
    }

    const sourceTmdbId = toText(record.tmdbId);
    if (sourceTmdbId && EXCLUDED_TMDB_IDS.has(sourceTmdbId)) {
      skippedRecords.push(`${title}: excluded source record ${sourceTmdbId}.`);
      continue;
    }

    const category = CATEGORY_MAP[toText(record.primaryCategory)];
    if (!category) {
      continue;
    }

    const year = getImportedYear(record);
    if (!year) {
      skippedRecords.push(`${title}: invalid or missing release year.`);
      continue;
    }

    if (!hasUsableSynopsis(record.overview)) {
      skippedRecords.push(`${title}: synopsis is missing or too short.`);
      continue;
    }

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
      tmdbUrl: buildTmdbUrl(record),
      relatedMovies: unique([toText(record.because1), toText(record.because2), toText(record.because3)]),
      tags,
    });
    candidate.lists = buildLists(candidate);

    mergeMovieRecord(merged, candidate);
  }

  for (const movie of MANUAL_MOVIES) {
    const candidate = applyTitleOverrides({
      ...movie,
      tags: unique(movie.tags || []),
      relatedMovies: unique(movie.relatedMovies || []),
    });
    candidate.lists = buildLists(candidate);
    mergeMovieRecord(merged, candidate);
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

  if (skippedRecords.length > 0) {
    console.log(`Skipped ${skippedRecords.length} CSV records:`);
    skippedRecords.forEach((entry) => console.log(`- ${entry}`));
  }

  console.log(`Wrote ${movies.length} movies to ${outPath}`);
}

main();
