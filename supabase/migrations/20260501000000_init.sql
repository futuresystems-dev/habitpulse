-- HabitPulse Schema: profiles, habits, habit_logs
-- Applied via Supabase MCP. This file is kept for Git history.
-- See architecture-spec.md for full schema documentation.

-- Enums
CREATE TYPE public.user_tier AS ENUM ('free', 'pro');
CREATE TYPE public.habit_frequency AS ENUM ('daily');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  tier public.user_tier NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits
CREATE TABLE public.habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  icon text NOT NULL DEFAULT '❤️',
  frequency public.habit_frequency NOT NULL DEFAULT 'daily',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit Logs
CREATE TABLE public.habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (habit_id, log_date),
  CHECK (log_date <= CURRENT_DATE)
);
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own habit logs" ON public.habit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can create own habit logs" ON public.habit_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can update own habit logs" ON public.habit_logs FOR UPDATE USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can delete own habit logs" ON public.habit_logs FOR DELETE USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));

-- Indexes
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX idx_habit_logs_habit_date ON public.habit_logs(habit_id, log_date);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER habit_logs_updated_at BEFORE UPDATE ON public.habit_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
