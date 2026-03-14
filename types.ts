export interface User {
  username: string;
  email: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  archived: boolean;
  timestamp: number;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  user: User | null;
  notes: Note[];
  theme: Theme;
}