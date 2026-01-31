
export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  archived: boolean;
  note_order: number;
  created_at?: string;
  updated_at?: string;
}
