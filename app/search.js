"use client";
import { movies } from "../data/movies";
import categories from "../data/categories";
import { useState } from "react";

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

export default function SearchPage() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // scariest → least scary
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  // Collect all unique tags from movies
  const allTags = Array.from(new Set(movies.flatMap(m => m.tags || []))).sort();

  // Filter, sort, and score
  const filteredMovies = movies
    .filter((movie) => {
      const matchesSearch =
        search === "" ||
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.synopsis.toLowerCase().includes(search.toLowerCase());
      const matchesScore =
        typeof movie.scareScore === "number" &&
        movie.scareScore >= minScore &&
        movie.scareScore <= maxScore;
      const matchesCategory =
        !selectedCategory || (movie.categories && movie.categories.includes(selectedCategory));
      const matchesTags =
        selectedTags.length === 0 || (movie.tags && selectedTags.every(tag => movie.tags.includes(tag)));
      return matchesSearch && matchesScore && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      if (sortOrder === "desc") {
        return b.scareScore - a.scareScore;
      } else {
        return a.scareScore - b.scareScore;
      }
    });

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Search Found Footage Movies</h1>
        <div className="mb-8 space-y-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search movies..."
            className="w-full rounded-lg bg-neutral-950 border border-gray-800 px-4 py-3 text-lg text-white focus:border-red-400 focus:outline-none"
          />
          <div className="flex items-center gap-4">
            <label className="text-gray-300">Category:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="rounded bg-neutral-950 border border-gray-800 px-2 py-1 text-white"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-gray-300">Tags:</label>
            <select
              multiple
              value={selectedTags}
              onChange={e => setSelectedTags(Array.from(e.target.selectedOptions, o => o.value))}
              className="rounded bg-neutral-950 border border-gray-800 px-2 py-1 text-white h-32"
            >
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-gray-300">Sort by Scariest:</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="rounded bg-neutral-950 border border-gray-800 px-2 py-1 text-white"
            >
              <option value="desc">Scariest → Least Scary</option>
              <option value="asc">Least Scary → Scariest</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-gray-300">Score:</label>
            <input
              type="range"
              min={0}
              max={10}
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="accent-red-400"
            />
            <span className="text-gray-400">Min: {minScore}</span>
            <input
              type="range"
              min={0}
              max={10}
              value={maxScore}
              onChange={e => setMaxScore(Number(e.target.value))}
              className="accent-red-400"
            />
            <span className="text-gray-400">Max: {maxScore}</span>
          </div>
          <div className="mt-4">
            {filteredMovies.length > 0 ? (
              <ul className="space-y-2">
                {filteredMovies.map((movie) => (
                  <li key={movie.slug}>
                    <a href={`/movie/${movie.slug}`} className="hover:text-red-400 font-semibold">
                      {movie.title} <span className="text-gray-400">({movie.year})</span>
                    </a>
                    <div className="text-gray-300 text-sm mt-1">{movie.synopsis}</div>
                    <div className="text-xs text-red-400 mt-1">Scare Score: {movie.scareScore}</div>
                    <div className="text-xs text-gray-400 mt-1">Categories: {movie.categories?.join(", ")}</div>
                    <div className="text-xs text-gray-400 mt-1">Tags: {movie.tags?.join(", ")}</div>
                  </li>
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
