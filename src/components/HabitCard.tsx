interface HabitCardProps {
  id?: string;
  name: string;
  icon: string;
  streak?: number;
  isCompleted?: boolean;
  onCheckOff?: (id: string) => void;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function HabitCard({
  id,
  name,
  icon,
  streak = 0,
  isCompleted = false,
  onCheckOff,
  isLoading = false,
  onEdit,
  onDelete,
  showActions = false,
}: HabitCardProps) {
  const handleCheckOff = () => {
    if (id && onCheckOff && !isLoading) {
      onCheckOff(id);
    }
  };

  return (
    <div className={`card flex items-center justify-between gap-4 md:gap-6 ${isCompleted ? "bg-slate-50" : ""}`}>
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div className="text-3xl md:text-4xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base md:text-lg font-semibold truncate ${isCompleted ? "text-slate-500 line-through" : "text-slate-900"}`}>
            {name}
          </h3>
          {streak !== undefined && (
            <p className={`text-xs md:text-sm font-medium ${isCompleted ? "text-slate-400" : "text-primary"}`}>
              {streak === 0 ? "No streak yet" : `${streak} day${streak === 1 ? "" : "s"}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {!showActions ? (
          <button
            onClick={handleCheckOff}
            disabled={isLoading}
            className={`h-11 w-11 rounded-lg flex items-center justify-center font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
              isCompleted
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
            ) : isCompleted ? (
              "✓"
            ) : (
              "✓"
            )}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-2 text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 text-xs md:text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
