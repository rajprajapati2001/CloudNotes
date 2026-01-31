-- Create the notes table
CREATE TABLE public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  color TEXT DEFAULT 'bg-white',
  pinned BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  note_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can create their own notes" ON public.notes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes" ON public.notes 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.notes 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.notes 
  FOR DELETE USING (auth.uid() = user_id);