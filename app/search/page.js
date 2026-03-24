"use client";

import Link from "next/link";
import { movies } from "../data/movies";
import categories from "../data/categories";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFearCategory, getFearIndex, getScariestScore, rankedListKeys } from "../data/listRankings";
import { listLabels } from "../data/labels";
import { franchiseShortcutConfigs } from "../data/franchises";
import { getSearchRelevanceScore, getSearchTitleMatchScore, getSuggestedSearchTerms, hasLegacyZeroMaxState, movieMatchesFilters } from "../data/searchFilters";
import { Suspense, useEffect, useMemo, useState } from "react";
import MovieListItem from "../components/MovieListItem";
import {
  appendQuizContextToSearchParams,
  buildQuizHref,
  formatQuizOptionLabel,
  formatQuizQuestionLabel,
  getQuizAnswersFromPrefixedSource,
  getQuizQuestionsForMode,
  getValidQuizMode,
} from "../data/quiz";

const vibeOptions = [
  { value: "creepy", label: "Creepy / Eerie", tags: ["creepy", "unsettling", "ghosts", "slow-burn"], quizTraits: ["creepy", "unsettling"] },
  { value: "grounded", label: "Grounded / Real", tags: ["grounded", "documentary", "human-threat", "screenlife"], quizTraits: ["grounded", "naturalistic"] },
  { value: "chaotic", label: "Chaotic / Intense", tags: ["chaotic", "intense", "urgent", "infection"], quizTraits: ["chaotic", "intense", "urgent"] },
  { value: "bleak", label: "Bleak / Disturbing", tags: ["bleak", "disturbing", "tragic", "grief"], quizTraits: ["bleak", "tragic", "disturbing"] },
  { value: "claustrophobic", label: "Claustrophobic", tags: ["claustrophobic", "asylum", "catacombs", "buried"], quizTraits: ["claustrophobic"] },
  { value: "occult", label: "Occult / Ritual", tags: ["occult", "cult", "demon", "curse", "witchcraft", "religious"], quizTraits: ["occult", "religious"] },
];

function movieMatchesVibe(movie, vibe) {
  if (!vibe) {
    return true;
  }

  const config = vibeOptions.find((option) => option.value === vibe);
  if (!config) {
    return true;
  }

  const tags = Array.isArray(movie?.tags) ? movie.tags : [];
  const quizVibes = Array.isArray(movie?.quizTraits?.vibe) ? movie.quizTraits.vibe : [];

  return config.tags.some((tag) => tags.includes(tag)) || config.quizTraits.some((tag) => quizVibes.includes(tag));
}

const categoryOptions = categories.map((category) => ({
  label: category,
  value: category.toLowerCase().replace(/ & /g, "-and-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
}));

categoryOptions.forEach((option) => {
  if (option.label === "Cult / Conspiracy") option.value = "cult-conspiracy";
  if (option.label === "Haunted Location") option.value = "haunted-location";
  if (option.label === "Serial Killer") option.value = "serial-killer";
  if (option.label === "Zombie / Infection") option.value = "zombie-infection";
});

const fearCategoryPriority = {
  "Extreme Terror": 0,
  "Terrifying": 1,
  "Very Scary": 2,
  "Creepy": 3,
  "Unsettling": 4,
  "Mild": 5,
};

const fearCategoryOptions = Array.from(new Set(movies.map((movie) => getFearCategory(movie))))
  .sort((left, right) => {
    const leftPriority = fearCategoryPriority[left] ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = fearCategoryPriority[right] ?? Number.MAX_SAFE_INTEGER;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.localeCompare(right);
  });

const listOptions = rankedListKeys.map((listKey) => ({
  value: listKey,
  label: listLabels[listKey] || listKey,
}));

const sortOptions = [
  {
    value: "relevance",
    label: "Best text match",
    description: "Prioritizes exact and stronger database matches first.",
  },
  {
    value: "scare-desc",
    label: "Most intense first",
    description: "Weighted for disturbing, jump scares, and realism.",
  },
  {
    value: "scare-asc",
    label: "Least intense first",
    description: "Good for easing into the genre.",
  },
  {
    value: "fear-desc",
    label: "Highest fear index",
    description: "Best for bleak, high-dread titles.",
  },
  {
    value: "fear-asc",
    label: "Lowest fear index",
    description: "Keeps the dread level lighter.",
  },
  {
    value: "title-asc",
    label: "Title A to Z",
    description: "Alphabetical order.",
  },
  {
    value: "title-desc",
    label: "Title Z to A",
    description: "Reverse alphabetical order.",
  },
];

const quickFilterPresets = [
  {
    id: "creepy",
    label: "Creepy Files",
    description: "Slow-burn and eerie footage.",
    apply: {
      vibe: "creepy",
      sort: "fear-desc",
    },
  },
  {
    id: "grounded",
    label: "Feels Real",
    description: "Grounded cases with realism pushed up.",
    apply: {
      vibe: "grounded",
      minRealism: 7,
      sort: "fear-desc",
    },
  },
  {
    id: "beginner",
    label: "Beginner Entry",
    description: "Lower-friction entry point into the vault.",
    apply: {
      beginnerFriendly: true,
      sort: "scare-asc",
    },
  },
  {
    id: "hidden-gems",
    label: "Hidden Gems",
    description: "Undersung picks worth pulling first.",
    apply: {
      hiddenGem: true,
      sort: "fear-desc",
    },
  },
  {
    id: "occult",
    label: "Occult Cases",
    description: "Ritual, cult, and curse-heavy titles.",
    apply: {
      vibe: "occult",
      category: "cult-conspiracy",
    },
  },
  {
    id: "max-intensity",
    label: "Max Intensity",
    description: "Start from the most punishing end.",
    apply: {
      minFear: 7,
      minDisturbing: 6,
      sort: "scare-desc",
    },
  },
];

const FRANCHISE_VIEW_PREFERENCE_KEY = "ffv-franchise-groups-expanded";

function normalizeSearchChipText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
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

  for (let leftIndex = 1; leftIndex <= a.length; leftIndex += 1) {
    let previous = rows[0];
    rows[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= b.length; rightIndex += 1) {
      const current = rows[rightIndex];
      const cost = a[leftIndex - 1] === b[rightIndex - 1] ? 0 : 1;
      rows[rightIndex] = Math.min(
        rows[rightIndex] + 1,
        rows[rightIndex - 1] + 1,
        previous + cost
      );
      previous = current;
    }
  }

  return rows[b.length];
}

function getTitleHintReason(searchText, suggestedTitle) {
  const normalizedSearch = normalizeSearchChipText(searchText);
  const normalizedSuggestion = normalizeSearchChipText(suggestedTitle);

  if (!normalizedSearch || !normalizedSuggestion) {
    return null;
  }

  if (normalizedSuggestion.startsWith(normalizedSearch) || normalizedSuggestion.includes(normalizedSearch)) {
    return "Looks like a partial title match.";
  }

  const searchTokens = normalizedSearch.split(" ").filter(Boolean);
  const suggestionTokens = normalizedSuggestion.split(" ").filter(Boolean);
  const sharedTokenCount = searchTokens.filter((token) => suggestionTokens.includes(token)).length;

  if (sharedTokenCount >= Math.min(searchTokens.length, suggestionTokens.length) && sharedTokenCount > 0) {
    return "Looks like the right title, but the wording is incomplete.";
  }

  if (getLevenshteinDistance(normalizedSearch, normalizedSuggestion) <= 2) {
    return "Looks like a likely title typo.";
  }

  return "Looks close to a known title.";
}

function getFranchiseHintReason(searchText, franchiseConfig) {
  const normalizedSearch = normalizeSearchChipText(searchText);
  const strictTerms = Array.isArray(franchiseConfig?.shortcutTerms) && franchiseConfig.shortcutTerms.length > 0
    ? franchiseConfig.shortcutTerms.map((term) => normalizeSearchChipText(term))
    : [normalizeSearchChipText(franchiseConfig?.searchText)];
  const broadTerms = Array.isArray(franchiseConfig?.matchTerms)
    ? franchiseConfig.matchTerms.map((term) => normalizeSearchChipText(term))
    : [];

  const broadExactMatch = broadTerms.find((term) => term && normalizedSearch === term);
  if (broadExactMatch) {
    return "This looks like a broad franchise-related term. Use the stronger series title to enter franchise mode.";
  }

  const broadPartialMatch = broadTerms.find((term) => term && (normalizedSearch.includes(term) || term.includes(normalizedSearch)));
  if (broadPartialMatch) {
    return "This looks like an incomplete franchise phrase. Tightening it to the main series title will unlock franchise mode.";
  }

  if (strictTerms.some((term) => term && term.startsWith(normalizedSearch))) {
    return "This looks close to a known franchise phrase, but it still needs the stronger series wording.";
  }

  return "This query is close to a known franchise, but it is still too broad for franchise mode.";
}

function searchMatchesField(searchText, fieldValue) {
  const normalizedSearch = normalizeSearchChipText(searchText);
  const normalizedField = normalizeSearchChipText(fieldValue);
  if (!normalizedSearch || !normalizedField) {
    return false;
  }

  if (normalizedField.includes(normalizedSearch)) {
    return true;
  }

  const tokens = normalizedSearch.split(" ").filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => normalizedField.includes(token));
}

