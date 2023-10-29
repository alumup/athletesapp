import Video from "./video";

export default interface Collection {
  id: string;
  name: string;
  account_id: string;
  created_at: string;
  media: Video[];
  poster: string;
}
