import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, errorCodes } from "@/lib/errors";
import { Habit } from "@/types/database";
import { NextRequest } from "next/server";

interface CreateHabitRequest {
  name: string;
  icon: string;
}

// POST /api/habits - Create a new habit
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
    const { name, icon } = body as CreateHabitRequest;

    // Validate input
    if (!name || typeof name !== "string") {
      return apiError(
        400,
        errorCodes.INVALID_INPUT,
        "Habit name is required"
      );
    }

    if (name.length > 100) {
      return apiError(
        400,
        errorCodes.INVALID_INPUT,
        "Habit name must be 100 characters or less"
      );
    }

    if (!icon || typeof icon !== "string" || icon.length > 20) {
      return apiError(
        400,
        errorCodes.INVALID_INPUT,
        "Habit icon is required and must be 20 characters or less"
      );
    }

    // Get user's tier (auto-create profile if trigger missed)
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile row missing — trigger may have failed silently. Auto-create it.
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id, email: user.email ?? "" })
        .select("tier")
        .single();

      if (insertError) {
        console.error("Failed to auto-create profile:", insertError);
        return apiError(
          500,
          errorCodes.INTERNAL_ERROR,
          "Failed to create user profile"
        );
      }
      profile = newProfile;
    } else if (profileError) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to fetch user profile"
      );
    }

    // Check free tier limit
    if (profile.tier === "free") {
      const { data: habits, error: countError } = await supabase
        .from("habits")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("active", true);

      if (countError) {
        return apiError(
          500,
          errorCodes.INTERNAL_ERROR,
          "Failed to count habits"
        );
      }

      if (habits && habits.length >= 3) {
        return apiError(
          409,
          errorCodes.FREE_TIER_LIMIT,
          "Free tier limited to 3 active habits"
        );
      }
    }

    // Create habit
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name,
        icon,
        frequency: "daily",
        active: true,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return apiError(
          409,
          errorCodes.CONFLICT,
          `You already have a habit called "${name}"`
        );
      }
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to create habit"
      );
    }

    return apiSuccess(data as Habit, 201);
  } catch (err) {
    console.error("POST /api/habits error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}

// GET /api/habits - List active habits for the user
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
    const includeArchived = searchParams.get("include_archived") === "true";

    let query = supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!includeArchived) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;

    if (error) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to fetch habits"
      );
    }

    return apiSuccess(data as Habit[]);
  } catch (err) {
    console.error("GET /api/habits error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}
