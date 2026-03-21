import { movies } from "./movies";

export const rankedListKeys = [
  "scariest",
  "beginner-friendly",
  "top-25-most-recommended",
  "hidden-gems",
  "most-disturbing",
  "movies-that-feel-real",
];

function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getRecommendationScore(movie) {
  return toNumber(movie.recommendationScore, toNumber(movie.scareScore));
}

export function getDisturbingLevel(movie) {
  return toNumber(movie.disturbingLevel, toNumber(movie.disturbingScore));
}

export function getJumpScareLevel(movie) {
  return toNumber(movie.jumpScareLevel, toNumber(movie.scareScore));
}

export function getFearIndex(movie) {
  const savedFearIndex = toNumber(movie.fearIndex, -1);
  if (savedFearIndex >= 0) {
    return savedFearIndex;
  }

  return roundToTenth(movie.realismScore * 0.4 + getDisturbingLevel(movie) * 0.6);
}

export function getFearCategory(movie) {
  if (movie.fearCategory) {
    return movie.fearCategory;
  }

  const fearIndex = getFearIndex(movie);
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

export function getScariestScore(movie) {
  return roundToTenth(
    getDisturbingLevel(movie) * 0.5 +
      getJumpScareLevel(movie) * 0.3 +
      toNumber(movie.realismScore) * 0.2
  );
}

function compareStrings(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}

function compareBy(getters) {
  return (left, right) => {
    for (const getter of getters) {
      const result = getter(left, right);
      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };
}

const sortByTitle = (left, right) => compareStrings(left.title, right.title);
const sortByYearDesc = (left, right) => toNumber(right.year) - toNumber(left.year);

function sortMovies(listMovies, comparators) {
  return [...listMovies].sort(compareBy([...comparators, sortByTitle, sortByYearDesc]));
}

function getScariestMovies() {
  return sortMovies(movies, [
    (left, right) => getScariestScore(right) - getScariestScore(left),
    (left, right) => getFearIndex(right) - getFearIndex(left),
    (left, right) => getRecommendationScore(right) - getRecommendationScore(left),
  ]);
}

function getTopRecommendedMovies() {
  return sortMovies(
    movies.filter((movie) => getRecommendationScore(movie) >= 9),
    [
      (left, right) => getRecommendationScore(right) - getRecommendationScore(left),
      (left, right) => getFearIndex(right) - getFearIndex(left),
      (left, right) => getScariestScore(right) - getScariestScore(left),
    ]
  ).slice(0, 25);
}

function getHiddenGemMovies() {
  return sortMovies(
    movies.filter((movie) => movie.hiddenGem),
    [
      (left, right) => getRecommendationScore(right) - getRecommendationScore(left),
      (left, right) => getFearIndex(right) - getFearIndex(left),
      (left, right) => getScariestScore(right) - getScariestScore(left),
    ]
  );
}

function getBeginnerFriendlyMovies() {
  return sortMovies(
    movies.filter((movie) => movie.beginnerFriendly),
    [
      (left, right) => getRecommendationScore(right) - getRecommendationScore(left),
      (left, right) => getFearIndex(left) - getFearIndex(right),
      (left, right) => toNumber(left.realismScore) - toNumber(right.realismScore),
    ]
  );
}

function getMostDisturbingMovies() {
  return sortMovies(movies, [
    (left, right) => getDisturbingLevel(right) - getDisturbingLevel(left),
    (left, right) => getFearIndex(right) - getFearIndex(left),
    (left, right) => getRecommendationScore(right) - getRecommendationScore(left),
  ]);
}

function getMoviesThatFeelReal() {
  return sortMovies(movies, [
    (left, right) => toNumber(right.realismScore) - toNumber(left.realismScore),
    (left, right) => getFearIndex(right) - getFearIndex(left),
    (left, right) => getRecommendationScore(right) - getRecommendationScore(left),
  ]);
}

const listResolvers = {
  scariest: getScariestMovies,
  "top-25-most-recommended": getTopRecommendedMovies,
  "hidden-gems": getHiddenGemMovies,
  "beginner-friendly": getBeginnerFriendlyMovies,
  "most-disturbing": getMostDisturbingMovies,
  "movies-that-feel-real": getMoviesThatFeelReal,
};

const listCache = new Map();

export function getMoviesForList(listKey) {
  if (!listCache.has(listKey)) {
    const resolver = listResolvers[listKey];
    listCache.set(listKey, resolver ? resolver() : []);
  }

  return listCache.get(listKey);
}

export function getListKeysForMovie(movie) {
  const listKeys = [];

  if (getRecommendationScore(movie) >= 9) {
    listKeys.push("top-25-most-recommended");
  }
  if (movie.hiddenGem) {
    listKeys.push("hidden-gems");
  }
  if (movie.beginnerFriendly) {
    listKeys.push("beginner-friendly");
  }
  if (getScariestScore(movie) >= 8) {
    listKeys.push("scariest");
  }
  if (getDisturbingLevel(movie) >= 8) {
    listKeys.push("most-disturbing");
  }
  if (toNumber(movie.realismScore) >= 8) {
    listKeys.push("movies-that-feel-real");
  }

  return rankedListKeys.filter((listKey) => listKeys.includes(listKey));
}