function getTitleModeHintReason(searchText, broaderMatches) {
  if (!searchText || broaderMatches.length === 0) {
    return null;
  }

  const reasonCounts = {
    related: 0,
    taxonomy: 0,
    synopsis: 0,
    title: 0,
  };

  broaderMatches.slice(0, 12).forEach((movie) => {
    const relatedMovies = Array.isArray(movie?.relatedMovies) ? movie.relatedMovies : [];
    const tags = Array.isArray(movie?.tags) ? movie.tags : [];
    const categories = Array.isArray(movie?.categories) ? movie.categories : [];

    if (relatedMovies.some((value) => searchMatchesField(searchText, value))) {
      reasonCounts.related += 1;
      return;
    }

    if ([...tags, ...categories].some((value) => searchMatchesField(searchText, value))) {
      reasonCounts.taxonomy += 1;
      return;
    }

    if (searchMatchesField(searchText, movie?.title)) {
      reasonCounts.title += 1;
      return;
    }

    if (searchMatchesField(searchText, movie?.synopsis)) {
      reasonCounts.synopsis += 1;
    }
  });

  const dominantReason = Object.entries(reasonCounts)
    .sort((left, right) => right[1] - left[1])[0];

  if (!dominantReason || dominantReason[1] === 0) {
    return "The extra matches are coming from broader archive metadata around this search.";
  }

  switch (dominantReason[0]) {
    case "related":
      return "Most of the extra matches are getting pulled in through related-title links.";
    case "taxonomy":
      return "Most of the extra matches are coming from shared tags or category labels.";
    case "title":
      return "Some extra matches still overlap this wording directly in their titles.";
    case "synopsis":
    default:
      return "Most of the extra matches are being pulled in by broader synopsis text.";
  }
}

function getNormalizedMovieFranchiseFields(movie) {
  return [
    movie?.title,
    ...(Array.isArray(movie?.aka) ? movie.aka : []),
    ...(Array.isArray(movie?.aliases) ? movie.aliases : []),
    ...(Array.isArray(movie?.relatedMovies) ? movie.relatedMovies : []),
  ]
    .map(normalizeSearchChipText)
    .filter(Boolean);
}

function movieBelongsToFranchise(movie, franchiseConfig) {
  if (!movie || !franchiseConfig) {
    return false;
  }

  if (getSearchTitleMatchScore(movie, franchiseConfig.searchText) >= 720) {
    return true;
  }

  const normalizedFields = getNormalizedMovieFranchiseFields(movie);

  return franchiseConfig.matchTerms.some((term) => {
    const normalizedTerm = normalizeSearchChipText(term);

    return normalizedFields.some((field) => field.includes(normalizedTerm) || normalizedTerm.includes(field));
  });
}

function sortFranchiseMovies(moviesInGroup, franchiseConfig, searchText) {
  const canonicalOrder = Array.isArray(franchiseConfig?.canonicalOrder)
    ? franchiseConfig.canonicalOrder.map((title) => normalizeSearchChipText(title))
    : [];
  const canonicalOrderLookup = new Map(canonicalOrder.map((title, index) => [title, index]));

  return [...moviesInGroup].sort((left, right) => {
    const leftCanonicalIndex = canonicalOrderLookup.get(normalizeSearchChipText(left?.title));
    const rightCanonicalIndex = canonicalOrderLookup.get(normalizeSearchChipText(right?.title));

    if (leftCanonicalIndex !== undefined || rightCanonicalIndex !== undefined) {
      if (leftCanonicalIndex === undefined) {
        return 1;
      }
      if (rightCanonicalIndex === undefined) {
        return -1;
      }
      if (leftCanonicalIndex !== rightCanonicalIndex) {
        return leftCanonicalIndex - rightCanonicalIndex;
      }
    }

    const leftYear = Number.isFinite(Number(left?.year)) ? Number(left.year) : Number.MAX_SAFE_INTEGER;
    const rightYear = Number.isFinite(Number(right?.year)) ? Number(right.year) : Number.MAX_SAFE_INTEGER;

    if (leftYear !== rightYear) {
      return leftYear - rightYear;
    }

    const titleDifference = left.title.localeCompare(right.title);
    if (titleDifference !== 0) {
      return titleDifference;
    }

    return getSearchRelevanceScore(right, searchText) - getSearchRelevanceScore(left, searchText);
  });
}

function getFranchiseYearRangeLabel(moviesInGroup) {
  const years = moviesInGroup
    .map((movie) => Number(movie?.year))
    .filter((year) => Number.isFinite(year))
    .sort((left, right) => left - right);

  if (years.length === 0) {
    return null;
  }

  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  if (firstYear === lastYear) {
    return String(firstYear);
  }

  return `${firstYear}-${lastYear}`;
}

function getFranchiseStats(moviesInGroup) {
  if (moviesInGroup.length === 0) {
    return {
      averageScareScore: null,
      peakFearIndex: null,
    };
  }

  const totalScareScore = moviesInGroup.reduce((sum, movie) => sum + getScariestScore(movie), 0);
  const peakFearIndex = moviesInGroup.reduce((peak, movie) => Math.max(peak, getFearIndex(movie)), 0);

  return {
    averageScareScore: (totalScareScore / moviesInGroup.length).toFixed(1),
    peakFearIndex: peakFearIndex.toFixed(1),
  };
}

function clampScore(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(10, Math.max(0, parsed));
}

function getTagsFromParams(searchParams) {
  const repeatedTags = searchParams.getAll("tag");
  if (repeatedTags.length > 0) {
    return repeatedTags.filter(Boolean);
  }

  const tagList = searchParams.get("tags");
  return tagList ? tagList.split(",").filter(Boolean) : [];
}

function formatTagLabel(tag) {
  return tag
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRangeLabel(minimum, maximum, defaultMinimum, defaultMaximum) {
  if (minimum === defaultMinimum && maximum === defaultMaximum) {
    return null;
  }
  if (minimum === maximum) {
    return `${minimum}`;
  }

  return `${minimum}-${maximum}`;
}

function normalizeRange(minimum, maximum, fallbackMinimum, fallbackMaximum) {
  const safeMinimum = clampScore(minimum, fallbackMinimum);
  const safeMaximum = clampScore(maximum, fallbackMaximum);

  if (safeMinimum <= safeMaximum) {
    return [safeMinimum, safeMaximum];
  }

  return [safeMaximum, safeMaximum];
}

function getSearchStateFromParams(searchParams) {
  const useDefaultMaximums = hasLegacyZeroMaxState(searchParams);

  return {
    search: searchParams.get("q") || "",
    sortMode: searchParams.get("sort") || "scare-desc",
    selectedListKey: searchParams.get("list") || "",
    minScore: clampScore(searchParams.get("minScore"), 0),
    maxScore: useDefaultMaximums ? 10 : clampScore(searchParams.get("maxScore"), 10),
    minRealismScore: clampScore(searchParams.get("minRealism"), 0),
    maxRealismScore: useDefaultMaximums ? 10 : clampScore(searchParams.get("maxRealism"), 10),
    minDisturbingScore: clampScore(searchParams.get("minDisturbing"), 0),
    minFearIndex: clampScore(searchParams.get("minFear"), 0),
    maxFearIndex: useDefaultMaximums ? 10 : clampScore(searchParams.get("maxFear"), 10),
    selectedCategory: searchParams.get("category") || "",
    selectedVibe: searchParams.get("vibe") || "",
    selectedFearCategory: searchParams.get("fearCategory") || "",
    titleMatchesOnly: searchParams.get("titleMatches") === "true",
    beginnerFriendlyOnly: searchParams.get("beginnerFriendly") === "true",
    hiddenGemOnly: searchParams.get("hiddenGem") === "true",
    selectedTags: getTagsFromParams(searchParams),
    recoveredLegacyMaxState: useDefaultMaximums,
  };
}

function buildSearchQueryFromState({
  search,
  sortMode,
  selectedListKey,
  minScore,
  maxScore,
  minRealismScore,
  maxRealismScore,
  minDisturbingScore,
  minFearIndex,
  maxFearIndex,
  selectedCategory,
  selectedVibe,
  selectedFearCategory,
  titleMatchesOnly,
  beginnerFriendlyOnly,
  hiddenGemOnly,
  selectedTags,
  quizMode,
  quizAnswers,
  quizQuestions,
  includeQuizContext = true,
}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("q", search);
  }
  if (sortMode !== "scare-desc") {
    params.set("sort", sortMode);
  }
  if (selectedListKey) {
    params.set("list", selectedListKey);
  }
  if (minScore !== 0) {
    params.set("minScore", String(minScore));
  }
  if (maxScore !== 10) {
    params.set("maxScore", String(maxScore));
  }
  if (minRealismScore !== 0) {
    params.set("minRealism", String(minRealismScore));
  }
  if (maxRealismScore !== 10) {
    params.set("maxRealism", String(maxRealismScore));
  }
  if (minDisturbingScore !== 0) {
    params.set("minDisturbing", String(minDisturbingScore));
  }
  if (minFearIndex !== 0) {
    params.set("minFear", String(minFearIndex));
  }
  if (maxFearIndex !== 10) {
    params.set("maxFear", String(maxFearIndex));
  }
  if (selectedCategory) {
    params.set("category", selectedCategory);
  }
  if (selectedVibe) {
    params.set("vibe", selectedVibe);
  }
  if (selectedFearCategory) {
    params.set("fearCategory", selectedFearCategory);
  }
  if (titleMatchesOnly) {
    params.set("titleMatches", "true");
  }
  if (beginnerFriendlyOnly) {
    params.set("beginnerFriendly", "true");
  }
  if (hiddenGemOnly) {
    params.set("hiddenGem", "true");
  }
  for (const tag of selectedTags) {
    params.append("tag", tag);
  }

  if (includeQuizContext) {
    appendQuizContextToSearchParams(params, quizMode, quizAnswers, quizQuestions);
  }

  return params.toString();
}

