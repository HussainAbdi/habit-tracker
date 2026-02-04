// =============================================================================
// Shared Types
// =============================================================================

export type CompletedDate = {
  date: string;
  value: string;
  notes: string;
};

export type HabitEntry = CompletedDate;

export type MonthData = {
  monthIndex: number; // 0-11
  year: number;
};

export type TimeUnit = "mins" | "hours";
