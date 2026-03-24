import { ListCollectionPage } from "../../components/CollectionPage";
import { listLabels } from "../../data/labels";
import { getMoviesForList } from "../../data/listRankings";

export default function Top25MostRecommendedPage() {
  const listKey = "top-25-most-recommended";

  const listMovies = getMoviesForList(listKey);

  return <ListCollectionPage title={listLabels[listKey]} description="The core canon route: the strongest overall recommendations currently stored in the vault." movies={listMovies} />;
}