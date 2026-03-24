import { CategoryCollectionPage } from "../components/CollectionPage";
import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";

export default function MonsterPage() {
  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("monster")
  );

  return <CategoryCollectionPage title={categoryLabels["monster"]} description="Giant threats, hidden beasts, and things that should not exist caught on tape." movies={categoryMovies} />;
}