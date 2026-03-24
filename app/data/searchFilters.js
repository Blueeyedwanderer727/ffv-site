import { franchiseShortcutConfigs } from "./franchises";
import { categoryLabels, listLabels } from "./labels";
import { getDisturbingLevel, getFearCategory, getFearIndex, getListKeysForMovie } from "./listRankings";

const BASE_SEARCH_ALIASES = {
  "gonjiam haunted asylum": ["gonjiam", "haunted asylum"],
  "the taking of deborah logan": ["deborah logan"],
  "creep": ["creep 2014"],
  "cult conspiracy": ["cult", "conspiracy", "cults"],
  "haunted location": ["haunted", "haunting", "ghost"],
  "serial killer": ["killer", "serial killers"],
  "zombie infection": ["zombie", "zombies", "infection"],
};

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildFranchiseSearchAliases() {
  const aliasMap = {};

  franchiseShortcutConfigs.forEach((franchise) => {
    const franchiseTerms = unique([
      franchise.searchText,
      ...(Array.isArray(franchise.shortcutTerms) ? franchise.shortcutTerms : []),
    ].map((value) => normalizeSearchText(value)));

    franchiseTerms.forEach((term) => {
      if (!term) {
        return;
      }

      aliasMap[term] = unique([
        ...(aliasMap[term] || []),
        ...franchiseTerms.filter((candidate) => candidate !== term),
      ]);
    });

    Object.entries(franchise.aliasEntries || {}).forEach(([title, aliases]) => {
      const normalizedTitle = normalizeSearchText(title);
      const normalizedAliases = unique((aliases || []).map((alias) => normalizeSearchText(alias)));
      if (!normalizedTitle || normalizedAliases.length === 0) {
        return;
      }

      aliasMap[normalizedTitle] = unique([
        ...(aliasMap[normalizedTitle] || []),
        ...normalizedAliases,
      ]);
    });
  });

  return aliasMap;
}

const SEARCH_ALIASES = Object.entries(buildFranchiseSearchAliases()).reduce(
  (mergedAliases, [term, aliases]) => ({
    ...mergedAliases,
    [term]: unique([...(mergedAliases[term] || []), ...aliases]),
  }),
  { ...BASE_SEARCH_ALIASES }
);

