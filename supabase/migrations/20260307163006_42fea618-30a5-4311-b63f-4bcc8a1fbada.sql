
-- Habits table
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habit completions (one row per habit per day)
CREATE TABLE public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (habit_id, completed_date)
);

-- RLS for habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own habits" ON public.habits
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS for habit_completions
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own completions" ON public.habit_completions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate streak for a habit
CREATE OR REPLACE FUNCTION public.get_habit_streak(p_habit_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE dates AS (
    SELECT CURRENT_DATE AS d
    UNION ALL
    SELECT d - 1 FROM dates
    WHERE EXISTS (
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id AND completed_date = d - 1
    )
  )
  SELECT CAST(COUNT(*) - 1 AS INTEGER) +
    CASE WHEN EXISTS (
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id AND completed_date = CURRENT_DATE
    ) THEN 0 ELSE -1 END
  FROM dates
  HAVING CAST(COUNT(*) - 1 AS INTEGER) +
    CASE WHEN EXISTS (
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id AND completed_date = CURRENT_DATE
    ) THEN 0 ELSE -1 END >= 0;
$$;
