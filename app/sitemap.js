import { movies } from "./data/movies";
import { siteUrl } from "./data/site";

const staticRoutes = [
  "",
  "/search",
  "/categories",
  "/lists",
  "/guides",
  "/fear-experiment",
  "/fear-experiment/quiz",
  "/quiz",
  "/alien",
  "/anthology",
  "/cryptid",
  "/cult-conspiracy",
  "/haunted-location",
  "/monster",
  "/possession",
  "/psychological",
  "/screenlife",
  "/serial-killer",
  "/witchcraft",
  "/zombie-infection",
  "/lists/scariest",
  "/lists/most-disturbing",
  "/lists/top-25-most-recommended",
  "/lists/movies-that-feel-real",
  "/lists/beginner-friendly",
  "/lists/hidden-gems",
];

export default function sitemap() {
  const now = new Date();
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/search" || route === "/fear-experiment" ? 0.9 : 0.8,
  }));

  const movieEntries = movies.map((movie) => ({
    url: `${siteUrl}/movie/${movie.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...movieEntries];
}