function getSearchTokens(value) {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function getMaxTypoDistance(value) {
  const length = String(value || "").length;
  if (length < 5) {
    return 0;
  }
  if (length < 9) {
    return 1;
  }
  return 2;
}

function getLevenshteinDistance(left, right) {
  const a = String(left || "");
  const b = String(right || "");

  if (a === b) {
    return 0;
  }
  if (!a) {
    return b.length;
  }
  if (!b) {
    return a.length;
  }

  const rows = new Array(b.length + 1);
  for (let index = 0; index <= b.length; index += 1) {
    rows[index] = index;
  }

  for (let i = 1; i <= a.length; i += 1) {
    let previous = rows[0];
    rows[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const current = rows[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[j] = Math.min(
        rows[j] + 1,
        rows[j - 1] + 1,
        previous + cost
      );
      previous = current;
    }
  }

  return rows[b.length];
}

function isFuzzyEquivalent(left, right) {
  const normalizedLeft = normalizeSearchText(left);
  const normalizedRight = normalizeSearchText(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }
  if (normalizedLeft === normalizedRight) {
    return true;
  }

  const maxDistance = Math.min(getMaxTypoDistance(normalizedLeft), getMaxTypoDistance(normalizedRight));
  if (maxDistance === 0) {
    return false;
  }

  return getLevenshteinDistance(normalizedLeft, normalizedRight) <= maxDistance;
}

function getNormalizedCandidateScore(searchValue, candidateValue) {
  const normalizedSearch = normalizeSearchText(searchValue);
  const normalizedCandidate = normalizeSearchText(candidateValue);

  if (!normalizedSearch || !normalizedCandidate) {
    return 0;
  }
  if (normalizedSearch === normalizedCandidate) {
    return 1000;
  }
  if (normalizedCandidate.startsWith(normalizedSearch)) {
    return 900;
  }
  if (normalizedCandidate.includes(normalizedSearch)) {
    return 760;
  }
  if (isFuzzyEquivalent(normalizedSearch, normalizedCandidate)) {
    return 620;
  }

  const searchTokens = getSearchTokens(normalizedSearch);
  const candidateTokens = getSearchTokens(normalizedCandidate);
  const matchingTokens = searchTokens.filter((token) => isFuzzyTokenMatch(token, candidateTokens)).length;

  if (matchingTokens === searchTokens.length && matchingTokens > 0) {
    return 520;
  }
  if (matchingTokens > 0) {
    return matchingTokens * 120;
  }

  return 0;
}

function getSearchVariants(value) {
  const source = String(value || "").trim();
  if (!source) {
    return [];
  }

  const variants = new Set([
    source,
    source.replace(/[-_/]+/g, " "),
  ]);

  return [...variants]
    .map((variant) => normalizeSearchText(variant))
    .filter(Boolean);
}

function getAliasTerms(values) {
  return unique(
    values.flatMap((value) => {
      const normalizedValue = normalizeSearchText(value);
      if (!normalizedValue) {
        return [];
      }

      return (SEARCH_ALIASES[normalizedValue] || []).flatMap((alias) => getSearchVariants(alias));
    })
  );
}

function getMovieSearchFields(movie, listKeys) {
  const categoryKeys = Array.isArray(movie?.categories) ? movie.categories : [];
  const tagKeys = normalizeTags(movie?.tags);
  const relatedTitles = Array.isArray(movie?.relatedMovies) ? movie.relatedMovies : [];
  const titleTerms = getSearchVariants(movie?.title);
  const titleAliasTerms = getAliasTerms(titleTerms);

  const categoryTerms = categoryKeys.flatMap((categoryKey) => [
    ...getSearchVariants(categoryKey),
    ...getSearchVariants(categoryLabels[categoryKey]),
    ...getAliasTerms([categoryKey, categoryLabels[categoryKey]]),
  ]);

  const listTerms = listKeys.flatMap((listKey) => [
    ...getSearchVariants(listKey),
    ...getSearchVariants(listLabels[listKey]),
    ...getAliasTerms([listKey, listLabels[listKey]]),
  ]);

  const tagTerms = tagKeys.flatMap((tag) => [...getSearchVariants(tag), ...getAliasTerms([tag])]);
  const relatedTerms = relatedTitles.flatMap((title) => [...getSearchVariants(title), ...getAliasTerms([title])]);

  return {
    title: normalizeSearchText(movie?.title),
    titleAliasTerms,
    synopsis: normalizeSearchText(movie?.synopsis),
    year: normalizeSearchText(movie?.year),
    fearCategory: normalizeSearchText(movie?.fearCategory),
    categoryTerms: [...new Set(categoryTerms)],
    listTerms: [...new Set(listTerms)],
    tagTerms: [...new Set(tagTerms)],
    relatedTerms: [...new Set(relatedTerms)],
  };
}

function getSearchFieldTerms(searchFields) {
  return unique([
    searchFields.title,
    ...searchFields.titleAliasTerms,
    searchFields.synopsis,
    searchFields.year,
    searchFields.fearCategory,
    ...searchFields.categoryTerms,
    ...searchFields.listTerms,
    ...searchFields.tagTerms,
    ...searchFields.relatedTerms,
  ]);
}

function getSearchFieldWords(searchFields) {
  return unique(
    getSearchFieldTerms(searchFields)
      .flatMap((term) => term.split(" "))
      .filter((word) => word.length >= 3)
  );
}

function isFuzzyTokenMatch(token, candidateWords) {
  return candidateWords.some((word) => {
    if (word === token || word.includes(token) || token.includes(word)) {
      return true;
    }

    return isFuzzyEquivalent(word, token);
  });
}

function fieldMatchesAllTokens(field, tokens) {
  if (!field || tokens.length === 0) {
    return false;
  }

  const fieldWords = field.split(" ").filter(Boolean);
  return tokens.every((token) => isFuzzyTokenMatch(token, fieldWords));
}

function matchesSearchText(normalizedSearch, searchFields) {
  if (!normalizedSearch) {
    return true;
  }

  const searchHaystack = buildMovieSearchHaystack(searchFields);
  if (searchHaystack.includes(normalizedSearch)) {
    return true;
  }

  const fieldTerms = getSearchFieldTerms(searchFields);
  if (fieldTerms.some((term) => isFuzzyEquivalent(term, normalizedSearch))) {
    return true;
  }

  const tokens = getSearchTokens(normalizedSearch);
  if (tokens.length > 1) {
    return fieldTerms.some((field) => fieldMatchesAllTokens(field, tokens));
  }

  const candidateWords = getSearchFieldWords(searchFields);
  return tokens.length > 0 && tokens.every((token) => isFuzzyTokenMatch(token, candidateWords));
}

function buildMovieSearchHaystack(searchFields) {
  return [
    searchFields.title,
    ...searchFields.titleAliasTerms,
    searchFields.synopsis,
    searchFields.year,
    searchFields.fearCategory,
    ...searchFields.categoryTerms,
    ...searchFields.listTerms,
    ...searchFields.tagTerms,
    ...searchFields.relatedTerms,
  ]
    .filter(Boolean)
    .join(" ");
}

function allSearchTokensMatch(tokens, value) {
  return tokens.length > 0 && tokens.every((token) => value.includes(token));
}

function anyFieldExactMatch(fields, normalizedSearch) {
  return fields.some((field) => field === normalizedSearch);
}

function anyFieldIncludes(fields, normalizedSearch) {
  return fields.some((field) => field.includes(normalizedSearch));
}

export function getSearchRelevanceScore(movie, searchText = "") {
  const normalizedSearch = normalizeSearchText(searchText);
  if (!normalizedSearch) {
    return 0;
  }

  const tokens = normalizedSearch.split(" ").filter(Boolean);
  const listKeys = getListKeysForMovie(movie);
  const searchFields = getMovieSearchFields(movie, listKeys);
  const supportingFields = [
    ...searchFields.categoryTerms,
    ...searchFields.listTerms,
    ...searchFields.tagTerms,
    ...searchFields.relatedTerms,
    searchFields.fearCategory,
  ].filter(Boolean);

  let score = 0;

  if (searchFields.title === normalizedSearch) {
    score += 1000;
  } else if (searchFields.title.startsWith(normalizedSearch)) {
    score += 850;
  } else if (allSearchTokensMatch(tokens, searchFields.title)) {
    score += 760;
  } else if (searchFields.title.includes(normalizedSearch)) {
    score += 700;
  }

  if (anyFieldExactMatch(searchFields.titleAliasTerms, normalizedSearch)) {
    score += 840;
  } else if (searchFields.titleAliasTerms.some((field) => field.startsWith(normalizedSearch))) {
    score += 720;
  } else if (anyFieldIncludes(searchFields.titleAliasTerms, normalizedSearch)) {
    score += 640;
  }

  if (searchFields.year === normalizedSearch) {
    score += 620;
  }

  if (anyFieldExactMatch(searchFields.relatedTerms, normalizedSearch)) {
    score += 560;
  } else if (anyFieldIncludes(searchFields.relatedTerms, normalizedSearch)) {
    score += 420;
  }

  if (anyFieldExactMatch(searchFields.categoryTerms, normalizedSearch)) {
    score += 540;
  } else if (anyFieldIncludes(searchFields.categoryTerms, normalizedSearch)) {
    score += 400;
  }

  if (anyFieldExactMatch(searchFields.listTerms, normalizedSearch)) {
    score += 520;
  } else if (anyFieldIncludes(searchFields.listTerms, normalizedSearch)) {
    score += 380;
  }

  if (anyFieldExactMatch(searchFields.tagTerms, normalizedSearch)) {
    score += 500;
  } else if (anyFieldIncludes(searchFields.tagTerms, normalizedSearch)) {
    score += 340;
  }

  if (searchFields.fearCategory === normalizedSearch) {
    score += 360;
  } else if (searchFields.fearCategory.includes(normalizedSearch)) {
    score += 260;
  }

  if (allSearchTokensMatch(tokens, searchFields.synopsis)) {
    score += 180;
  } else if (searchFields.synopsis.includes(normalizedSearch)) {
    score += 120;
  }

  if (supportingFields.some((field) => allSearchTokensMatch(tokens, field))) {
    score += 80;
  }

  if (score === 0 && matchesSearchText(normalizedSearch, searchFields)) {
    score += 60;
  }

  return score;
}

export function getSearchTitleMatchScore(movie, searchText = "") {
  const normalizedSearch = normalizeSearchText(searchText);
  if (!normalizedSearch) {
    return 0;
  }

  const tokens = normalizedSearch.split(" ").filter(Boolean);
  const listKeys = getListKeysForMovie(movie);
  const searchFields = getMovieSearchFields(movie, listKeys);

  if (searchFields.title === normalizedSearch) {
    return 1000;
  }
  if (anyFieldExactMatch(searchFields.titleAliasTerms, normalizedSearch)) {
    return 950;
  }
  if (searchFields.title.startsWith(normalizedSearch)) {
    return 900;
  }
  if (searchFields.titleAliasTerms.some((field) => field.startsWith(normalizedSearch))) {
    return 860;
  }
  if (allSearchTokensMatch(tokens, searchFields.title)) {
    return 820;
  }
  if (searchFields.title.includes(normalizedSearch)) {
    return 760;
  }
  if (anyFieldIncludes(searchFields.titleAliasTerms, normalizedSearch)) {
    return 720;
  }

  return 0;
}

export function getSuggestedSearchTerms(movies, searchText = "", limit = 5) {
  const normalizedSearch = normalizeSearchText(searchText);
  if (!normalizedSearch) {
    return [];
  }

  const candidateMap = new Map();

  for (const movie of movies) {
    const listKeys = getListKeysForMovie(movie);
    const candidates = [
      movie?.title,
      ...(Array.isArray(movie?.categories) ? movie.categories : []).flatMap((categoryKey) => [categoryKey, categoryLabels[categoryKey]]),
      ...listKeys.flatMap((listKey) => [listKey, listLabels[listKey]]),
      ...(Array.isArray(movie?.relatedMovies) ? movie.relatedMovies : []),
      ...normalizeTags(movie?.tags),
    ];

    for (const candidate of candidates) {
      const label = String(candidate || "").trim();
      const normalizedCandidate = normalizeSearchText(label);
      if (!label || !normalizedCandidate || normalizedCandidate === normalizedSearch) {
        continue;
      }

      const score = getNormalizedCandidateScore(normalizedSearch, label);
      if (score <= 0) {
        continue;
      }

      const existing = candidateMap.get(normalizedCandidate);
      if (!existing || score > existing.score) {
        candidateMap.set(normalizedCandidate, { label, score });
      }
    }
  }

  return [...candidateMap.values()]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.label.localeCompare(right.label);
    })
    .slice(0, limit)
    .map((entry) => entry.label);
}

