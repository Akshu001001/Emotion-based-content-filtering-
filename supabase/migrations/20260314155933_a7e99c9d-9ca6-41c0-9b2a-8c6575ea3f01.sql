CREATE TABLE public.content_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  mood_category text NOT NULL DEFAULT 'general',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks"
  ON public.content_bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);