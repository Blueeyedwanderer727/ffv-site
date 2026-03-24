import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function WitchcraftPage() {
  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("witchcraft")
  );

  return <CategoryCollectionPage title={categoryLabels["witchcraft"]} description="Curses, folklore, rituals, and dark magic captured on camera." movies={categoryMovies} />;
}