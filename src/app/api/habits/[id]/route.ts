import { createClient } from "@/lib/supabase/server";
import { apiError, apiSuccess, errorCodes } from "@/lib/errors";
import { Habit } from "@/types/database";
import { NextRequest } from "next/server";

interface UpdateHabitRequest {
  name?: string;
  icon?: string;
  active?: boolean;
}

// PATCH /api/habits/[id] - Edit a habit
export async function PATCH(
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
    const body = await request.json();
    const { name, icon, active } = body as UpdateHabitRequest;

    // Verify ownership
    const { data: habit, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !habit) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    if (habit.user_id !== user.id) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    // Validate input
    if (name !== undefined) {
      if (typeof name !== "string" || name.length === 0) {
        return apiError(
          400,
          errorCodes.INVALID_INPUT,
          "Habit name must be a non-empty string"
        );
      }
      if (name.length > 100) {
        return apiError(
          400,
          errorCodes.INVALID_INPUT,
          "Habit name must be 100 characters or less"
        );
      }
    }

    if (icon !== undefined) {
      if (typeof icon !== "string" || icon.length === 0) {
        return apiError(
          400,
          errorCodes.INVALID_INPUT,
          "Habit icon must be a non-empty string"
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (active !== undefined) updateData.active = active;

    // Update habit
    const { data: updated, error: updateError } = await supabase
      .from("habits")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      // Handle unique constraint violation
      if (updateError.code === "23505") {
        return apiError(
          409,
          errorCodes.CONFLICT,
          `You already have a habit called "${name}"`
        );
      }
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to update habit"
      );
    }

    return apiSuccess(updated as Habit);
  } catch (err) {
    console.error("PATCH /api/habits/[id] error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}

// DELETE /api/habits/[id] - Delete a habit
export async function DELETE(
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
    const { data: habit, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !habit) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    if (habit.user_id !== user.id) {
      return apiError(404, errorCodes.NOT_FOUND, "Habit not found");
    }

    // Delete habit (cascades to habit_logs)
    const { error: deleteError } = await supabase
      .from("habits")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return apiError(
        500,
        errorCodes.INTERNAL_ERROR,
        "Failed to delete habit"
      );
    }

    return apiSuccess({ success: true });
  } catch (err) {
    console.error("DELETE /api/habits/[id] error:", err);
    return apiError(
      500,
      errorCodes.INTERNAL_ERROR,
      "Internal server error"
    );
  }
}
