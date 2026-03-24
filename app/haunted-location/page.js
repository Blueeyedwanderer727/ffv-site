import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function HauntedLocationPage() {
  const categoryKey = "haunted-location";

  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
  );

  return <CategoryCollectionPage title={categoryLabels[categoryKey]} description="Haunted buildings, cursed spaces, and location-driven recovered tape nightmares." movies={categoryMovies} />;
}