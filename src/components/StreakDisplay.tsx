interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  compact?: boolean;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastCompletedDate,
  compact = false,
}: StreakDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{currentStreak}</p>
          <p className="text-xs text-slate-600 font-medium">Current</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-600">{longestStreak}</p>
          <p className="text-xs text-slate-600 font-medium">Best</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{currentStreak}</p>
          <p className="text-sm text-slate-600 font-medium mt-1">Current Streak</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-600">{longestStreak}</p>
          <p className="text-sm text-slate-600 font-medium mt-1">Best Streak</p>
        </div>
      </div>
      {lastCompletedDate && (
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Last completed: <span className="font-semibold text-slate-900">{lastCompletedDate}</span>
          </p>
        </div>
      )}
    </div>
  );
}
