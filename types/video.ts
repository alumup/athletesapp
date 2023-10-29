export default interface Video {
  id: string;
  name: string;
  url: string;
  account_id: string;
  created_at: string;
  mimetype: string;
  mux_asset_id?: string;
  mux_playback_id: string;
  storage_id?: string;
  duration?: number;
  description?: string;
  thumbnail?: string;
}
