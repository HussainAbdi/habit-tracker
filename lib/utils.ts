import { CLICKABLE_START_DATE, DAY_NAMES, MONTH_NAMES } from "./constants";
import type { MonthData } from "./types";

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format date components into YYYY-MM-DD string
 */
export const formatDateString = (year: number, month: number, day: number): string => {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

/**
 * Format date string for display (e.g., "Monday, Jan 15, 2025")
 */
export const formatDateHeader = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[month - 1]} ${day}, ${year}`;
};

/**
 * Get the day offset for the first day of a month (Monday = 0, Sunday = 6)
 */
export const getFirstDayOffset = (month: number, year: number): number => {
  const dayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  // Convert from Sunday-first (0-6) to Monday-first (0-6)
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
};

/**
 * Get the number of days in a month
 */
export const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Generate calendar grid cells: padding zeros + day numbers
 */
export const getCalendarCells = (offset: number, daysInMonth: number): number[] => {
  return [
    ...Array(offset).fill(0),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
};

/**
 * Get all months from start date to current month
 */
export const getMonthsToDisplay = (): MonthData[] => {
  const [startYear, startMonth] = CLICKABLE_START_DATE.split("-").map(Number);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const months: MonthData[] = [];
  let year = startYear;
  let month = startMonth - 1; // Convert to 0-indexed

  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
    months.push({ monthIndex: month, year });
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months;
};

// =============================================================================
// Value Parsing
// =============================================================================

/**
 * Parse existing value string to extract time and unit
 * Handles formats like "y - 30 mins", "30 mins", "2 hours"
 */
export const parseTimeValue = (value: string): { timeValue: string; timeUnit: "mins" | "hours" } => {
  const hoursMatch = value.match(/(\d+)\s*hours?/i);
  if (hoursMatch) {
    return { timeValue: hoursMatch[1], timeUnit: "hours" };
  }

  const minsMatch = value.match(/(\d+)\s*mins?/i);
  if (minsMatch) {
    return { timeValue: minsMatch[1], timeUnit: "mins" };
  }

  return { timeValue: "", timeUnit: "mins" };
};

/**
 * Build value string from time value and unit
 */
export const buildValueString = (timeValue: string, timeUnit: "mins" | "hours"): string => {
  if (timeValue && timeValue !== "0") {
    return `y - ${timeValue} ${timeUnit}`;
  }
  return "y";
};

// =============================================================================
// Haptic Feedback
// =============================================================================

/**
 * Trigger haptic feedback
 * - Android: Uses Vibration API
 * - iOS 18+: Uses switch input workaround
 */
export const triggerHaptic = (): void => {
  if (navigator.vibrate) {
    navigator.vibrate(50);
    return;
  }

  // iOS 18+ workaround: clicking a label for a switch input triggers haptic
  const label = document.getElementById("haptic-label");
  if (label) {
    label.click();
  }
};
