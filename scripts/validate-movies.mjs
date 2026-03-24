import { movies } from "../app/data/movies.js";
import { categoryLabels, listLabels } from "../app/data/labels.js";

const validCategoryKeys = new Set(Object.keys(categoryLabels));
const validListKeys = new Set(Object.keys(listLabels));
const validFearCategories = new Set(["Mild", "Creepy", "Very Scary", "Terrifying"]);
const numericScoreKeys = [
  "scareScore",
  "realismScore",
  "disturbingScore",
  "disturbingLevel",
  "jumpScareLevel",
  "recommendationScore",
  "fearIndex",
];

const errors = [];
const warnings = [];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function formatMovieLabel(movie, index) {
  return `${movie?.title || "Untitled"} [index ${index}]`;
}

const titles = new Set();
const slugs = new Set();

movies.forEach((movie, index) => {
  const label = formatMovieLabel(movie, index);

  if (!isNonEmptyString(movie.title)) {
    addError(`${label}: missing title.`);
  }

  if (!Number.isInteger(movie.year) || movie.year < 1960 || movie.year > new Date().getFullYear() + 1) {
    addError(`${label}: invalid year \"${movie.year}\".`);
  }

  if (!isNonEmptyString(movie.slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(movie.slug)) {
    addError(`${label}: invalid slug \"${movie.slug}\".`);
  } else if (slugs.has(movie.slug)) {
    addError(`${label}: duplicate slug \"${movie.slug}\".`);
  } else {
    slugs.add(movie.slug);
  }

  const normalizedTitleKey = `${String(movie.title || "").trim().toLowerCase()}::${movie.year}`;
  if (titles.has(normalizedTitleKey)) {
    addError(`${label}: duplicate title/year combination.`);
  } else {
    titles.add(normalizedTitleKey);
  }

  if (!isNonEmptyString(movie.synopsis) || movie.synopsis.trim().length < 20) {
    addError(`${label}: synopsis is missing or too short.`);
  }

  if (!Array.isArray(movie.categories) || movie.categories.length === 0) {
    addError(`${label}: must include at least one category.`);
  } else {
    movie.categories.forEach((category) => {
      if (!validCategoryKeys.has(category)) {
        addError(`${label}: unknown category \"${category}\".`);
      }
    });
  }

  numericScoreKeys.forEach((key) => {
    const value = movie[key];
    if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 10) {
      addError(`${label}: ${key} must be a number between 0 and 10.`);
    }
  });

  if (!validFearCategories.has(movie.fearCategory)) {
    addError(`${label}: invalid fear category \"${movie.fearCategory}\".`);
  }

  if (typeof movie.beginnerFriendly !== "boolean") {
    addError(`${label}: beginnerFriendly must be a boolean.`);
  }

  if (typeof movie.hiddenGem !== "boolean") {
    addError(`${label}: hiddenGem must be a boolean.`);
  }

  if (!Array.isArray(movie.tags) || movie.tags.length === 0) {
    addWarning(`${label}: tags are missing.`);
  } else if (new Set(movie.tags).size !== movie.tags.length) {
    addWarning(`${label}: duplicate tags detected.`);
  }

  if (movie.lists) {
    if (!Array.isArray(movie.lists)) {
      addError(`${label}: lists must be an array when present.`);
    } else {
      movie.lists.forEach((listKey) => {
        if (!validListKeys.has(listKey)) {
          addError(`${label}: unknown list key \"${listKey}\".`);
        }
      });
    }
  }

  if (movie.posterUrl && !/^https:\/\//.test(movie.posterUrl)) {
    addWarning(`${label}: posterUrl should be an https URL.`);
  }

  if (movie.tmdbUrl && !/^https:\/\/www\.themoviedb\.org\//.test(movie.tmdbUrl)) {
    addWarning(`${label}: tmdbUrl does not look like a TMDB title URL.`);
  }

  if (movie.relatedMovies && !Array.isArray(movie.relatedMovies)) {
    addError(`${label}: relatedMovies must be an array when present.`);
  }
});

const allTitles = new Set(movies.map((movie) => movie.title));

movies.forEach((movie, index) => {
  const label = formatMovieLabel(movie, index);

  if (!Array.isArray(movie.relatedMovies)) {
    return;
  }

  movie.relatedMovies.forEach((relatedTitle) => {
    if (relatedTitle === movie.title) {
      addWarning(`${label}: relatedMovies includes the movie itself.`);
      return;
    }

    if (!allTitles.has(relatedTitle)) {
      addWarning(`${label}: related movie \"${relatedTitle}\" is not currently in the dataset.`);
    }
  });
});

if (warnings.length > 0) {
  console.log("Movie dataset warnings:\n");
  warnings.forEach((warning) => {
    console.log(`- ${warning}`);
  });
  console.log("");
}

if (errors.length > 0) {
  console.error("Movie dataset validation failed:\n");
  errors.forEach((error) => {
    console.error(`- ${error}`);
  });
  process.exit(1);
}

console.log(`Movie dataset validation passed for ${movies.length} titles.`);