"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HabitSummary {
  habit_id: string;
  name: string;
  days_completed: number;
  completion_rate: number;
}

interface WeeklySummary {
  week_ending: string;
  habits: HabitSummary[];
  overall_completion_rate: number;
}

export default function SummaryPage() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with GET /api/summary/weekly
      // const response = await fetch("/api/summary/weekly");
      // const data = await response.json();

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSummary(null); // No data yet
    } catch (err) {
      setError("Couldn't load your summary. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // DEFAULT STATE
  if (!isLoading && summary && summary.habits.length > 0) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">This Week</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Week ending {new Date(summary.week_ending).toLocaleDateString()}
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary">
              {Math.round(summary.overall_completion_rate * 100)}%
            </p>
            <p className="text-sm md:text-base text-slate-600 font-medium mt-2">Overall Complete</p>
          </div>

          <div className="card text-center">
            <p className="text-3xl md:text-4xl font-bold text-slate-900">
              {summary.habits.length}
            </p>
            <p className="text-sm md:text-base text-slate-600 font-medium mt-2">
              Active Habits
            </p>
          </div>

          <div className="card text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary">
              {summary.habits.filter((h) => h.completion_rate === 1).length}
            </p>
            <p className="text-sm md:text-base text-slate-600 font-medium mt-2">Perfect Days</p>
          </div>
        </div>

        {/* Habit Breakdown Table */}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-semibold text-slate-900">Habit</th>
                {weekDays.map((day) => (
                  <th
                    key={day}
                    className="text-center py-3 px-2 font-semibold text-slate-900 text-xs"
                  >
                    {day.slice(0, 3)}
                  </th>
                ))}
                <th className="text-center py-3 px-2 font-semibold text-slate-900">%</th>
              </tr>
            </thead>
            <tbody>
              {summary.habits.map((habit) => (
                <tr key={habit.habit_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-2 font-semibold text-slate-900 text-left">
                    {habit.name}
                  </td>
                  {weekDays.map((_, idx) => (
                    <td key={idx} className="text-center py-3 px-2">
                      <span className="inline-block h-6 w-6 rounded-md bg-slate-100 text-center text-xs leading-6">
                        ✓
                      </span>
                    </td>
                  ))}
                  <td className="text-center py-3 px-2 font-semibold text-primary">
                    {Math.round(habit.completion_rate * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-slate-200 rounded-lg w-32 animate-pulse mb-2" />
          <div className="h-4 bg-slate-200 rounded-lg w-48 animate-pulse" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-10 bg-slate-200 rounded-lg w-20 mx-auto animate-pulse mb-3" />
              <div className="h-4 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
          Couldn't load your summary
        </h2>
        <p className="text-slate-600 text-center mb-6">{error}</p>
        <button
          onClick={fetchSummary}
          className="h-11 px-6 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // EMPTY STATE
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24">
      <div className="text-5xl mb-6">📊</div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
        No habits logged yet
      </h2>
      <p className="text-slate-600 text-center mb-8 max-w-sm">
        Check off habits on the Today page to see your weekly summary here.
      </p>
      <Link
        href="/habits/today"
        className="h-11 px-6 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors inline-flex items-center"
      >
        Go to Today
      </Link>
    </div>
  );
}
