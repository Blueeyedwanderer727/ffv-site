import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function PossessionPage() {
  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("possession")
  );

  return <CategoryCollectionPage title={categoryLabels["possession"]} description="Demonic influence, exorcisms, hauntings, and escalating supernatural terror." movies={categoryMovies} />;
}