// =============================================================================
// Shared Types
// =============================================================================

import { HabitName } from "./constants";

export type AllHabitCompletedDates = {
  [habitName in HabitName]: {
    date: string;
    value: string;
    notes: string;
  }[];
};

export type HabitEntry = {
  date: string;
  value: string;
  notes: string;
};

export type MonthData = {
  monthIndex: number; // 0-11
  year: number;
};

export type TimeUnit = "mins" | "hours";