function RangeSection({
  title,
  minValue,
  maxValue,
  minFallback,
  maxFallback,
  onMinChange,
  onMaxChange,
  onReset,
  errorMessage,
}) {
  return (
    <div className="ff-panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-green-50/88">{title}</div>
        <button
          type="button"
          onClick={onReset}
          className="ff-border rounded-full px-3 py-1 text-xs text-green-50/75 hover:bg-green-400/8"
        >
          Reset
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-green-50/72">
          <span className="mb-1 block">Minimum</span>
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={minValue}
            onChange={onMinChange}
            className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
          />
          <button
            type="button"
            onClick={() => onMinChange({ target: { value: String(minFallback) } })}
            className="mt-2 text-xs text-green-100/45 hover:text-green-200"
          >
            Set to any ({minFallback})
          </button>
        </label>
        <label className="text-sm text-green-50/72">
          <span className="mb-1 block">Maximum</span>
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={maxValue}
            onChange={onMaxChange}
            className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
          />
          <button
            type="button"
            onClick={() => onMaxChange({ target: { value: String(maxFallback) } })}
            className="mt-2 text-xs text-green-100/45 hover:text-green-200"
          >
            Set to any ({maxFallback})
          </button>
        </label>
      </div>
      {errorMessage ? <div className="mt-2 text-sm text-green-200/90">{errorMessage}</div> : null}
    </div>
  );
}

