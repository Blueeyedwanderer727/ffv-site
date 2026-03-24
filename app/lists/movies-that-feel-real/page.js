import { ListCollectionPage } from "../../components/CollectionPage";
import { listLabels } from "../../data/labels";
import { getMoviesForList } from "../../data/listRankings";

export default function MoviesThatFeelRealPage() {
  const listKey = "movies-that-feel-real";

  const listMovies = getMoviesForList(listKey);

  return <ListCollectionPage title={listLabels[listKey]} description="The realism-heavy route for movies that feel like bad evidence rather than polished fiction." movies={listMovies} />;
}