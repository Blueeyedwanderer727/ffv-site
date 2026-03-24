import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { movies } from "../app/data/movies.js";

const TMDB_API_BASE = "https://api.themoviedb.org/3";
const DEFAULT_KEYWORD_QUERY = "found footage";
const DEFAULT_REPORT_PATH = path.join(process.cwd(), "reports", "tmdb-found-footage-report.json");

function getCsvReportPath(reportPath) {
  const parsedPath = path.parse(reportPath);
  return path.join(parsedPath.dir, `${parsedPath.name}.csv`);
}

function parseArgs(argv) {
  const args = {
    keywordQuery: DEFAULT_KEYWORD_QUERY,
    keywordId: null,
    maxPages: 10,
    reportPath: DEFAULT_REPORT_PATH,
    dryRun: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg === "--keyword-id") {
      args.keywordId = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--keyword-query") {
      args.keywordQuery = argv[index + 1] || DEFAULT_KEYWORD_QUERY;
      index += 1;
      continue;
    }

    if (arg === "--max-pages") {
      args.maxPages = Number(argv[index + 1]) || args.maxPages;
      index += 1;
      continue;
    }

    if (arg === "--report") {
      args.reportPath = path.resolve(argv[index + 1] || DEFAULT_REPORT_PATH);
      index += 1;
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: npm run compare:tmdb-found-footage -- [options]

Options:
  --keyword-id <id>       Use a known TMDB keyword id directly.
  --keyword-query <text>  Search TMDB keywords first. Default: "${DEFAULT_KEYWORD_QUERY}".
  --max-pages <count>     Limit TMDB keyword result pages. Default: 10.
  --report <path>         Write JSON report to a custom path and CSV shortlist beside it.
  --dry-run               Print summary without writing a report file.
  --help                  Show this message.

Environment:
  TMDB_API_READ_ACCESS_TOKEN  Preferred TMDB v4 read token.
  TMDB_API_KEY                Supported fallback TMDB v3 API key.
`);
}

function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractTmdbIdFromUrl(url) {
  const match = String(url || "").match(/\/movie\/(\d+)/i);
  return match ? Number(match[1]) : null;
}

function buildAuthOptions() {
  const readAccessToken = process.env.TMDB_API_READ_ACCESS_TOKEN?.trim();
  const apiKey = process.env.TMDB_API_KEY?.trim();

  if (!readAccessToken && !apiKey) {
    throw new Error("Missing TMDB credentials. Set TMDB_API_READ_ACCESS_TOKEN or TMDB_API_KEY.");
  }

  return { readAccessToken, apiKey };
}

async function tmdbFetchJson(endpoint, authOptions, searchParams = {}) {
  const url = new URL(`${TMDB_API_BASE}${endpoint}`);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const headers = {
    accept: "application/json",
  };

  if (authOptions.readAccessToken) {
    headers.Authorization = `Bearer ${authOptions.readAccessToken}`;
  } else {
    url.searchParams.set("api_key", authOptions.apiKey);
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`TMDB request failed for ${url.pathname}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function resolveKeywordId(args, authOptions) {
  if (args.keywordId) {
    return args.keywordId;
  }

  const response = await tmdbFetchJson("/search/keyword", authOptions, {
    query: args.keywordQuery,
    page: 1,
  });

  const exactMatch = response.results?.find((entry) => normalizeTitle(entry.name) === normalizeTitle(args.keywordQuery));
  if (!exactMatch) {
    const availableKeywords = (response.results || []).slice(0, 10).map((entry) => `${entry.id}:${entry.name}`).join(", ");
    throw new Error(`Could not resolve TMDB keyword for \"${args.keywordQuery}\". Candidates: ${availableKeywords || "none"}`);
  }

  return exactMatch.id;
}

function buildLocalIndexes() {
  const byTmdbId = new Map();
  const byTitleYear = new Set();

  movies.forEach((movie) => {
    const tmdbId = extractTmdbIdFromUrl(movie.tmdbUrl);
    if (tmdbId) {
      byTmdbId.set(tmdbId, movie);
    }

    byTitleYear.add(`${normalizeTitle(movie.title)}::${movie.year}`);
  });

  return { byTmdbId, byTitleYear };
}

function escapeCsvValue(value) {
  const normalizedValue = value ?? "";
  const stringValue = String(normalizedValue);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function buildMissingCsv(missingFromArchive) {
  const headers = [
    "tmdbId",
    "title",
    "year",
    "releaseDate",
    "originalLanguage",
    "popularity",
    "voteAverage",
    "tmdbUrl",
    "overview",
  ];

  const rows = missingFromArchive.map((entry) => [
    entry.tmdbId,
    entry.title,
    entry.year,
    entry.releaseDate,
    entry.originalLanguage,
    entry.popularity,
    entry.voteAverage,
    entry.tmdbUrl,
    entry.overview,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

async function collectKeywordMovies(keywordId, authOptions, maxPages) {
  const collected = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= maxPages) {
    const response = await tmdbFetchJson(`/keyword/${keywordId}/movies`, authOptions, {
      page,
      include_adult: false,
      sort_by: "primary_release_date.asc",
    });

    totalPages = Math.max(1, Number(response.total_pages) || 1);
    collected.push(...(response.results || []));
    page += 1;
  }

  return collected;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const authOptions = buildAuthOptions();
  const keywordId = await resolveKeywordId(args, authOptions);
  const tmdbMovies = await collectKeywordMovies(keywordId, authOptions, args.maxPages);
  const localIndexes = buildLocalIndexes();

  const matchedByTmdbId = [];
  const matchedByTitleYear = [];
  const missingFromArchive = [];

  tmdbMovies.forEach((entry) => {
    const releaseYear = entry.release_date ? Number(entry.release_date.slice(0, 4)) : null;
    const localById = localIndexes.byTmdbId.get(entry.id);

    if (localById) {
      matchedByTmdbId.push({
        tmdbId: entry.id,
        tmdbTitle: entry.title,
        tmdbYear: releaseYear,
        localTitle: localById.title,
        localSlug: localById.slug,
      });
      return;
    }

    const titleYearKey = `${normalizeTitle(entry.title)}::${releaseYear}`;
    if (releaseYear && localIndexes.byTitleYear.has(titleYearKey)) {
      matchedByTitleYear.push({
        tmdbId: entry.id,
        tmdbTitle: entry.title,
        tmdbYear: releaseYear,
      });
      return;
    }

    missingFromArchive.push({
      tmdbId: entry.id,
      title: entry.title,
      year: releaseYear,
      releaseDate: entry.release_date || null,
      originalLanguage: entry.original_language || null,
      overview: entry.overview || "",
      popularity: entry.popularity || 0,
      voteAverage: entry.vote_average || 0,
      tmdbUrl: `https://www.themoviedb.org/movie/${entry.id}`,
    });
  });

  missingFromArchive.sort((left, right) => {
    if ((left.year || 0) !== (right.year || 0)) {
      return (left.year || 0) - (right.year || 0);
    }

    return left.title.localeCompare(right.title);
  });

  const report = {
    generatedAt: new Date().toISOString(),
    keywordId,
    keywordQuery: args.keywordQuery,
    maxPages: args.maxPages,
    totals: {
      localArchiveCount: movies.length,
      tmdbKeywordCount: tmdbMovies.length,
      matchedByTmdbId: matchedByTmdbId.length,
      matchedByTitleYear: matchedByTitleYear.length,
      missingFromArchive: missingFromArchive.length,
    },
    missingFromArchive,
    matchedByTmdbId,
    matchedByTitleYear,
  };

  console.log(`TMDB keyword ${keywordId} returned ${tmdbMovies.length} candidate titles.`);
  console.log(`Matched by TMDB id: ${matchedByTmdbId.length}`);
  console.log(`Matched by title/year: ${matchedByTitleYear.length}`);
  console.log(`Missing from archive: ${missingFromArchive.length}`);

  if (missingFromArchive.length > 0) {
    console.log("\nFirst missing candidates:");
    missingFromArchive.slice(0, 15).forEach((entry) => {
      console.log(`- ${entry.title}${entry.year ? ` (${entry.year})` : ""} [TMDB ${entry.tmdbId}]`);
    });
  }

  if (!args.dryRun) {
    const csvReportPath = getCsvReportPath(args.reportPath);
    await fs.mkdir(path.dirname(args.reportPath), { recursive: true });
    await fs.writeFile(args.reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    await fs.writeFile(csvReportPath, `${buildMissingCsv(missingFromArchive)}\n`, "utf8");
    console.log(`\nJSON report written to ${args.reportPath}`);
    console.log(`CSV shortlist written to ${csvReportPath}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