function MinimumSection({ title, value, fallback, onChange, onReset }) {
  return (
    <div className="ff-panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-green-50/88">{title}</div>
        <button
          type="button"
          onClick={onReset}
          className="ff-border rounded-full px-3 py-1 text-xs text-green-50/75 hover:bg-green-400/8"
        >
          Reset
        </button>
      </div>
      <label className="text-sm text-green-50/72">
        <span className="mb-1 block">Minimum</span>
        <input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
        />
        <button
          type="button"
          onClick={() => onChange({ target: { value: String(fallback) } })}
          className="mt-2 text-xs text-green-100/45 hover:text-green-200"
        >
          Set to any ({fallback})
        </button>
      </label>
    </div>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchStateFromUrl = useMemo(() => getSearchStateFromParams(searchParams), [searchParams]);

  const [search, setSearch] = useState(() => searchStateFromUrl.search);
  const [sortMode, setSortMode] = useState(() => searchStateFromUrl.sortMode);
  const [selectedListKey, setSelectedListKey] = useState(() => searchStateFromUrl.selectedListKey);
  const [minScore, setMinScore] = useState(() => searchStateFromUrl.minScore);
  const [maxScore, setMaxScore] = useState(() => searchStateFromUrl.maxScore);
  const [minRealismScore, setMinRealismScore] = useState(() => searchStateFromUrl.minRealismScore);
  const [maxRealismScore, setMaxRealismScore] = useState(() => searchStateFromUrl.maxRealismScore);
  const [minDisturbingScore, setMinDisturbingScore] = useState(() => searchStateFromUrl.minDisturbingScore);
  const [minFearIndex, setMinFearIndex] = useState(() => searchStateFromUrl.minFearIndex);
  const [maxFearIndex, setMaxFearIndex] = useState(() => searchStateFromUrl.maxFearIndex);
  const [selectedCategory, setSelectedCategory] = useState(() => searchStateFromUrl.selectedCategory);
  const [selectedVibe, setSelectedVibe] = useState(() => searchStateFromUrl.selectedVibe);
  const [selectedFearCategory, setSelectedFearCategory] = useState(() => searchStateFromUrl.selectedFearCategory);
  const [titleMatchesOnly, setTitleMatchesOnly] = useState(() => searchStateFromUrl.titleMatchesOnly);
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(() => searchStateFromUrl.beginnerFriendlyOnly);
  const [hiddenGemOnly, setHiddenGemOnly] = useState(() => searchStateFromUrl.hiddenGemOnly);
  const [selectedTags, setSelectedTags] = useState(() => searchStateFromUrl.selectedTags);
  const [tagSearch, setTagSearch] = useState("");
  const [copyStatus, setCopyStatus] = useState("idle");
  const [showLegacyRecoveryBanner, setShowLegacyRecoveryBanner] = useState(() => searchStateFromUrl.recoveredLegacyMaxState);
  const [expandedFranchiseGroups, setExpandedFranchiseGroups] = useState({});
  const [preferredFranchiseGroupsExpanded, setPreferredFranchiseGroupsExpanded] = useState(true);

  const quizMode = getValidQuizMode(searchParams.get("quizMode"));
  const quizQuestions = useMemo(() => {
    return quizMode ? getQuizQuestionsForMode(quizMode) : [];
  }, [quizMode]);
  const quizAnswers = useMemo(() => {
    return quizMode ? getQuizAnswersFromPrefixedSource(searchParams, quizQuestions, "quiz_") : {};
  }, [quizMode, quizQuestions, searchParams]);
  const quizAnswerSummary = useMemo(() => {
    return quizQuestions
      .map((question) => {
        const value = quizAnswers[question.id];
        if (!value) {
          return null;
        }

        return {
          id: question.id,
          label: formatQuizQuestionLabel(question.id),
          valueLabel: formatQuizOptionLabel(question.id, value),
        };
      })
      .filter(Boolean);
  }, [quizAnswers, quizQuestions]);
  const quizHref = useMemo(() => (quizMode ? buildQuizHref(quizMode, quizAnswers) : null), [quizAnswers, quizMode]);

  const allTags = Array.from(new Set(movies.flatMap((movie) => movie.tags || []))).sort();
  const allMovieTitles = useMemo(() => new Set(movies.map((movie) => String(movie?.title || "").trim()).filter(Boolean)), []);
  const matchingTags = useMemo(() => {
    const normalizedQuery = tagSearch.trim().toLowerCase();

    return allTags
      .filter((tag) => !selectedTags.includes(tag))
      .filter((tag) => {
        if (!normalizedQuery) {
          return true;
        }

        return formatTagLabel(tag).toLowerCase().includes(normalizedQuery) || tag.includes(normalizedQuery);
      })
      .slice(0, 24);
  }, [allTags, selectedTags, tagSearch]);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) {
      return [];
    }

    return getSuggestedSearchTerms(movies, search, 5);
  }, [search]);

  const franchiseShortcuts = useMemo(() => {
    const normalizedSearch = normalizeSearchChipText(search);
    if (!normalizedSearch) {
      return [];
    }

    return franchiseShortcutConfigs.filter((shortcut) => {
      const shortcutTerms = Array.isArray(shortcut.shortcutTerms) && shortcut.shortcutTerms.length > 0
        ? shortcut.shortcutTerms
        : [shortcut.searchText, ...(shortcut.matchTerms || [])];

      return shortcutTerms.some((term) => {
        const normalizedTerm = normalizeSearchChipText(term);
        return normalizedSearch.includes(normalizedTerm) || normalizedTerm.includes(normalizedSearch);
      });
    });
  }, [search]);

  const franchiseQueryHint = useMemo(() => {
    const normalizedSearch = normalizeSearchChipText(search);
    if (!normalizedSearch || franchiseShortcuts.length > 0) {
      return null;
    }

    const hintedFranchise = franchiseShortcutConfigs.find((shortcut) => {
      const strictTerms = Array.isArray(shortcut.shortcutTerms) && shortcut.shortcutTerms.length > 0
        ? shortcut.shortcutTerms
        : [shortcut.searchText];
      const broadTerms = Array.isArray(shortcut.matchTerms) ? shortcut.matchTerms : [];

      const matchesBroadTerm = broadTerms.some((term) => {
        const normalizedTerm = normalizeSearchChipText(term);
        return normalizedSearch === normalizedTerm || normalizedSearch.includes(normalizedTerm) || normalizedTerm.includes(normalizedSearch);
      });

      if (!matchesBroadTerm) {
        return false;
      }

      return !strictTerms.some((term) => {
        const normalizedTerm = normalizeSearchChipText(term);
        return normalizedSearch === normalizedTerm || normalizedSearch.includes(normalizedTerm) || normalizedTerm.includes(normalizedSearch);
      });
    });

    if (!hintedFranchise) {
      return null;
    }

    return {
      label: hintedFranchise.label,
      suggestedQuery: hintedFranchise.searchText,
      reason: getFranchiseHintReason(search, hintedFranchise),
    };
  }, [franchiseShortcuts, search]);

  const titleQueryHint = useMemo(() => {
    const normalizedSearch = normalizeSearchChipText(search);
    if (!normalizedSearch || normalizedSearch.length < 4 || franchiseQueryHint || franchiseShortcuts.length > 0) {
      return null;
    }

    const [suggestedTitle] = searchSuggestions;
    if (!suggestedTitle || !allMovieTitles.has(suggestedTitle)) {
      return null;
    }

    if (normalizeSearchChipText(suggestedTitle) === normalizedSearch) {
      return null;
    }

    return {
      suggestedQuery: suggestedTitle,
      reason: getTitleHintReason(search, suggestedTitle),
    };
  }, [allMovieTitles, franchiseQueryHint, franchiseShortcuts, search, searchSuggestions]);

  const suggestedNextFranchises = useMemo(() => {
    if (franchiseShortcuts.length !== 1) {
      return [];
    }

    const [activeFranchise] = franchiseShortcuts;

    return (activeFranchise.relatedFranchiseIds || [])
      .map((franchiseId) => franchiseShortcutConfigs.find((shortcut) => shortcut.id === franchiseId))
      .filter(Boolean);
  }, [franchiseShortcuts]);

  useEffect(() => {
    setSearch(searchStateFromUrl.search);
    setSortMode(searchStateFromUrl.sortMode);
    setSelectedListKey(searchStateFromUrl.selectedListKey);
    setMinScore(searchStateFromUrl.minScore);
    setMaxScore(searchStateFromUrl.maxScore);
    setMinRealismScore(searchStateFromUrl.minRealismScore);
    setMaxRealismScore(searchStateFromUrl.maxRealismScore);
    setMinDisturbingScore(searchStateFromUrl.minDisturbingScore);
    setMinFearIndex(searchStateFromUrl.minFearIndex);
    setMaxFearIndex(searchStateFromUrl.maxFearIndex);
    setSelectedCategory(searchStateFromUrl.selectedCategory);
    setSelectedVibe(searchStateFromUrl.selectedVibe);
    setSelectedFearCategory(searchStateFromUrl.selectedFearCategory);
    setTitleMatchesOnly(searchStateFromUrl.titleMatchesOnly);
    setBeginnerFriendlyOnly(searchStateFromUrl.beginnerFriendlyOnly);
    setHiddenGemOnly(searchStateFromUrl.hiddenGemOnly);
    setSelectedTags(searchStateFromUrl.selectedTags);
  }, [searchStateFromUrl]);

  useEffect(() => {
    if (searchStateFromUrl.recoveredLegacyMaxState) {
      setShowLegacyRecoveryBanner(true);
    }
  }, [searchStateFromUrl.recoveredLegacyMaxState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = window.localStorage.getItem(FRANCHISE_VIEW_PREFERENCE_KEY);
    if (storedValue !== "collapsed" && storedValue !== "expanded") {
      return;
    }

    const expanded = storedValue === "expanded";
    setPreferredFranchiseGroupsExpanded(expanded);
    setExpandedFranchiseGroups((currentState) => {
      if (Object.keys(currentState).length === 0) {
        return currentState;
      }

      const nextState = {};
      Object.keys(currentState).forEach((groupId) => {
        nextState[groupId] = expanded;
      });

      return nextState;
    });
  }, []);

  function resetSearchState() {
    setSearch("");
    setSortMode("scare-desc");
    setSelectedListKey("");
    setMinScore(0);
    setMaxScore(10);
    setMinRealismScore(0);
    setMaxRealismScore(10);
    setMinDisturbingScore(0);
    setMinFearIndex(0);
    setMaxFearIndex(10);
    setSelectedCategory("");
    setSelectedVibe("");
    setSelectedFearCategory("");
    setTitleMatchesOnly(false);
    setBeginnerFriendlyOnly(false);
    setHiddenGemOnly(false);
    setSelectedTags([]);
    setTagSearch("");
  }

  function clearBrokenFilters() {
    resetSearchState();
    setShowLegacyRecoveryBanner(false);
    router.replace(pathname, { scroll: false });
  }

  function persistFranchiseExpansionPreference(expanded) {
    setPreferredFranchiseGroupsExpanded(expanded);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(FRANCHISE_VIEW_PREFERENCE_KEY, expanded ? "expanded" : "collapsed");
    }
  }

  function resetFranchiseExpansionPreference() {
    setPreferredFranchiseGroupsExpanded(true);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(FRANCHISE_VIEW_PREFERENCE_KEY);
    }

    setExpandedFranchiseGroups(() => {
      const nextState = {};

      franchiseGroups.forEach((group) => {
        nextState[group.id] = true;
      });

      return nextState;
    });
  }

  function applyFranchiseShortcut(shortcut) {
    setSearch(shortcut.searchText);
    setSortMode("relevance");
    setSelectedListKey("");
    setSelectedCategory("");
    setSelectedVibe("");
    setSelectedFearCategory("");
    setTitleMatchesOnly(true);
    setSelectedTags([]);
  }

  function addTag(tag) {
    setSelectedTags((currentTags) => (currentTags.includes(tag) ? currentTags : [...currentTags, tag]));
    setTagSearch("");
  }

  function removeTag(tagToRemove) {
    setSelectedTags((currentTags) => currentTags.filter((tag) => tag !== tagToRemove));
  }

  function updateRangeValue(setter, fallback) {
    return (event) => {
      const nextValue = event.target.value;
      if (nextValue === "") {
        setter(fallback);
        return;
      }

      setter(clampScore(nextValue, fallback));
    };
  }

  function applyQuickFilter(preset) {
    setSelectedCategory(preset.apply.category || "");
    setSelectedVibe(preset.apply.vibe || "");
    setSelectedFearCategory(preset.apply.fearCategory || "");
    setSelectedListKey(preset.apply.list || "");
    setSortMode(preset.apply.sort || "scare-desc");
    setBeginnerFriendlyOnly(Boolean(preset.apply.beginnerFriendly));
    setHiddenGemOnly(Boolean(preset.apply.hiddenGem));
    setMinScore(preset.apply.minScore ?? 0);
    setMaxScore(preset.apply.maxScore ?? 10);
    setMinRealismScore(preset.apply.minRealism ?? 0);
    setMaxRealismScore(preset.apply.maxRealism ?? 10);
    setMinDisturbingScore(preset.apply.minDisturbing ?? 0);
    setMinFearIndex(preset.apply.minFear ?? 0);
    setMaxFearIndex(preset.apply.maxFear ?? 10);
    setSelectedTags(preset.apply.tags || []);
  }

  function presetIsActive(preset) {
    const { apply } = preset;

    return (apply.category || "") === selectedCategory
      && (apply.vibe || "") === selectedVibe
      && (apply.fearCategory || "") === selectedFearCategory
      && (apply.list || "") === selectedListKey
      && (apply.sort || "scare-desc") === sortMode
      && Boolean(apply.beginnerFriendly) === beginnerFriendlyOnly
      && Boolean(apply.hiddenGem) === hiddenGemOnly
      && (apply.minScore ?? 0) === minScore
      && (apply.maxScore ?? 10) === maxScore
      && (apply.minRealism ?? 0) === minRealismScore
      && (apply.maxRealism ?? 10) === maxRealismScore
      && (apply.minDisturbing ?? 0) === minDisturbingScore
      && (apply.minFear ?? 0) === minFearIndex
      && (apply.maxFear ?? 10) === maxFearIndex
      && JSON.stringify(apply.tags || []) === JSON.stringify(selectedTags);
  }

  useEffect(() => {
    const [normalizedMinScore, normalizedMaxScore] = normalizeRange(minScore, maxScore, 0, 10);
    if (normalizedMinScore !== minScore) {
      setMinScore(normalizedMinScore);
    }
    if (normalizedMaxScore !== maxScore) {
      setMaxScore(normalizedMaxScore);
    }
  }, [maxScore, minScore]);

  useEffect(() => {
    const [normalizedMinRealism, normalizedMaxRealism] = normalizeRange(minRealismScore, maxRealismScore, 0, 10);
    if (normalizedMinRealism !== minRealismScore) {
      setMinRealismScore(normalizedMinRealism);
    }
    if (normalizedMaxRealism !== maxRealismScore) {
      setMaxRealismScore(normalizedMaxRealism);
    }
  }, [maxRealismScore, minRealismScore]);

  useEffect(() => {
    const [normalizedMinFear, normalizedMaxFear] = normalizeRange(minFearIndex, maxFearIndex, 0, 10);
    if (normalizedMinFear !== minFearIndex) {
      setMinFearIndex(normalizedMinFear);
    }
    if (normalizedMaxFear !== maxFearIndex) {
      setMaxFearIndex(normalizedMaxFear);
    }
  }, [maxFearIndex, minFearIndex]);

  async function copyShareLink() {
    try {
      const shareUrl = typeof window === "undefined"
        ? `${pathname}${urlQuery ? `?${urlQuery}` : ""}`
        : `${window.location.origin}${pathname}${urlQuery ? `?${urlQuery}` : ""}`;

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      window.setTimeout(() => setCopyStatus("idle"), 2500);
    }
  }

  function dismissQuizContext() {
    const nextQuery = buildSearchQueryFromState({
      search,
      sortMode,
      selectedListKey,
      minScore,
      maxScore,
      minRealismScore,
      maxRealismScore,
      minDisturbingScore,
      minFearIndex,
      maxFearIndex,
      selectedCategory,
      selectedVibe,
      selectedFearCategory,
      titleMatchesOnly,
      beginnerFriendlyOnly,
      hiddenGemOnly,
      selectedTags,
      quizMode,
      quizAnswers,
      quizQuestions,
      includeQuizContext: false,
    });
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  const hasActiveFilters =
    search !== "" ||
    sortMode !== "scare-desc" ||
    selectedListKey !== "" ||
    minScore !== 0 ||
    maxScore !== 10 ||
    minRealismScore !== 0 ||
    maxRealismScore !== 10 ||
    minDisturbingScore !== 0 ||
    minFearIndex !== 0 ||
    maxFearIndex !== 10 ||
    selectedCategory !== "" ||
    selectedVibe !== "" ||
    selectedFearCategory !== "" ||
    titleMatchesOnly ||
    beginnerFriendlyOnly ||
    hiddenGemOnly ||
    selectedTags.length > 0;

  const urlQuery = useMemo(() => {
    return buildSearchQueryFromState({
      search,
      sortMode,
      selectedListKey,
      minScore,
      maxScore,
      minRealismScore,
      maxRealismScore,
      minDisturbingScore,
      minFearIndex,
      maxFearIndex,
      selectedCategory,
      selectedVibe,
      selectedFearCategory,
      titleMatchesOnly,
      beginnerFriendlyOnly,
      hiddenGemOnly,
      selectedTags,
      quizMode,
      quizAnswers,
      quizQuestions,
    });
  }, [beginnerFriendlyOnly, hiddenGemOnly, maxFearIndex, maxRealismScore, maxScore, minDisturbingScore, minFearIndex, minRealismScore, minScore, quizAnswers, quizMode, quizQuestions, search, selectedCategory, selectedFearCategory, selectedListKey, selectedTags, selectedVibe, sortMode, titleMatchesOnly]);

  useEffect(() => {
    const currentQuery = searchParams.toString();
    if (currentQuery === urlQuery) {
      return;
    }

    const nextUrl = urlQuery ? `${pathname}?${urlQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams, urlQuery]);

  const filteredMovies = movies
    .filter((movie) =>
      movieMatchesFilters(movie, {
        searchText: search,
        listKey: selectedListKey,
        minScore,
        maxScore,
        minRealismScore,
        maxRealismScore,
        minDisturbingScore,
        minFearIndex,
        maxFearIndex,
        category: selectedCategory,
        fearCategory: selectedFearCategory,
        tags: selectedTags,
        beginnerFriendly: beginnerFriendlyOnly,
        hiddenGem: hiddenGemOnly,
      }) && movieMatchesVibe(movie, selectedVibe) && (!titleMatchesOnly || !search.trim() || getSearchTitleMatchScore(movie, search) > 0)
    )
    .sort((left, right) => {
      if (search.trim()) {
        const relevanceDifference = getSearchRelevanceScore(right, search) - getSearchRelevanceScore(left, search);
        if (relevanceDifference !== 0) {
          return relevanceDifference;
        }
      }

      switch (sortMode) {
        case "relevance":
          return getScariestScore(right) - getScariestScore(left);
        case "scare-asc":
          return getScariestScore(left) - getScariestScore(right);
        case "fear-desc":
          return getFearIndex(right) - getFearIndex(left);
        case "fear-asc":
          return getFearIndex(left) - getFearIndex(right);
        case "title-asc":
          return left.title.localeCompare(right.title);
        case "title-desc":
          return right.title.localeCompare(left.title);
        case "scare-desc":
        default:
          return getScariestScore(right) - getScariestScore(left);
      }
    });

  const franchiseGroups = useMemo(() => {
    if (!search.trim() || franchiseShortcuts.length === 0) {
      return [];
    }

    return franchiseShortcuts
      .map((shortcut) => {
        const groupedMovies = sortFranchiseMovies(
          filteredMovies.filter((movie) => movieBelongsToFranchise(movie, shortcut)),
          shortcut,
          search
        );

        return {
          ...shortcut,
          movies: groupedMovies,
          yearRangeLabel: getFranchiseYearRangeLabel(groupedMovies),
          stats: getFranchiseStats(groupedMovies),
          usesCanonicalOrder: Array.isArray(shortcut.canonicalOrder) && shortcut.canonicalOrder.length > 0,
        };
      })
      .filter((group) => group.movies.length >= 2);
  }, [filteredMovies, franchiseShortcuts, search]);

  const franchiseGroupedMovieSlugs = useMemo(
    () => new Set(franchiseGroups.flatMap((group) => group.movies.map((movie) => movie.slug))),
    [franchiseGroups]
  );

  useEffect(() => {
    setExpandedFranchiseGroups((currentState) => {
      const nextState = {};

      franchiseGroups.forEach((group) => {
        nextState[group.id] = currentState[group.id] ?? preferredFranchiseGroupsExpanded;
      });

      const currentKeys = Object.keys(currentState);
      const nextKeys = Object.keys(nextState);
      const stateChanged = nextKeys.length !== currentKeys.length || nextKeys.some((key) => currentState[key] !== nextState[key]);

      return stateChanged ? nextState : currentState;
    });
  }, [franchiseGroups, preferredFranchiseGroupsExpanded]);

  function setAllFranchiseGroupsExpanded(expanded) {
    persistFranchiseExpansionPreference(expanded);
    setExpandedFranchiseGroups(() => {
      const nextState = {};

      franchiseGroups.forEach((group) => {
        nextState[group.id] = expanded;
      });

      return nextState;
    });
  }

  const featuredTitleMatches = useMemo(() => {
    if (!search.trim()) {
      return [];
    }

    return filteredMovies
      .filter((movie) => !franchiseGroupedMovieSlugs.has(movie.slug))
      .filter((movie) => getSearchTitleMatchScore(movie, search) >= 720)
      .slice(0, 8);
  }, [filteredMovies, franchiseGroupedMovieSlugs, search]);

  const featuredTitleMatchSlugs = useMemo(() => new Set(featuredTitleMatches.map((movie) => movie.slug)), [featuredTitleMatches]);

  const broaderArchiveMatches = useMemo(() => {
    if (featuredTitleMatchSlugs.size === 0 && franchiseGroupedMovieSlugs.size === 0) {
      return filteredMovies;
    }

    return filteredMovies.filter((movie) => !featuredTitleMatchSlugs.has(movie.slug) && !franchiseGroupedMovieSlugs.has(movie.slug));
  }, [featuredTitleMatchSlugs, filteredMovies, franchiseGroupedMovieSlugs]);

  const titleModeHint = useMemo(() => {
    if (!search.trim() || titleMatchesOnly || franchiseQueryHint || franchiseShortcuts.length > 0) {
      return null;
    }

    if (featuredTitleMatches.length === 0) {
      return null;
    }

    const strongestTitleMatch = featuredTitleMatches[0];
    const strongestScore = getSearchTitleMatchScore(strongestTitleMatch, search);
    if (strongestScore < 820) {
      return null;
    }

    if (broaderArchiveMatches.length < 3) {
      return null;
    }

    return {
      title: strongestTitleMatch.title,
      extraMatchCount: broaderArchiveMatches.length,
      reason: getTitleModeHintReason(search, broaderArchiveMatches),
    };
  }, [broaderArchiveMatches, featuredTitleMatches, franchiseQueryHint, franchiseShortcuts.length, search, titleMatchesOnly]);

  const searchLaneSummary = useMemo(() => {
    if (!search.trim()) {
      return {
        label: "Broad Archive Mode",
        description: "General archive retrieval is active. Type a title or series phrase to narrow the lane.",
      };
    }

    if (titleMatchesOnly) {
      return {
        label: "Title-Focused Mode",
        description: "Results are restricted to title and title-alias matches for a tighter pull.",
      };
    }

    if (franchiseShortcuts.length > 0 || franchiseGroups.length > 0) {
      return {
        label: "Franchise Mode",
        description: "The query is strong enough to trigger series-aware shortcuts and grouped franchise results.",
      };
    }

    if (franchiseQueryHint) {
      return {
        label: "Near Franchise Mode",
        description: "The query overlaps a known series, but it still needs stronger franchise wording.",
      };
    }

    if (titleModeHint || titleQueryHint || featuredTitleMatches.length > 0) {
      return {
        label: "Title-Led Archive Mode",
        description: "The search has a strong title signal, but broader archive matches are still allowed.",
      };
    }

    return {
      label: "Broad Archive Mode",
      description: "The query is currently scanning the wider archive instead of a dedicated title or franchise lane.",
    };
  }, [featuredTitleMatches.length, franchiseGroups.length, franchiseQueryHint, franchiseShortcuts.length, search, titleMatchesOnly, titleModeHint, titleQueryHint]);

  const searchLaneAction = useMemo(() => {
    if (!search.trim()) {
      return null;
    }

    if (titleMatchesOnly) {
      return {
        label: "Return To Broader Archive",
        description: "Turn title-only mode off and bring related archive matches back into the stack.",
        action: "disable-title-matches-only",
      };
    }

    if (franchiseShortcuts.length > 0) {
      const strongestShortcut = franchiseShortcuts[0];

      return {
        label: `Jump To ${strongestShortcut.label}`,
        description: "Use the strongest detected series shortcut and tighten the archive lane immediately.",
        action: "apply-franchise-shortcut",
        shortcut: strongestShortcut,
      };
    }

    if (franchiseQueryHint) {
      return {
        label: `Search ${franchiseQueryHint.suggestedQuery}`,
        description: "Tighten the wording so the query can enter franchise mode cleanly.",
        action: "apply-query",
        query: franchiseQueryHint.suggestedQuery,
      };
    }

    if (titleModeHint) {
      return {
        label: "Turn On Title Matches Only",
        description: `Keep ${titleModeHint.title} in focus and drop broader archive spillover.`,
        action: "enable-title-matches-only",
      };
    }

    if (titleQueryHint) {
      return {
        label: `Search ${titleQueryHint.suggestedQuery}`,
        description: "Tighten the title wording for a cleaner archive pull.",
        action: "apply-query",
        query: titleQueryHint.suggestedQuery,
      };
    }

    if (featuredTitleMatches.length > 0) {
      return {
        label: "Turn On Title Matches Only",
        description: "The archive is reading this like a title search. Narrow the lane in one click.",
        action: "enable-title-matches-only",
      };
    }

    return {
      label: "Clear Search Terms",
      description: "Drop the current phrase and reopen the full archive lane.",
      action: "clear-search",
    };
  }, [featuredTitleMatches.length, franchiseQueryHint, franchiseShortcuts, search, titleMatchesOnly, titleModeHint, titleQueryHint]);

  const handleSearchLaneAction = () => {
    if (!searchLaneAction) {
      return;
    }

    if (searchLaneAction.action === "apply-franchise-shortcut" && searchLaneAction.shortcut) {
      applyFranchiseShortcut(searchLaneAction.shortcut);
      return;
    }

    if (searchLaneAction.action === "apply-query" && searchLaneAction.query) {
      setSearch(searchLaneAction.query);
      return;
    }

    if (searchLaneAction.action === "enable-title-matches-only") {
      setTitleMatchesOnly(true);
      return;
    }

    if (searchLaneAction.action === "disable-title-matches-only") {
      setTitleMatchesOnly(false);
      return;
    }

    if (searchLaneAction.action === "clear-search") {
      setSearch("");
    }
  };

  const resultsSummary = useMemo(() => {
    const fragments = [];

    if (selectedCategory) {
      fragments.push(categoryOptions.find((category) => category.value === selectedCategory)?.label || selectedCategory);
    }
    if (selectedVibe) {
      fragments.push(vibeOptions.find((option) => option.value === selectedVibe)?.label || selectedVibe);
    }
    if (selectedListKey) {
      fragments.push(listLabels[selectedListKey] || selectedListKey);
    }
    if (selectedFearCategory) {
      fragments.push(selectedFearCategory);
    }
    if (titleMatchesOnly) {
      fragments.push("Title Matches Only");
    }
    if (beginnerFriendlyOnly) {
      fragments.push("Beginner Friendly");
    }
    if (hiddenGemOnly) {
      fragments.push("Hidden Gem");
    }

    const scareRangeLabel = formatRangeLabel(minScore, maxScore, 0, 10);
    if (scareRangeLabel) {
      fragments.push(`Scare Score ${scareRangeLabel}`);
    }

    const realismRangeLabel = formatRangeLabel(minRealismScore, maxRealismScore, 0, 10);
    if (realismRangeLabel) {
      fragments.push(`Realism ${realismRangeLabel}`);
    }

    if (minDisturbingScore !== 0) {
      fragments.push(`Disturbing ${minDisturbingScore}+`);
    }

    const fearRangeLabel = formatRangeLabel(minFearIndex, maxFearIndex, 0, 10);
    if (fearRangeLabel) {
      fragments.push(`Fear Index ${fearRangeLabel}`);
    }

    if (selectedTags.length > 0) {
      fragments.push(selectedTags.map(formatTagLabel).join(", "));
    }

    if (search) {
      fragments.push(`\"${search}\"`);
    }

    if (fragments.length === 0) {
      return `${filteredMovies.length} ${filteredMovies.length === 1 ? "movie" : "movies"} across the full vault.`;
    }

    return `${filteredMovies.length} ${filteredMovies.length === 1 ? "movie" : "movies"} matching ${fragments.join(" + ")}.`;
  }, [beginnerFriendlyOnly, filteredMovies.length, hiddenGemOnly, maxFearIndex, maxRealismScore, maxScore, minDisturbingScore, minFearIndex, minRealismScore, minScore, search, selectedCategory, selectedFearCategory, selectedListKey, selectedTags, selectedVibe, titleMatchesOnly]);

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="max-w-5xl mx-auto">
        <div id="series-navigator-top" className="scroll-mt-24" />
        <div className="ff-panel mb-8 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(61,147,88,0.24),_rgba(7,14,10,0.94)_60%)] p-6 md:p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.34em] text-green-300/70">Archive Retrieval</p>
          <h1 className="ff-glow ff-safe-wrap mb-3 text-3xl font-bold text-green-50 sm:text-4xl md:text-5xl">Access The Found Footage Vault</h1>
          <p className="max-w-3xl text-sm leading-7 text-green-50/70 md:text-base">
            Type a title, narrow by category or vibe, and scan the active archive without getting buried under every possible filter at once.
          </p>
        </div>
        {quizMode && quizAnswerSummary.length > 0 ? (
          <div className="ff-panel ff-mobile-panel mb-6 rounded-2xl p-4 text-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="ff-safe-wrap text-sm font-medium text-green-50">Search Prefilled From Quiz</div>
                <div className="text-xs text-green-100/52">These filters came from your quiz answers. You can keep adjusting the search from here.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quizHref ? (
                  <Link
                    href={quizHref}
                    className="ff-border rounded-full px-3 py-1 text-xs text-green-50/78 hover:bg-green-400/8"
                  >
                    Back To Quiz
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={dismissQuizContext}
                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/78 hover:bg-green-400/8"
                >
                  Dismiss Quiz Context
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-green-50/78">
              {quizAnswerSummary.map((item) => (
                <span key={item.id} className="ff-border ff-mobile-chip ff-safe-wrap rounded-full px-3 py-1">
                  {item.label}: {item.valueLabel}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {showLegacyRecoveryBanner ? (
          <div className="ff-panel ff-mobile-panel mb-6 rounded-2xl p-4 text-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="ff-safe-wrap text-sm font-medium text-green-50">Recovered Broken Search Filters</div>
                <div className="text-xs text-green-100/52">This view came from an older broken search URL. Default score ranges were restored so the archive can display movies again.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={clearBrokenFilters}
                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/78 hover:bg-green-400/8"
                >
                  Clear Broken Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowLegacyRecoveryBanner(false)}
                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/78 hover:bg-green-400/8"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ) : null}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type a movie title or keyword..."
            className="ff-panel w-full rounded-2xl border border-green-300/15 px-4 py-4 text-lg text-green-50 outline-none transition focus:border-green-300/45"
          />
          <div className="ff-panel ff-mobile-panel rounded-2xl p-4 text-sm text-green-50/78">
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Search Lane</div>
            <div className="ff-safe-wrap font-medium text-green-50">{searchLaneSummary.label}</div>
            <div className="ff-safe-wrap mt-1 text-green-100/55">{searchLaneSummary.description}</div>
            {searchLaneAction ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-green-300/10 pt-3">
                <div className="ff-safe-wrap min-w-0 text-xs text-green-100/45">{searchLaneAction.description}</div>
                <button
                  type="button"
                  onClick={handleSearchLaneAction}
                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                >
                  {searchLaneAction.label}
                </button>
              </div>
            ) : null}
          </div>
          {franchiseQueryHint ? (
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4 text-sm text-green-50/78">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Franchise Hint</div>
              <div className="ff-safe-wrap text-green-100/55">
                {franchiseQueryHint.reason || `This query is close to ${franchiseQueryHint.label}, but it is still too broad for franchise mode.`}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSearch(franchiseQueryHint.suggestedQuery)}
                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                >
                  Search {franchiseQueryHint.suggestedQuery}
                </button>
              </div>
            </div>
          ) : null}
          {titleQueryHint ? (
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4 text-sm text-green-50/78">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Title Hint</div>
              <div className="ff-safe-wrap text-green-100/55">
                {titleQueryHint.reason || "This search looks close to a known title. Tightening the wording should produce a cleaner archive pull."}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSearch(titleQueryHint.suggestedQuery)}
                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                >
                  Search {titleQueryHint.suggestedQuery}
                </button>
              </div>
            </div>
          ) : null}
          {titleModeHint ? (
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4 text-sm text-green-50/78">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Title Mode Hint</div>
              <div className="ff-safe-wrap text-green-100/55">
                This search already has a strong title hit for {titleModeHint.title}, but {titleModeHint.extraMatchCount} broader archive matches are still in the stack.
              </div>
              {titleModeHint.reason ? (
                <div className="mt-2 text-[11px] text-green-100/45">
                  {titleModeHint.reason}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTitleMatchesOnly(true)}
                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                >
                  Turn On Title Matches Only
                </button>
              </div>
            </div>
          ) : null}
          {franchiseShortcuts.length > 0 ? (
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Franchise Shortcuts</div>
                  <div className="text-xs text-green-100/45">These only appear when the query clearly points at a known series. Use one click to tighten the search lane.</div>
                </div>
              </div>
              <div className="mb-3 text-[11px] text-green-100/45">
                Broad single-word matches are intentionally ignored here, so generic terms do not get promoted into franchise mode.
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {franchiseShortcuts.map((shortcut) => (
                  <button
                    key={shortcut.id}
                    type="button"
                    onClick={() => applyFranchiseShortcut(shortcut)}
                    className="rounded-2xl border border-green-300/15 bg-black/20 px-4 py-4 text-left text-green-50/82 transition hover:bg-green-400/8"
                  >
                    <div className="ff-safe-wrap text-sm font-semibold">{shortcut.label}</div>
                    <div className="ff-safe-wrap mt-1 text-xs text-green-100/50">{shortcut.description}</div>
                  </button>
                ))}
              </div>
              {suggestedNextFranchises.length > 0 ? (
                <div className="mt-4 border-t border-green-300/10 pt-4">
                  <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Suggested Next Franchise</div>
                  <div className="mb-3 text-xs text-green-100/45">Single-series hit detected. Branch into an adjacent archive lane with one click.</div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedNextFranchises.map((shortcut) => (
                      <button
                        key={`suggested-${shortcut.id}`}
                        type="button"
                        onClick={() => applyFranchiseShortcut(shortcut)}
                        className="ff-border rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                      >
                        {shortcut.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-green-300/70">Category</label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            </div>
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-green-300/70">Vibe</label>
            <select
              value={selectedVibe}
              onChange={(event) => setSelectedVibe(event.target.value)}
              className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
            >
              <option value="">Any Vibe</option>
              {vibeOptions.map((vibe) => (
                <option key={vibe.value} value={vibe.value}>
                  {vibe.label}
                </option>
              ))}
            </select>
            </div>
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
            <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-green-300/70">Sort</label>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="mt-2 text-xs text-green-100/45">
              {sortOptions.find((option) => option.value === sortMode)?.description}
            </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={resetSearchState}
              className="ff-button rounded-full px-4 py-2"
            >
              Reset Search
            </button>
            <button
              type="button"
              onClick={copyShareLink}
              className="ff-border rounded-full px-4 py-2 text-green-50/80 hover:bg-green-400/8"
            >
              {copyStatus === "copied" ? "Link Copied" : copyStatus === "error" ? "Copy Failed" : "Copy View Link"}
            </button>
            <span className="ff-safe-wrap text-green-100/45">Fast filters first. Advanced retrieval tools are below.</span>
          </div>

          <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Quick Retrievals</div>
                <div className="text-xs text-green-100/45">One-click presets for common archive pulls.</div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {quickFilterPresets.map((preset) => {
                const active = presetIsActive(preset);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyQuickFilter(preset)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${active ? "border-green-300/50 bg-green-400/10 text-green-50" : "border-green-300/15 bg-black/20 text-green-50/82 hover:bg-green-400/8"}`}
                  >
                    <div className="ff-safe-wrap text-sm font-semibold">{preset.label}</div>
                    <div className="ff-safe-wrap mt-1 text-xs text-green-100/50">{preset.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <details className="ff-panel ff-mobile-panel rounded-2xl p-4">
              <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.18em] text-green-300/70">
                Route Filters
              </summary>
              <div className="mt-4 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-green-300/70">List</label>
                  <select
                    value={selectedListKey}
                    onChange={(event) => setSelectedListKey(event.target.value)}
                    className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
                  >
                    <option value="">All Lists</option>
                    {listOptions.map((listOption) => (
                      <option key={listOption.value} value={listOption.value}>
                        {listOption.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm uppercase tracking-[0.18em] text-green-300/70">Fear Category</label>
                  <select
                    value={selectedFearCategory}
                    onChange={(event) => setSelectedFearCategory(event.target.value)}
                    className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-green-50 outline-none transition focus:border-green-300/45"
                  >
                    <option value="">All Fear Categories</option>
                    {fearCategoryOptions.map((fearCategory) => (
                      <option key={fearCategory} value={fearCategory}>
                        {fearCategory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </details>

            <details className="ff-panel ff-mobile-panel rounded-2xl p-4">
              <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.18em] text-green-300/70">
                Archive Flags
              </summary>
              <div className="mt-4 grid gap-4">
                <label className="ff-panel ff-mobile-panel flex items-center gap-3 rounded-2xl px-4 py-4 text-sm text-green-50/78">
                  <input
                    type="checkbox"
                    checked={titleMatchesOnly}
                    onChange={(event) => setTitleMatchesOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-green-300/25 bg-black/20 text-green-400 focus:ring-green-300/30"
                  />
                  <span>Title matches only</span>
                </label>
                <label className="ff-panel ff-mobile-panel flex items-center gap-3 rounded-2xl px-4 py-4 text-sm text-green-50/78">
                  <input
                    type="checkbox"
                    checked={beginnerFriendlyOnly}
                    onChange={(event) => setBeginnerFriendlyOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-green-300/25 bg-black/20 text-green-400 focus:ring-green-300/30"
                  />
                  <span>Beginner Friendly only</span>
                </label>
                <label className="ff-panel ff-mobile-panel flex items-center gap-3 rounded-2xl px-4 py-4 text-sm text-green-50/78">
                  <input
                    type="checkbox"
                    checked={hiddenGemOnly}
                    onChange={(event) => setHiddenGemOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-green-300/25 bg-black/20 text-green-400 focus:ring-green-300/30"
                  />
                  <span>Hidden Gems only</span>
                </label>
              </div>
            </details>

            <details className="ff-panel ff-mobile-panel rounded-2xl p-4 xl:col-span-1">
              <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.18em] text-green-300/70">
                Tag Filters
              </summary>
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-sm uppercase tracking-[0.18em] text-green-300/70">Tags</label>
                  <span className="text-xs text-green-100/45">Search and add multiple tags</span>
                </div>
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(event) => setTagSearch(event.target.value)}
                  placeholder="Search tags..."
                  className="w-full rounded-xl border border-green-300/15 bg-black/20 px-3 py-2 text-sm text-green-50 outline-none transition focus:border-green-300/45"
                />
                {selectedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ff-button ff-mobile-chip rounded-full px-3 py-1 text-xs"
                      >
                        {formatTagLabel(tag)} ×
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="ff-safe-wrap text-sm text-green-100/45">No tags selected yet. Add recovered traits to narrow the archive.</div>
                )}
                <div className="flex flex-wrap gap-2">
                  {matchingTags.length > 0 ? (
                    matchingTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="ff-border ff-mobile-chip rounded-full px-3 py-1 text-xs text-green-50/75 hover:bg-green-400/8"
                      >
                        {formatTagLabel(tag)}
                      </button>
                    ))
                  ) : (
                    <div className="ff-safe-wrap text-sm text-green-100/45">No matching tags remain in the current archive view.</div>
                  )}
                </div>
              </div>
            </details>
          </div>

          <details className="ff-panel ff-mobile-panel rounded-2xl p-4">
            <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.18em] text-green-300/70">
              Score Filters
            </summary>
            <div className="mt-4 space-y-4">
              <RangeSection
                title="Scare Score Range"
                minValue={minScore}
                maxValue={maxScore}
                minFallback={0}
                maxFallback={10}
                onMinChange={updateRangeValue(setMinScore, 0)}
                onMaxChange={updateRangeValue(setMaxScore, 10)}
                onReset={() => {
                  setMinScore(0);
                  setMaxScore(10);
                }}
                errorMessage={minScore > maxScore ? "Minimum cannot be higher than maximum." : ""}
              />
              <RangeSection
                title="Realism Score Range"
                minValue={minRealismScore}
                maxValue={maxRealismScore}
                minFallback={0}
                maxFallback={10}
                onMinChange={updateRangeValue(setMinRealismScore, 0)}
                onMaxChange={updateRangeValue(setMaxRealismScore, 10)}
                onReset={() => {
                  setMinRealismScore(0);
                  setMaxRealismScore(10);
                }}
                errorMessage={minRealismScore > maxRealismScore ? "Minimum cannot be higher than maximum." : ""}
              />
              <MinimumSection
                title="Disturbing Score Minimum"
                value={minDisturbingScore}
                fallback={0}
                onChange={updateRangeValue(setMinDisturbingScore, 0)}
                onReset={() => setMinDisturbingScore(0)}
              />
              <RangeSection
                title="Fear Index Range"
                minValue={minFearIndex}
                maxValue={maxFearIndex}
                minFallback={0}
                maxFallback={10}
                onMinChange={updateRangeValue(setMinFearIndex, 0)}
                onMaxChange={updateRangeValue(setMaxFearIndex, 10)}
                onReset={() => {
                  setMinFearIndex(0);
                  setMaxFearIndex(10);
                }}
                errorMessage={minFearIndex > maxFearIndex ? "Minimum cannot be higher than maximum." : ""}
              />
            </div>
          </details>
          {hasActiveFilters ? (
            <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
              <div className="mb-3 text-sm font-medium text-green-50">Active Filters</div>
              <div className="flex flex-wrap gap-2">
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="ff-button ff-mobile-chip rounded-full px-3 py-1 text-xs"
                  >
                    Search: {search} ×
                  </button>
                ) : null}
                {selectedCategory ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Category: {categoryOptions.find((category) => category.value === selectedCategory)?.label || selectedCategory} ×
                  </button>
                ) : null}
                {selectedVibe ? (
                  <button
                    type="button"
                    onClick={() => setSelectedVibe("")}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Vibe: {vibeOptions.find((option) => option.value === selectedVibe)?.label || selectedVibe} ×
                  </button>
                ) : null}
                {selectedListKey ? (
                  <button
                    type="button"
                    onClick={() => setSelectedListKey("")}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    List: {listLabels[selectedListKey] || selectedListKey} ×
                  </button>
                ) : null}
                {selectedFearCategory ? (
                  <button
                    type="button"
                    onClick={() => setSelectedFearCategory("")}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Fear Category: {selectedFearCategory} ×
                  </button>
                ) : null}
                {titleMatchesOnly ? (
                  <button
                    type="button"
                    onClick={() => setTitleMatchesOnly(false)}
                    className="ff-button ff-mobile-chip rounded-full px-3 py-1 text-xs"
                  >
                    Title Matches Only ×
                  </button>
                ) : null}
                {beginnerFriendlyOnly ? (
                  <button
                    type="button"
                    onClick={() => setBeginnerFriendlyOnly(false)}
                    className="ff-button ff-mobile-chip rounded-full px-3 py-1 text-xs"
                  >
                    Beginner Friendly ×
                  </button>
                ) : null}
                {hiddenGemOnly ? (
                  <button
                    type="button"
                    onClick={() => setHiddenGemOnly(false)}
                    className="ff-button ff-mobile-chip rounded-full px-3 py-1 text-xs"
                  >
                    Hidden Gem ×
                  </button>
                ) : null}
                {sortMode !== "scare-desc" ? (
                  <button
                    type="button"
                    onClick={() => setSortMode("scare-desc")}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Sort: {sortMode} ×
                  </button>
                ) : null}
                {minRealismScore !== 0 || maxRealismScore !== 10 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMinRealismScore(0);
                      setMaxRealismScore(10);
                    }}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Realism: {minRealismScore}-{maxRealismScore} ×
                  </button>
                ) : null}
                {minDisturbingScore !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setMinDisturbingScore(0)}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Disturbing: {minDisturbingScore}+ ×
                  </button>
                ) : null}
                {minScore !== 0 || maxScore !== 10 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMinScore(0);
                      setMaxScore(10);
                    }}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Scare Score: {minScore}-{maxScore} ×
                  </button>
                ) : null}
                {minFearIndex !== 0 || maxFearIndex !== 10 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMinFearIndex(0);
                      setMaxFearIndex(10);
                    }}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Fear Index: {minFearIndex}-{maxFearIndex} ×
                  </button>
                ) : null}
                {selectedTags.map((tag) => (
                  <button
                    key={`active-${tag}`}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ff-button ff-safe-wrap rounded-full px-3 py-1 text-xs"
                  >
                    Tag: {formatTagLabel(tag)} ×
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="ff-panel ff-mobile-panel ff-safe-wrap rounded-2xl p-4 text-sm text-green-50/72">
            {resultsSummary}
          </div>
          <div className="mt-4">
            {filteredMovies.length > 0 ? (
              <div className="space-y-5">
                {franchiseGroups.length > 1 ? (
                  <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Series Navigator</div>
                        <div className="text-xs text-green-100/45">Jump between detected franchise pulls without scrolling through the entire archive stack.</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-green-100/55">
                          <span className="ff-border rounded-full px-2 py-1 text-green-50/78">
                            Default View: {preferredFranchiseGroupsExpanded ? "Expanded" : "Collapsed"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-xs uppercase tracking-[0.16em] text-green-100/45">
                          {franchiseGroups.length} series
                        </div>
                        <button
                          type="button"
                          onClick={resetFranchiseExpansionPreference}
                          className="ff-border rounded-full px-3 py-1 text-[11px] text-green-50/80 hover:bg-green-400/8"
                        >
                          Reset Default
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllFranchiseGroupsExpanded(true)}
                          className="ff-border rounded-full px-3 py-1 text-[11px] text-green-50/80 hover:bg-green-400/8"
                        >
                          Expand All
                        </button>
                        <button
                          type="button"
                          onClick={() => setAllFranchiseGroupsExpanded(false)}
                          className="ff-border rounded-full px-3 py-1 text-[11px] text-green-50/80 hover:bg-green-400/8"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {franchiseGroups.map((group) => (
                        <a
                          key={`jump-${group.id}`}
                          href={`#franchise-${group.id}`}
                          className="ff-border ff-mobile-chip rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                        >
                          {group.label}{group.yearRangeLabel ? ` (${group.yearRangeLabel})` : ""}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {franchiseGroups.length > 0 ? (
                  <div className="space-y-4">
                    <div className="ff-safe-wrap px-1 text-xs uppercase tracking-[0.18em] text-green-100/45">
                      Series pull
                    </div>
                    {franchiseGroups.map((group) => (
                      <div id={`franchise-${group.id}`} key={group.id} className="ff-panel ff-mobile-panel rounded-2xl p-4 scroll-mt-28">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">{group.label}</div>
                            <div className="text-xs text-green-100/45">
                              {group.description} {group.usesCanonicalOrder ? "Uses the franchise's canonical sequence." : "Ordered by release year."}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-green-100/55">
                              {group.usesCanonicalOrder ? (
                                <span
                                  className="ff-border rounded-full px-2 py-1 text-green-50/78"
                                  title="This franchise is ordered by its canonical sequence instead of strict release year."
                                >
                                  Custom Order
                                </span>
                              ) : null}
                              {group.stats?.averageScareScore ? (
                                <span className="ff-border rounded-full px-2 py-1 text-green-50/78">
                                  Avg Scare {group.stats.averageScareScore}
                                </span>
                              ) : null}
                              {group.stats?.peakFearIndex ? (
                                <span className="ff-border rounded-full px-2 py-1 text-green-50/78">
                                  Peak Fear {group.stats.peakFearIndex}
                                </span>
                              ) : null}
                            </div>
                            {group.usesCanonicalOrder ? (
                              <div className="mt-2 text-[11px] text-green-100/45">
                                Sequence follows the franchise&apos;s established order instead of the release-year lane.
                              </div>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-green-100/45">
                            {group.yearRangeLabel ? (
                              <span className="ff-border rounded-full px-2 py-1 text-[11px] text-green-50/78">
                                {group.yearRangeLabel}
                              </span>
                            ) : null}
                            <span>
                              {group.movies.length} files
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextExpanded = expandedFranchiseGroups[group.id] === false;
                                persistFranchiseExpansionPreference(nextExpanded);
                                setExpandedFranchiseGroups((currentState) => ({
                                  ...currentState,
                                  [group.id]: nextExpanded,
                                }));
                              }}
                              className="ff-border rounded-full px-3 py-1 text-[11px] text-green-50/80 hover:bg-green-400/8"
                            >
                              {expandedFranchiseGroups[group.id] === false ? "Expand" : "Collapse"}
                            </button>
                          </div>
                        </div>
                        {expandedFranchiseGroups[group.id] === false ? (
                          <div className="text-sm text-green-100/52">Series collapsed. Expand to review the recovered files in this franchise.</div>
                        ) : (
                          <>
                            <ul className="space-y-2">
                              {group.movies.map((movie) => (
                                <MovieListItem
                                  key={movie.slug}
                                  movie={movie}
                                  showSynopsis={true}
                                />
                              ))}
                            </ul>
                            {franchiseGroups.length > 1 ? (
                              <div className="mt-4 flex justify-end">
                                <a
                                  href="#series-navigator-top"
                                  className="ff-border rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                                >
                                  Back To Series Navigator
                                </a>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {featuredTitleMatches.length > 0 ? (
                  <div className="ff-panel ff-mobile-panel rounded-2xl p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm uppercase tracking-[0.18em] text-green-300/70">Top Title Matches</div>
                        <div className="text-xs text-green-100/45">Known-title and alias matches are pinned here before the broader archive pull.</div>
                      </div>
                      <div className="text-xs uppercase tracking-[0.16em] text-green-100/45">
                        {featuredTitleMatches.length} shown
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {featuredTitleMatches.map((movie) => (
                        <MovieListItem
                          key={movie.slug}
                          movie={movie}
                          showSynopsis={true}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}

                {broaderArchiveMatches.length > 0 ? (
                  <div className="space-y-3">
                    {featuredTitleMatches.length > 0 ? (
                      <div className="ff-safe-wrap px-1 text-xs uppercase tracking-[0.18em] text-green-100/45">
                        Broader archive matches
                      </div>
                    ) : null}
                    <ul className="space-y-2">
                      {broaderArchiveMatches.map((movie) => (
                        <MovieListItem
                          key={movie.slug}
                          movie={movie}
                          showSynopsis={true}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="ff-panel ff-mobile-panel ff-safe-wrap rounded-2xl p-5 text-green-100/56">
                <div>No case files match the current retrieval filters. Reset the search or widen the archive criteria to bring titles back into view.</div>
                {searchSuggestions.length > 0 ? (
                  <div className="mt-4">
                    <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Did You Mean</div>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setSearch(suggestion)}
                          className="ff-border rounded-full px-3 py-1 text-xs text-green-50/80 hover:bg-green-400/8"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-6 py-12 text-white">
          <div className="ff-panel ff-safe-wrap max-w-5xl mx-auto rounded-2xl p-6 text-center text-green-100/56">Loading search...</div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}