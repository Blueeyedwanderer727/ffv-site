"use client";

import { movies } from "../data/movies";
import categories from "../data/categories";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFearCategory, getFearIndex, getScariestScore } from "../data/listRankings";
import { movieMatchesFilters } from "../data/searchFilters";
import { Suspense, useEffect, useMemo, useState } from "react";
import MovieListItem from "../components/MovieListItem";

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

const sortOptions = [
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

function clampScore(value, fallback) {
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

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [sortMode, setSortMode] = useState(() => searchParams.get("sort") || "scare-desc");
  const [minScore, setMinScore] = useState(() => clampScore(searchParams.get("minScore"), 0));
  const [maxScore, setMaxScore] = useState(() => clampScore(searchParams.get("maxScore"), 10));
  const [minRealismScore, setMinRealismScore] = useState(() => clampScore(searchParams.get("minRealism"), 0));
  const [maxRealismScore, setMaxRealismScore] = useState(() => clampScore(searchParams.get("maxRealism"), 10));
  const [minFearIndex, setMinFearIndex] = useState(() => clampScore(searchParams.get("minFear"), 0));
  const [maxFearIndex, setMaxFearIndex] = useState(() => clampScore(searchParams.get("maxFear"), 10));
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") || "");
  const [selectedFearCategory, setSelectedFearCategory] = useState(() => searchParams.get("fearCategory") || "");
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(() => searchParams.get("beginnerFriendly") === "true");
  const [selectedTags, setSelectedTags] = useState(() => getTagsFromParams(searchParams));
  const [tagSearch, setTagSearch] = useState("");
  const [copyStatus, setCopyStatus] = useState("idle");

  const allTags = Array.from(new Set(movies.flatMap((movie) => movie.tags || []))).sort();
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

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setSortMode(searchParams.get("sort") || "scare-desc");
    setMinScore(clampScore(searchParams.get("minScore"), 0));
    setMaxScore(clampScore(searchParams.get("maxScore"), 10));
    setMinRealismScore(clampScore(searchParams.get("minRealism"), 0));
    setMaxRealismScore(clampScore(searchParams.get("maxRealism"), 10));
    setMinFearIndex(clampScore(searchParams.get("minFear"), 0));
    setMaxFearIndex(clampScore(searchParams.get("maxFear"), 10));
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedFearCategory(searchParams.get("fearCategory") || "");
    setBeginnerFriendlyOnly(searchParams.get("beginnerFriendly") === "true");
    setSelectedTags(getTagsFromParams(searchParams));
  }, [searchParams]);

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

  const hasActiveFilters =
    search !== "" ||
    sortMode !== "scare-desc" ||
    minScore !== 0 ||
    maxScore !== 10 ||
    minRealismScore !== 0 ||
    maxRealismScore !== 10 ||
    minFearIndex !== 0 ||
    maxFearIndex !== 10 ||
    selectedCategory !== "" ||
    selectedFearCategory !== "" ||
    beginnerFriendlyOnly ||
    selectedTags.length > 0;

  const urlQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (search) {
      params.set("q", search);
    }
    if (sortMode !== "scare-desc") {
      params.set("sort", sortMode);
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
    if (minFearIndex !== 0) {
      params.set("minFear", String(minFearIndex));
    }
    if (maxFearIndex !== 10) {
      params.set("maxFear", String(maxFearIndex));
    }
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    if (selectedFearCategory) {
      params.set("fearCategory", selectedFearCategory);
    }
    if (beginnerFriendlyOnly) {
      params.set("beginnerFriendly", "true");
    }
    for (const tag of selectedTags) {
      params.append("tag", tag);
    }

    return params.toString();
  }, [beginnerFriendlyOnly, maxFearIndex, maxRealismScore, maxScore, minFearIndex, minRealismScore, minScore, search, selectedCategory, selectedFearCategory, selectedTags, sortMode]);

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
        minScore,
        maxScore,
        minRealismScore,
        maxRealismScore,
        minFearIndex,
        maxFearIndex,
        category: selectedCategory,
        fearCategory: selectedFearCategory,
        tags: selectedTags,
        beginnerFriendly: beginnerFriendlyOnly,
      })
    )
    .sort((left, right) => {
      switch (sortMode) {
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

  const resultsSummary = useMemo(() => {
    const fragments = [];

    if (selectedCategory) {
      fragments.push(categoryOptions.find((category) => category.value === selectedCategory)?.label || selectedCategory);
    }
    if (selectedFearCategory) {
      fragments.push(selectedFearCategory);
    }
    if (beginnerFriendlyOnly) {
      fragments.push("Beginner Friendly");
    }

    const scareRangeLabel = formatRangeLabel(minScore, maxScore, 0, 10);
    if (scareRangeLabel) {
      fragments.push(`Scare Score ${scareRangeLabel}`);
    }

    const realismRangeLabel = formatRangeLabel(minRealismScore, maxRealismScore, 0, 10);
    if (realismRangeLabel) {
      fragments.push(`Realism ${realismRangeLabel}`);
    }

    const fearRangeLabel = formatRangeLabel(minFearIndex, maxFearIndex, 0, 10);
    if (fearRangeLabel) {
      fragments.push(`Fear Index ${fearRangeLabel}`);
    }

    if (selectedTags.length > 0) {
      fragments.push(selectedTags.map(formatTagLabel).join(", "));
    }

    if (search) {
      fragments.push(`matching \"${search}\"`);
    }

    if (fragments.length === 0) {
      return `${filteredMovies.length} ${filteredMovies.length === 1 ? "movie" : "movies"} across the full vault.`;
    }

    return `${filteredMovies.length} ${filteredMovies.length === 1 ? "movie" : "movies"} matching ${fragments.join(" + ")}.`;
  }, [beginnerFriendlyOnly, filteredMovies.length, maxFearIndex, maxRealismScore, maxScore, minFearIndex, minRealismScore, minScore, search, selectedCategory, selectedFearCategory, selectedTags]);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Search Found Footage Movies</h1>
        <div className="mb-8 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search movies..."
            className="w-full rounded-lg bg-neutral-950 border border-gray-800 px-4 py-3 text-lg text-white focus:border-red-400 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-300">Category:</label>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded bg-neutral-950 border border-gray-800 px-2 py-1 text-white"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-300">Fear Category:</label>
            <select
              value={selectedFearCategory}
              onChange={(event) => setSelectedFearCategory(event.target.value)}
              className="rounded bg-neutral-950 border border-gray-800 px-2 py-1 text-white"
            >
              <option value="">All Fear Categories</option>
              {fearCategoryOptions.map((fearCategory) => (
                <option key={fearCategory} value={fearCategory}>
                  {fearCategory}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-neutral-950 px-4 py-3 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={beginnerFriendlyOnly}
              onChange={(event) => setBeginnerFriendlyOnly(event.target.checked)}
              className="h-4 w-4 rounded border-gray-700 bg-black text-red-500 focus:ring-red-400"
            />
            <span>Beginner Friendly only</span>
          </label>
          <div className="space-y-3 rounded-2xl border border-gray-800 bg-neutral-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-gray-300">Tags</label>
              <span className="text-xs text-gray-500">Search and add multiple tags</span>
            </div>
            <input
              type="text"
              value={tagSearch}
              onChange={(event) => setTagSearch(event.target.value)}
              placeholder="Search tags..."
              className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-red-400 focus:outline-none"
            />
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-200 hover:border-red-700 hover:text-white"
                  >
                    {formatTagLabel(tag)} ×
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No tags selected.</div>
            )}
            <div className="flex flex-wrap gap-2">
              {matchingTags.length > 0 ? (
                matchingTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300 hover:border-red-700 hover:text-white"
                  >
                    {formatTagLabel(tag)}
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-500">No matching tags.</div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-gray-300">Sort By:</label>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              className="rounded bg-neutral-950 border border-gray-800 px-2 py-1 text-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {sortOptions.find((option) => option.value === sortMode)?.description}
            </span>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-neutral-950 p-4">
            <div className="mb-3 text-sm font-medium text-gray-200">Scare Score Range</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-300">
                <span className="mb-1 block">Minimum</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={minScore}
                  onChange={updateRangeValue(setMinScore, 0)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white focus:border-red-400 focus:outline-none"
                />
              </label>
              <label className="text-sm text-gray-300">
                <span className="mb-1 block">Maximum</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={maxScore}
                  onChange={updateRangeValue(setMaxScore, 10)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white focus:border-red-400 focus:outline-none"
                />
              </label>
            </div>
            {minScore > maxScore ? (
              <div className="mt-2 text-sm text-red-300">Minimum cannot be higher than maximum.</div>
            ) : null}
          </div>
          <div className="rounded-2xl border border-gray-800 bg-neutral-950 p-4">
            <div className="mb-3 text-sm font-medium text-gray-200">Realism Score Range</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-300">
                <span className="mb-1 block">Minimum</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={minRealismScore}
                  onChange={updateRangeValue(setMinRealismScore, 0)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white focus:border-red-400 focus:outline-none"
                />
              </label>
              <label className="text-sm text-gray-300">
                <span className="mb-1 block">Maximum</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={maxRealismScore}
                  onChange={updateRangeValue(setMaxRealismScore, 10)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white focus:border-red-400 focus:outline-none"
                />
              </label>
            </div>
            {minRealismScore > maxRealismScore ? (
              <div className="mt-2 text-sm text-red-300">Minimum cannot be higher than maximum.</div>
            ) : null}
          </div>
          <div className="rounded-2xl border border-gray-800 bg-neutral-950 p-4">
            <div className="mb-3 text-sm font-medium text-gray-200">Fear Index Range</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-300">
                <span className="mb-1 block">Minimum</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={minFearIndex}
                  onChange={updateRangeValue(setMinFearIndex, 0)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white focus:border-red-400 focus:outline-none"
                />
              </label>
              <label className="text-sm text-gray-300">
                <span className="mb-1 block">Maximum</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={maxFearIndex}
                  onChange={updateRangeValue(setMaxFearIndex, 10)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white focus:border-red-400 focus:outline-none"
                />
              </label>
            </div>
            {minFearIndex > maxFearIndex ? (
              <div className="mt-2 text-sm text-red-300">Minimum cannot be higher than maximum.</div>
            ) : null}
          </div>
          {hasActiveFilters ? (
            <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-4">
              <div className="mb-3 text-sm font-medium text-red-200">Active Filters</div>
              <div className="flex flex-wrap gap-2">
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
                  >
                    Search: {search} ×
                  </button>
                ) : null}
                {selectedCategory ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
                  >
                    Category: {categoryOptions.find((category) => category.value === selectedCategory)?.label || selectedCategory} ×
                  </button>
                ) : null}
                {selectedFearCategory ? (
                  <button
                    type="button"
                    onClick={() => setSelectedFearCategory("")}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
                  >
                    Fear Category: {selectedFearCategory} ×
                  </button>
                ) : null}
                {beginnerFriendlyOnly ? (
                  <button
                    type="button"
                    onClick={() => setBeginnerFriendlyOnly(false)}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
                  >
                    Beginner Friendly ×
                  </button>
                ) : null}
                {sortMode !== "scare-desc" ? (
                  <button
                    type="button"
                    onClick={() => setSortMode("scare-desc")}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
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
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
                  >
                    Realism: {minRealismScore}-{maxRealismScore} ×
                  </button>
                ) : null}
                {minScore !== 0 || maxScore !== 10 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMinScore(0);
                      setMaxScore(10);
                    }}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
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
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
                  >
                    Fear Index: {minFearIndex}-{maxFearIndex} ×
                  </button>
                ) : null}
                {selectedTags.map((tag) => (
                  <button
                    key={`active-${tag}`}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full border border-red-900/60 px-3 py-1 text-xs text-red-100 hover:border-red-700"
                  >
                    Tag: {formatTagLabel(tag)} ×
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSortMode("scare-desc");
                setMinScore(0);
                setMaxScore(10);
                setMinRealismScore(0);
                setMaxRealismScore(10);
                setMinFearIndex(0);
                setMaxFearIndex(10);
                setSelectedCategory("");
                setSelectedFearCategory("");
                setBeginnerFriendlyOnly(false);
                setSelectedTags([]);
                setTagSearch("");
              }}
              className="rounded-full border border-gray-700 px-4 py-2 text-gray-200 hover:border-red-700 hover:text-white"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={copyShareLink}
              className="rounded-full border border-gray-700 px-4 py-2 text-gray-200 hover:border-red-700 hover:text-white"
            >
              {copyStatus === "copied" ? "Link Copied" : copyStatus === "error" ? "Copy Failed" : "Copy Share Link"}
            </button>
            <span className="text-gray-500">Share this view with the current URL.</span>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-neutral-950/70 p-4 text-sm text-gray-300">
            {resultsSummary}
          </div>
          <div className="mt-4">
            {filteredMovies.length > 0 ? (
              <ul className="space-y-2">
                {filteredMovies.map((movie) => (
                  <MovieListItem
                    key={movie.slug}
                    movie={movie}
                    showSynopsis={true}
                    showScores={true}
                    showMeta={true}
                  />
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No movies found.</div>
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
        <main className="min-h-screen bg-black text-white px-6 py-12">
          <div className="max-w-5xl mx-auto text-center text-gray-400">Loading search...</div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}