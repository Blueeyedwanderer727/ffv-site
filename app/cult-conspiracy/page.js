import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function CultConspiracyPage() {
  const categoryKey = "cult-conspiracy";

  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes(categoryKey)
  );

  return <CategoryCollectionPage title={categoryLabels[categoryKey]} description="Cults, conspiracies, and investigation files that uncover the exact wrong truth." movies={categoryMovies} />;
}