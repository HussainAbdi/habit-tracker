import type { CompletedDate } from "./types";

// =============================================================================
// Habit API
// =============================================================================

const API_BASE = "/api/habit";

/**
 * Fetch all completed habits from the server
 */
export const fetchHabits = async (): Promise<CompletedDate[]> => {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json() as { completedDates: CompletedDate[] };
    return data.completedDates;
  } catch (err) {
    console.error("Failed to fetch habits", err);
    return [];
  }
};

/**
 * Sync a habit entry to the server
 */
export const syncHabit = async (
  date: string,
  completed: boolean,
  value?: string,
  notes?: string
): Promise<boolean> => {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, completed, value, notes })
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to sync habit", err);
    return false;
  }
};
