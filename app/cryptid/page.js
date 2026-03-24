import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function CryptidPage() {
  const categoryKey = "cryptid";

  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
  );

  return <CategoryCollectionPage title={categoryLabels[categoryKey]} description="Creature sightings, wilderness evidence, and cryptid hunts captured on doomed cameras." movies={categoryMovies} />;
}