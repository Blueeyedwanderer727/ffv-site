import { getFearCategory, getFearIndex } from "./listRankings";

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.filter(Boolean);
}

export function movieMatchesFilters(
  movie,
  {
    searchText = "",
    minScore = 0,
    maxScore = 10,
    minRealismScore = 0,
    maxRealismScore = 10,
    minFearIndex = 0,
    maxFearIndex = 10,
    category = "",
    fearCategory = "",
    tags = [],
    beginnerFriendly = false,
  } = {}
) {
  const normalizedSearch = normalizeSearchText(searchText);
  const movieFearIndex = getFearIndex(movie);
  const movieTags = normalizeTags(movie.tags);
  const realismScore = Number(movie.realismScore);
  const synopsis = String(movie.synopsis || "").toLowerCase();
  const title = String(movie.title || "").toLowerCase();

  const matchesSearch =
    normalizedSearch === "" || title.includes(normalizedSearch) || synopsis.includes(normalizedSearch);
  const matchesScore =
    typeof movie.scareScore === "number" && movie.scareScore >= minScore && movie.scareScore <= maxScore;
  const matchesRealism = Number.isFinite(realismScore) && realismScore >= minRealismScore && realismScore <= maxRealismScore;
  const matchesFearIndex = movieFearIndex >= minFearIndex && movieFearIndex <= maxFearIndex;
  const matchesCategory = !category || (Array.isArray(movie.categories) && movie.categories.includes(category));
  const matchesFearCategory = !fearCategory || getFearCategory(movie) === fearCategory;
  const matchesTags = tags.length === 0 || tags.every((tag) => movieTags.includes(tag));
  const matchesBeginnerFriendly = !beginnerFriendly || Boolean(movie.beginnerFriendly);

  return (
    matchesSearch &&
    matchesScore &&
    matchesRealism &&
    matchesFearIndex &&
    matchesCategory &&
    matchesFearCategory &&
    matchesTags &&
    matchesBeginnerFriendly
  );
}

export function getMovieCountForFilters(movies, filters) {
  return movies.filter((movie) => movieMatchesFilters(movie, filters)).length;
}

export function buildSearchHref({
  searchText = "",
  sort = "",
  minScore,
  maxScore,
  minRealismScore,
  maxRealismScore,
  minFearIndex,
  maxFearIndex,
  category = "",
  fearCategory = "",
  tags = [],
  beginnerFriendly = false,
} = {}) {
  const params = new URLSearchParams();

  if (searchText) {
    params.set("q", searchText);
  }
  if (sort && sort !== "scare-desc") {
    params.set("sort", sort);
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
  for (const tag of normalizeTags(tags)) {
    params.append("tag", tag);
  }

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}