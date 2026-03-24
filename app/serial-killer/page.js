import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function SerialKillerPage() {
  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("serial-killer")
  );

  return <CategoryCollectionPage title={categoryLabels["serial-killer"]} description="Murder tapes, stalkers, killers, and footage that feels disturbingly real." movies={categoryMovies} />;
}