export interface Tab {
  id: string;
  user_id: string;
  topic: string;
  last_refreshed_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}
