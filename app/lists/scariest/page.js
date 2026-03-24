import { ListCollectionPage } from "../../components/CollectionPage";
import { listLabels } from "../../data/labels";
import { getMoviesForList } from "../../data/listRankings";

export default function ScariestPage() {
  const listKey = "scariest";

  const listMovies = getMoviesForList(listKey);

  return <ListCollectionPage title={listLabels[listKey]} description="The hardest-hitting fear index route for nights when you want the archive to stop being polite." movies={listMovies} />;
}