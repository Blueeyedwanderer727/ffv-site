import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function ZombieInfectionPage() {
  const categoryKey = "zombie-infection";

  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
  );

  return <CategoryCollectionPage title={categoryLabels[categoryKey]} description="Infection outbreaks, viral panic, and flesh-fallout footage from the vault." movies={categoryMovies} />;
}