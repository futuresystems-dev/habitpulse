export function getDaysSince(date: string | null): number {
  if (!date) return Infinity;
  
  const logDate = new Date(date);
  const today = new Date();
  
  logDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}
