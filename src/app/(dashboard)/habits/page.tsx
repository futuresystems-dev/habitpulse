"use client";

import { useState, useEffect, useCallback } from "react";
import { HabitCard } from "@/components/HabitCard";
import { HabitFormModal } from "@/components/HabitFormModal";

interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/habits");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch habits");
      }
      const json = await response.json();
      setHabits(json.data || []);
    } catch (err) {
      setError("Couldn't load your habits. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleCreateOrUpdate = async (name: string, icon: string) => {
    try {
      if (editingHabit) {
        const response = await fetch(`/api/habits/${editingHabit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, icon }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to update habit");
        }

        const json = await response.json();
        const updatedHabit: Habit = json.data;
        setHabits((prev) =>
          prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
        );
      } else {
        const response = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, icon }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const message = errorData.error?.message || "Failed to create habit";
          // Surface specific errors to the user
          setError(message);
          throw new Error(message);
        }

        const json = await response.json();
        const newHabit: Habit = json.data;
        setHabits((prev) => [newHabit, ...prev]);
      }

      setShowModal(false);
      setEditingHabit(null);
    } catch (err) {
      if (!error) {
        setError("Failed to save habit. Please try again.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to delete habit");
      }

      setHabits((prev) => prev.filter((h) => h.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete habit. Please try again.");
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowModal(true);
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="h-8 bg-slate-200 rounded-lg w-32 animate-pulse" />
          <div className="h-11 bg-slate-200 rounded-lg w-40 animate-pulse" />
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
              <div className="flex gap-2">
                <div className="h-10 bg-slate-200 rounded-lg w-16 animate-pulse" />
                <div className="h-10 bg-slate-200 rounded-lg w-16 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error && habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Couldn&apos;t load your habits</h2>
        <p className="text-slate-600 text-center mb-6">{error}</p>
        <button
          onClick={fetchHabits}
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
          You haven&apos;t created any habits. Get started below.
        </p>
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowModal(true);
          }}
          className="h-11 px-6 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors inline-flex items-center"
        >
          + Create Habit
        </button>

        <HabitFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingHabit(null);
          }}
          onSubmit={handleCreateOrUpdate}
          initialHabit={editingHabit}
        />
      </div>
    );
  }

  // DEFAULT STATE
  return (
    <div className="space-y-6">
      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-500 underline mt-1">Dismiss</button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Your Habits</h1>
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowModal(true);
          }}
          className="h-11 px-4 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          + Create Habit
        </button>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => (
          <div key={habit.id} className="relative">
            <HabitCard
              id={habit.id}
              name={habit.name}
              icon={habit.icon}
              showActions={true}
              onEdit={() => handleEdit(habit)}
              onDelete={() => setDeleteConfirm(habit.id)}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirm === habit.id && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="card max-w-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    Delete &apos;{habit.name}&apos;?
                  </h2>
                  <p className="text-slate-600 text-sm mb-6">
                    This cannot be undone. All logs for this habit will be deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 h-10 rounded-lg border border-slate-300 text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="flex-1 h-10 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <HabitFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHabit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialHabit={editingHabit}
      />
    </div>
  );
}
