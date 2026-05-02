import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, errorCodes } from "@/lib/errors";
import { StreakInfo } from "@/types/database";
import { NextRequest } from "next/server";

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + "T00:00:00Z");
  const b = new Date(dateB + "T00:00:00Z");
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function todayUTC(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

function calculateStreaks(
  logs: Array<{ log_date: string; completed: boolean }>
): { currentStreak: number; longestStreak: number; lastCompletedDate: string | null } {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  // Build a Set of completed dates for O(1) lookup
  const completedDates = new Set<string>();
  let lastCompletedDate: string | null = null;

  for (const log of logs) {
    if (log.completed) {
      completedDates.add(log.log_date);
      if (!lastCompletedDate || log.log_date > lastCompletedDate) {
        lastCompletedDate = log.log_date;
      }
    }
  }

  if (completedDates.size === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  // Sort all completed dates ascending
  const sortedDates = Array.from(completedDates).sort();

  // Calculate longest streak by walking sorted completed dates
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const gap = daysBetween(sortedDates[i], sortedDates[i - 1]);
    if (gap === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak: walk backward from today (or yesterday)
  const today = todayUTC();
  let currentStreak = 0;

  // Start from today; if today isn't completed, try yesterday
  let startDate = today;
  if (!completedDates.has(startDate)) {
    // Check yesterday
    const yesterday = new Date(today + "T00:00:00Z");
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    startDate = yesterday.toISOString().split("T")[0];
    if (!completedDates.has(startDate)) {
      // No current streak
      return { currentStreak: 0, longestStreak, lastCompletedDate };
    }
  }

  // Walk backward day by day from startDate
  let checkDate = new Date(startDate + "T00:00:00Z");
  while (completedDates.has(checkDate.toISOString().split("T")[0])) {
    currentStreak++;
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  // Update longest if current streak is the longest
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak, lastCompletedDate };
}

// GET /api/habits/[id]/streaks - Calculate streaks for a habit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return apiError(401, errorCodes.UNAUTHORIZED, "Unauthorized");
    }

    const { id } = await params;

    // Verify ownership
    const { data: habit, error: habitError } = await supabase
      .from("habits")
      .select("user_id")
      .eq("id", id)
      .single();

    if (habitError || !habit) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    if (habit.user_id !== user.id) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    // Fetch all logs for this habit
    const { data: logs, error: logsError } = await supabase
      .from("habit_logs")
      .select("log_date, completed")
      .eq("habit_id", id)
      .order("log_date", { ascending: false });

    if (logsError) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to fetch habit logs"
      );
    }

    const { currentStreak, longestStreak, lastCompletedDate } =
      calculateStreaks(logs || []);

    const response: StreakInfo = {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completed_date: lastCompletedDate,
    };

    return apiSuccess(response);
  } catch (err) {
    console.error("GET /api/habits/[id]/streaks error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}
