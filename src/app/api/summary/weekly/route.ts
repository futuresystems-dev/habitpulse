import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, errorCodes } from "@/lib/errors";
import { WeeklySummary } from "@/types/database";
import { NextRequest } from "next/server";

// GET /api/summary/weekly - Get weekly completion stats
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    let weekEndingStr = searchParams.get("week_ending");

    // Default to today if not provided
    let weekEnding = new Date();
    weekEnding.setHours(0, 0, 0, 0);

    if (weekEndingStr) {
      const provided = new Date(weekEndingStr);
      if (!isNaN(provided.getTime())) {
        provided.setHours(0, 0, 0, 0);
        weekEnding = provided;
      }
    }

    // Calculate week start (7 days before week_ending)
    const weekStart = new Date(weekEnding);
    weekStart.setDate(weekStart.getDate() - 6);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndingStr_fmt = weekEnding.toISOString().split("T")[0];

    // Get user's habits
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true);

    if (habitsError) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to fetch habits"
      );
    }

    if (!habits || habits.length === 0) {
      const emptySummary: WeeklySummary = {
        week_ending: weekEndingStr_fmt,
        habits: [],
        overall_completion_rate: 0,
      };
      return apiSuccess(emptySummary);
    }

    // Get logs for the week
    const { data: logs, error: logsError } = await supabase
      .from("habit_logs")
      .select("habit_id, log_date, completed")
      .in(
        "habit_id",
        habits.map((h) => h.id)
      )
      .gte("log_date", weekStartStr)
      .lte("log_date", weekEndingStr_fmt);

    if (logsError) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to fetch logs"
      );
    }

    // Calculate stats per habit
    const habitStats = habits.map((habit) => {
      const habitLogs = (logs || []).filter((log) => log.habit_id === habit.id);

      // Count days in week (7 days max)
      const daysInWeek = 7;
      const completedDays = habitLogs.filter((log) => log.completed).length;
      const completionRate = daysInWeek > 0 ? completedDays / daysInWeek : 0;

      return {
        habit_id: habit.id,
        name: habit.name,
        days_completed: completedDays,
        completion_rate: parseFloat(completionRate.toFixed(2)),
      };
    });

    // Calculate overall completion rate
    const totalPossible = habits.length * 7; // 7 days per habit
    const totalCompleted = habitStats.reduce(
      (sum, h) => sum + h.days_completed,
      0
    );
    const overallRate =
      totalPossible > 0
        ? parseFloat((totalCompleted / totalPossible).toFixed(2))
        : 0;

    const summary: WeeklySummary = {
      week_ending: weekEndingStr_fmt,
      habits: habitStats,
      overall_completion_rate: overallRate,
    };

    return apiSuccess(summary);
  } catch (err) {
    console.error("GET /api/summary/weekly error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}
