import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function PsychologicalPage() {
  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("psychological")
  );

  return <CategoryCollectionPage title={categoryLabels["psychological"]} description="Slow-burn dread, uncertainty, paranoia, and stories that get under your skin." movies={categoryMovies} />;
}