export function movieMatchesFilters(
  movie,
  {
    searchText = "",
    listKey = "",
    minScore = 0,
    maxScore = 10,
    minRealismScore = 0,
    maxRealismScore = 10,
    minDisturbingScore = 0,
    minFearIndex = 0,
    maxFearIndex = 10,
    category = "",
    fearCategory = "",
    tags = [],
    beginnerFriendly = false,
    hiddenGem = false,
  } = {}
) {
  const normalizedSearch = normalizeSearchText(searchText);
  const movieFearIndex = getFearIndex(movie);
  const movieTags = normalizeTags(movie.tags);
  const realismScore = Number(movie.realismScore);
  const disturbingScore = getDisturbingLevel(movie);
  const listKeys = getListKeysForMovie(movie);
  const searchFields = getMovieSearchFields(movie, listKeys);

  const matchesSearch = matchesSearchText(normalizedSearch, searchFields);
  const matchesList = !listKey || listKeys.includes(listKey);
  const matchesScore =
    typeof movie.scareScore === "number" && movie.scareScore >= minScore && movie.scareScore <= maxScore;
  const matchesRealism = Number.isFinite(realismScore) && realismScore >= minRealismScore && realismScore <= maxRealismScore;
  const matchesDisturbing = disturbingScore >= minDisturbingScore;
  const matchesFearIndex = movieFearIndex >= minFearIndex && movieFearIndex <= maxFearIndex;
  const matchesCategory = !category || (Array.isArray(movie.categories) && movie.categories.includes(category));
  const matchesFearCategory = !fearCategory || getFearCategory(movie) === fearCategory;
  const matchesTags = tags.length === 0 || tags.every((tag) => movieTags.includes(tag));
  const matchesBeginnerFriendly = !beginnerFriendly || Boolean(movie.beginnerFriendly) || listKeys.includes("beginner-friendly");
  const matchesHiddenGem = !hiddenGem || Boolean(movie.hiddenGem) || listKeys.includes("hidden-gems");

  return (
    matchesSearch &&
    matchesList &&
    matchesScore &&
    matchesRealism &&
    matchesDisturbing &&
    matchesFearIndex &&
    matchesCategory &&
    matchesFearCategory &&
    matchesTags &&
    matchesBeginnerFriendly &&
    matchesHiddenGem
  );
}

