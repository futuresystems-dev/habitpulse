import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, errorCodes } from "@/lib/errors";
import { HabitLog } from "@/types/database";
import { NextRequest } from "next/server";

interface CreateHabitLogRequest {
  habit_id: string;
  completed: boolean;
  log_date?: string;
}

// POST /api/habit-logs - Log habit completion (idempotent upsert)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { habit_id, completed, log_date } = body as CreateHabitLogRequest;

    // Validate input
    if (!habit_id || typeof habit_id !== "string") {
      return apiError(
        400,
        errorCodes.INVALID_INPUT,
        "Habit ID is required"
      );
    }

    if (typeof completed !== "boolean") {
      return apiError(
        400,
        errorCodes.INVALID_INPUT,
        "Completed must be a boolean"
      );
    }

    // Default to today if log_date not provided
    let dateToLog = new Date();
    dateToLog.setHours(0, 0, 0, 0);

    if (log_date) {
      // Validate date format and check if it's in the past
      const logDateObj = new Date(log_date);
      if (isNaN(logDateObj.getTime())) {
        return apiError(
          400,
          errorCodes.INVALID_INPUT,
          "Invalid date format"
        );
      }

      logDateObj.setHours(0, 0, 0, 0);
      if (logDateObj.getTime() > dateToLog.getTime()) {
        return apiError(
          400,
          errorCodes.INVALID_INPUT,
          "Log date cannot be in the future"
        );
      }

      dateToLog = logDateObj;
    }

    const dateString = dateToLog.toISOString().split("T")[0];

    // Verify habit ownership
    const { data: habit, error: habitError } = await supabase
      .from("habits")
      .select("user_id")
      .eq("id", habit_id)
      .single();

    if (habitError || !habit) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    if (habit.user_id !== user.id) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    // Upsert log (idempotent - overwrites if exists)
    const { data, error } = await supabase
      .from("habit_logs")
      .upsert(
        {
          habit_id,
          log_date: dateString,
          completed,
        },
        {
          onConflict: "habit_id,log_date",
        }
      )
      .select()
      .single();

    if (error) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to create/update log"
      );
    }

    return apiSuccess(data as HabitLog, 201);
  } catch (err) {
    console.error("POST /api/habit-logs error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}

// GET /api/habit-logs - Query habit logs by date range
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
    const habitId = searchParams.get("habit_id");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Validate habit_id
    if (!habitId || typeof habitId !== "string") {
      return apiError(
        400,
        errorCodes.INVALID_INPUT,
        "Habit ID is required"
      );
    }

    // Verify habit ownership
    const { data: habit, error: habitError } = await supabase
      .from("habits")
      .select("user_id")
      .eq("id", habitId)
      .single();

    if (habitError || !habit) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    if (habit.user_id !== user.id) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    // Set default date range (last 30 days)
    let toDate = new Date();
    toDate.setHours(0, 0, 0, 0);
    const toDateString = toDate.toISOString().split("T")[0];

    let fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    fromDate.setHours(0, 0, 0, 0);
    let fromDateString = fromDate.toISOString().split("T")[0];

    // Override with query params if provided
    if (from) {
      const fromObj = new Date(from);
      if (!isNaN(fromObj.getTime())) {
        fromObj.setHours(0, 0, 0, 0);
        fromDateString = fromObj.toISOString().split("T")[0];
      }
    }

    if (to) {
      const toObj = new Date(to);
      if (!isNaN(toObj.getTime())) {
        toObj.setHours(0, 0, 0, 0);
        // Use the provided date
        toDate = toObj;
      }
    }

    // Fetch logs
    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habitId)
      .gte("log_date", fromDateString)
      .lte("log_date", toDateString)
      .order("log_date", { ascending: false });

    if (error) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to fetch logs"
      );
    }

    return apiSuccess(data as HabitLog[]);
  } catch (err) {
    console.error("GET /api/habit-logs error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}
