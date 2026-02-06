"use client";

import { useEffect, useRef, useState } from "react";
import {
  CLICKABLE_START_DATE,
  MONTH_NAMES,
  WEEKDAY_LABELS
} from "@/lib/constants";
import {
  formatDateString,
  getCalendarCells,
  getDaysInMonth,
  getFirstDayOffset,
  getMonthsToDisplay,
  getTodayString
} from "@/lib/utils";

type CalendarProps = {
  completedDates: Set<string>;
  onDateClick: (date: string) => void;
  onPrevHabit?: () => void;
  onNextHabit?: () => void;
};

// Pre-compute months at module level (doesn't change during session)
const MONTHS = getMonthsToDisplay();

/**
 * Calendar component displaying months from start date to today
 *
 * Features:
 * - Scrollable month grid
 * - Auto-scrolls to current month on load
 * - Visual indicator for completed dates
 * - Click handler for toggling/editing dates
 */
export function Calendar({ completedDates, onDateClick, onPrevHabit, onNextHabit }: CalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasInitialScroll, setHasInitialScroll] = useState(false);

  // Scroll to current month on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setHasInitialScroll(true);
    }
  }, []);

  const today = getTodayString();

  const handleLeftArrowClick = () => onPrevHabit?.();
  const handleRightArrowClick = () => onNextHabit?.();

  return (
      <div className="flex border border-slate-600 rounded-xl mx-auto mt-6 max-w-3xl">
        <div className="w-1/15 border-r border-slate-600 flex justify-center items-center">
          <button id="left-arrow" onClick={handleLeftArrowClick} className="text-slate-300 text-2xl hover:text-slate-100 cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-10 w-10">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col mx-auto flex-grow">
          <h1 className="text-slate-300 mx-auto mt-4">Calendar</h1>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center text-xl text-slate-300 font-semibold mt-6 px-2">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i}>{label}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            ref={scrollRef}
            className={`mt-4 h-100 overflow-y-auto transition-opacity duration-150 ${
              hasInitialScroll ? "opacity-100" : "opacity-0"
            }`}
          >
            {MONTHS.map(({ monthIndex, year }) => (
              <CalendarMonth
                key={`${monthIndex + 1}-${year}`}
                monthIndex={monthIndex}
                year={year}
                today={today}
                completedDates={completedDates}
                onDateClick={onDateClick}
              />
            ))}
          </div>
        </div>
        <div className="w-1/15 border-l border-slate-600 flex justify-center items-center">
          <button id="right-arrow" onClick={handleRightArrowClick} className="text-slate-300 text-2xl hover:text-slate-100 cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-10 w-10">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
  );
}

// =============================================================================
// CalendarMonth (internal component)
// =============================================================================

type CalendarMonthProps = {
  monthIndex: number;
  year: number;
  today: string;
  completedDates: Set<string>;
  onDateClick: (date: string) => void;
};

function CalendarMonth({
  monthIndex,
  year,
  today,
  completedDates,
  onDateClick
}: CalendarMonthProps) {
  const daysInMonth = getDaysInMonth(monthIndex, year);
  const offset = getFirstDayOffset(monthIndex, year);
  const cells = getCalendarCells(offset, daysInMonth);

  return (
    <div className="py-2">
      <div className="text-lg text-slate-200 font-semibold px-3 sm:px-4 md:px-5">
        {MONTH_NAMES[monthIndex]} {year}
      </div>

      <div className="grid grid-cols-7 px-2 text-center text-slate-300">
        {cells.map((day, i) => {
          if (day === 0) {
            return <div key={`pad-${i}`} className="invisible h-14" />;
          }

          const habitDate = formatDateString(year, monthIndex + 1, day);
          const isCompleted = completedDates.has(habitDate);
          const isClickable = habitDate >= CLICKABLE_START_DATE && habitDate <= today;

          return (
            <CalendarDay
              key={`day-${day}`}
              day={day}
              isCompleted={isCompleted}
              isClickable={isClickable}
              onClick={() => onDateClick(habitDate)}
            />
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// CalendarDay (internal component)
// =============================================================================

type CalendarDayProps = {
  day: number;
  isCompleted: boolean;
  isClickable: boolean;
  onClick: () => void;
};

function CalendarDay({ day, isCompleted, isClickable, onClick }: CalendarDayProps) {
  return (
    <div className="flex justify-center items-center h-14">
      <div
        className={`relative flex justify-center items-center h-10 w-10 rounded-full ${
          isCompleted
            ? "bg-slate-800"
            : isClickable
              ? "hover:bg-slate-900 hover:border border-slate-800"
              : ""
        }`}
        onClick={isClickable ? onClick : undefined}
      >
        {isCompleted && (
          <div className="flex absolute -top-1 -right-1 h-4 w-4 justify-center items-center bg-green-600 rounded-full">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-3 w-3">
              <path d="M4 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <span className="text-sm select-none">{day}</span>
      </div>
    </div>
  );
}