export function getMovieCountForFilters(movies, filters) {
  return movies.filter((movie) => movieMatchesFilters(movie, filters)).length;
}

export function buildSearchHref({
  searchText = "",
  sort = "",
  listKey = "",
  minScore,
  maxScore,
  minRealismScore,
  maxRealismScore,
  minDisturbingScore,
  minFearIndex,
  maxFearIndex,
  category = "",
  fearCategory = "",
  tags = [],
  beginnerFriendly = false,
  hiddenGem = false,
} = {}) {
  const params = new URLSearchParams();

  if (searchText) {
    params.set("q", searchText);
  }
  if (sort && sort !== "scare-desc") {
    params.set("sort", sort);
  }
  if (listKey) {
    params.set("list", listKey);
  }
  if (typeof minScore === "number" && minScore !== 0) {
    params.set("minScore", String(minScore));
  }
  if (typeof maxScore === "number" && maxScore !== 10) {
    params.set("maxScore", String(maxScore));
  }
  if (typeof minRealismScore === "number" && minRealismScore !== 0) {
    params.set("minRealism", String(minRealismScore));
  }
  if (typeof maxRealismScore === "number" && maxRealismScore !== 10) {
    params.set("maxRealism", String(maxRealismScore));
  }
  if (typeof minDisturbingScore === "number" && minDisturbingScore !== 0) {
    params.set("minDisturbing", String(minDisturbingScore));
  }
  if (typeof minFearIndex === "number" && minFearIndex !== 0) {
    params.set("minFear", String(minFearIndex));
  }
  if (typeof maxFearIndex === "number" && maxFearIndex !== 10) {
    params.set("maxFear", String(maxFearIndex));
  }
  if (category) {
    params.set("category", category);
  }
  if (fearCategory) {
    params.set("fearCategory", fearCategory);
  }
  if (beginnerFriendly) {
    params.set("beginnerFriendly", "true");
  }
  if (hiddenGem) {
    params.set("hiddenGem", "true");
  }
  for (const tag of normalizeTags(tags)) {
    params.append("tag", tag);
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export function hasLegacyZeroMaxState(searchParams) {
  const rawMaxScore = searchParams.get("maxScore");
  const rawMaxRealism = searchParams.get("maxRealism");
  const rawMaxFear = searchParams.get("maxFear");

  return rawMaxScore === "0"
    && rawMaxRealism === "0"
    && rawMaxFear === "0"
    && !searchParams.get("minScore")
    && !searchParams.get("minRealism")
    && !searchParams.get("minFear");
}