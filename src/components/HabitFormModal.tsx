"use client";

import { useState } from "react";

interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, icon: string) => Promise<void>;
  initialHabit?: Habit | null;
}

const ICON_OPTIONS = ["🏃", "📚", "💪", "💻", "🧘", "📖", "🎨", "🏋️", "🚴", "🤸", "⏰", "❤️"];

export function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialHabit,
}: HabitFormModalProps) {
  const [name, setName] = useState(initialHabit?.name || "");
  const [icon, setIcon] = useState(initialHabit?.icon || "🏃");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Habit name is required.");
      return;
    }

    if (name.length > 100) {
      setError("Habit name must be 100 characters or fewer.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(name, icon);
      setName("");
      setIcon("🏃");
    } catch (err) {
      setError("Failed to save habit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">
          {initialHabit ? "Edit Habit" : "Create New Habit"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
              Habit name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Exercise"
              maxLength={100}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 placeholder-slate-500 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 font-medium mt-2">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Pick an icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIcon(opt)}
                  disabled={isLoading}
                  className={`h-12 rounded-lg text-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    icon === opt
                      ? "bg-primary text-white ring-2 ring-primary ring-offset-2"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-lg border border-slate-300 text-slate-900 font-semibold text-base hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 h-11 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
              )}
              {isLoading ? "Saving..." : initialHabit ? "Save Habit" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
