import { movies } from "../data/movies";
import categoryLabels from "../data/categoryLabels";
import { CategoryCollectionPage } from "../components/CollectionPage";

export default function ScreenlifePage() {
  const categoryMovies = movies.filter((movie) =>
    Array.isArray(movie.categories) && movie.categories.includes("screenlife")
  );

  return <CategoryCollectionPage title={categoryLabels["screenlife"]} description="Video calls, desktops, internet horror, and stories that unfold entirely through screens." movies={categoryMovies} />;
}