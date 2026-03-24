import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function AlienPage() {
  const categoryKey = "alien";
  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
  );

  return <CategoryCollectionPage title={categoryLabels[categoryKey]} description="Recovered alien-contact and extraterrestrial incident footage from the vault." movies={categoryMovies} />;
}