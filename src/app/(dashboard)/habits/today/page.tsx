"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HabitCard } from "@/components/HabitCard";

interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
}

export default function TodayPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Set<string>>(new Set());

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch habits
      const habitsRes = await fetch("/api/habits");
      if (!habitsRes.ok) {
        throw new Error("Failed to fetch habits");
      }
      const habitsJson = await habitsRes.json();
      const habitsData: Habit[] = habitsJson.data || [];
      setHabits(habitsData);

      if (habitsData.length === 0) {
        setLogs([]);
        setStreaks({});
        return;
      }

      // Fetch today's logs and streaks in parallel for each habit
      const [logsResults, streakResults] = await Promise.all([
        // Fetch logs for each habit for today
        Promise.all(
          habitsData.map((h) =>
            fetch(`/api/habit-logs?habit_id=${h.id}&from=${todayStr}&to=${todayStr}`)
              .then((res) => (res.ok ? res.json() : { data: [] }))
              .then((json) => json.data || [])
          )
        ),
        // Fetch streaks for each habit
        Promise.all(
          habitsData.map((h) =>
            fetch(`/api/habits/${h.id}/streaks`)
              .then((res) => (res.ok ? res.json() : { data: { currentStreak: 0, longestStreak: 0, lastCompletedDate: null } }))
              .then((json) => ({ habitId: h.id, streak: json.data }))
          )
        ),
      ]);

      // Flatten logs
      const allLogs: HabitLog[] = logsResults.flat();
      setLogs(allLogs);

      // Build streaks map
      const streaksMap: Record<string, Streak> = {};
      for (const result of streakResults) {
        streaksMap[result.habitId] = {
          current_streak: result.streak?.currentStreak || 0,
          longest_streak: result.streak?.longestStreak || 0,
          last_completed_date: result.streak?.lastCompletedDate || null,
        };
      }
      setStreaks(streaksMap);
    } catch (err) {
      setError("Couldn't load your habits. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckOff = async (habitId: string) => {
    // Optimistic update
    setOptimisticUpdates((prev) => new Set(prev).add(habitId));

    try {
      const response = await fetch("/api/habit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habitId, completed: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to check off habit");
      }

      const result = await response.json();
      const newLog: HabitLog = result.data;

      // Update logs with server response
      setLogs((prev) => {
        const existing = prev.findIndex(
          (l) => l.habit_id === habitId && l.log_date === todayStr
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newLog;
          return updated;
        }
        return [...prev, newLog];
      });

      // Refresh streak for this habit
      const streakRes = await fetch(`/api/habits/${habitId}/streaks`);
      if (streakRes.ok) {
        const streakJson = await streakRes.json();
        const streakData = streakJson.data;
        setStreaks((prev) => ({
          ...prev,
          [habitId]: {
            current_streak: streakData?.currentStreak || 0,
            longest_streak: streakData?.longestStreak || 0,
            last_completed_date: streakData?.lastCompletedDate || null,
          },
        }));
      }
    } catch (err) {
      // Rollback optimistic update on error
      setError("Failed to check off habit. Please try again.");
    } finally {
      setOptimisticUpdates((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const completedCount = logs.filter((l) => l.completed && l.log_date === todayStr).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse mb-4" />
          <div className="h-4 bg-slate-200 rounded-lg w-64 animate-pulse" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded-lg w-32 animate-pulse mb-2" />
                  <div className="h-3 bg-slate-200 rounded-lg w-24 animate-pulse" />
                </div>
              </div>
              <div className="h-11 w-11 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Couldn&apos;t load your habits</h2>
        <p className="text-slate-600 text-center mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="h-11 px-6 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // EMPTY STATE
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 md:py-24">
        <div className="text-5xl mb-6">📝</div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">No habits yet</h2>
        <p className="text-slate-600 text-center mb-8 max-w-sm">
          Create your first habit and start building a streak today.
        </p>
        <Link
          href="/habits"
          className="h-11 px-6 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors inline-flex items-center"
        >
          + Create Habit
        </Link>
      </div>
    );
  }

  // DEFAULT STATE
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{dateStr}</h1>
        <p className="text-sm md:text-base text-slate-600 mt-1">
          {completedCount} of {habits.length} habits completed today
        </p>
      </div>

      {completionRate > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Daily Progress</p>
            <p className="text-sm font-bold text-primary">{completionRate}%</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {habits.map((habit) => {
          const isCompleted = logs.some(
            (l) =>
              l.habit_id === habit.id &&
              l.log_date === todayStr &&
              l.completed
          );
          const isOptimistic = optimisticUpdates.has(habit.id);

          return (
            <HabitCard
              key={habit.id}
              id={habit.id}
              name={habit.name}
              icon={habit.icon}
              streak={streaks[habit.id]?.current_streak || 0}
              isCompleted={isCompleted || isOptimistic}
              onCheckOff={handleCheckOff}
              isLoading={isOptimistic}
            />
          );
        })}
      </div>
    </div>
  );
}
