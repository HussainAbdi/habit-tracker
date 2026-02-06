import type { AllHabitCompletedDates } from "./types";
import { HabitName } from "./constants";

// =============================================================================
// Habit API
// =============================================================================

const API_BASE = "/api/habit";

/**
 * Fetch all completed habits from the server
 */
export const fetchHabits = async (): Promise<AllHabitCompletedDates> => {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json() as { allHabitCompletedDates: AllHabitCompletedDates };
    return data.allHabitCompletedDates;
  } catch (err) {
    console.error("Failed to fetch habits", err);
    return { Software: [], Music: [], Gym: [] } as AllHabitCompletedDates;
  }
};

/**
 * Sync a habit entry to the server
 */
export const syncHabit = async (
  habitName: HabitName,
  date: string,
  completed: boolean,
  value?: string,
  notes?: string
): Promise<boolean> => {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitName, date, completed, value, notes })
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync habit", err);
    return false;
  }
};
