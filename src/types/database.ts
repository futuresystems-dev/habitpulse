export type UserTier = "free" | "pro";
export type HabitFrequency = "daily";

export interface Profile {
  id: string;
  email: string;
  tier: UserTier;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  frequency: HabitFrequency;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
}

export interface WeeklySummaryHabit {
  habit_id: string;
  name: string;
  days_completed: number;
  completion_rate: number;
}

export interface WeeklySummary {
  week_ending: string;
  habits: WeeklySummaryHabit[];
  overall_completion_rate: number;
}
