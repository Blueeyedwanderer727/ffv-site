import { ListCollectionPage } from "../../components/CollectionPage";
import { listLabels } from "../../data/labels";
import { getMoviesForList } from "../../data/listRankings";

export default function BeginnerFriendlyPage() {
  const listKey = "beginner-friendly";

  const listMovies = getMoviesForList(listKey);

  return <ListCollectionPage title={listLabels[listKey]} description="The safest high-value entry points for viewers who want the genre to click before it gets punishing." movies={listMovies} />;
}