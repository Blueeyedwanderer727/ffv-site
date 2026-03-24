import { ListCollectionPage } from "../../components/CollectionPage";
import { listLabels } from "../../data/labels";
import { getMoviesForList } from "../../data/listRankings";

export default function MostDisturbingPage() {
  const listKey = "most-disturbing";

  const listMovies = getMoviesForList(listKey);

  return <ListCollectionPage title={listLabels[listKey]} description="The meanest, ugliest, most upsetting titles currently logged in the vault." movies={listMovies} />;
}