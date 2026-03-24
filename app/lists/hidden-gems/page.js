import { ListCollectionPage } from "../../components/CollectionPage";
import { listLabels } from "../../data/labels";
import { getMoviesForList } from "../../data/listRankings";

export default function HiddenGemsPage() {
  const listKey = "hidden-gems";

  const listMovies = getMoviesForList(listKey);

  return <ListCollectionPage title={listLabels[listKey]} description="Deeper-cut recommendations that still earn their place in the archive." movies={listMovies} />;
}