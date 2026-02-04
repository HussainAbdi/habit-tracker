"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, EditHabitSheet, HapticTrigger } from "./components";
import { fetchHabits, syncHabit } from "@/lib/api";
import { triggerHaptic } from "@/lib/utils";
import { DATES_STORAGE_KEY } from "@/lib/constants";
import type { CompletedDate } from "@/lib/types";

// =============================================================================
// Main Page Component
// =============================================================================

export default function Home() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [completedDates, setCompletedDates] = useState<CompletedDate[]>([]);
  const [editSheet, setEditSheet] = useState({
    isOpen: false,
    date: "",
    value: "",
    notes: ""
  });

  // Memoize completed dates as a Set for O(1) lookup in Calendar
  const completedDatesSet = useMemo(
    () => new Set(completedDates.map(entry => entry.date)),
    [completedDates]
  );

  // ---------------------------------------------------------------------------
  // Data Loading
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const loadHabits = async () => {
      const habits = await fetchHabits();
      setCompletedDates(habits);
    };

    loadHabits();
  }, []);

  // Persist to localStorage whenever completedDates changes
  useEffect(() => {
    localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(completedDates));
  }, [completedDates]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleDateClick = useCallback((habitDate: string) => {
    const entry = completedDates.find(e => e.date === habitDate);

    if (entry) {
      // Already completed - open edit sheet
      setEditSheet({
        isOpen: true,
        date: habitDate,
        value: entry.value,
        notes: entry.notes
      });
    } else {
      // Not completed - instantly mark as complete
      triggerHaptic();
      setCompletedDates(prev => [...prev, { date: habitDate, value: "y", notes: "" }]);
      syncHabit(habitDate, true, "y");
    }
  }, [completedDates]);

  const handleSave = useCallback((value: string, notes: string) => {
    const { date } = editSheet;

    setCompletedDates(prev =>
      prev.map(entry =>
        entry.date === date ? { ...entry, value, notes } : entry
      )
    );

    syncHabit(date, true, value, notes);
    setEditSheet(prev => ({ ...prev, isOpen: false }));
  }, [editSheet]);

  const handleRemove = useCallback(() => {
    const { date } = editSheet;

    setCompletedDates(prev => prev.filter(entry => entry.date !== date));
    syncHabit(date, false);
    setEditSheet(prev => ({ ...prev, isOpen: false }));
  }, [editSheet]);

  const handleCloseSheet = useCallback(() => {
    setEditSheet(prev => ({ ...prev, isOpen: false }));
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <HapticTrigger />

      <header className="flex justify-center text-5xl mt-4">Habit</header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Calendar
          completedDates={completedDatesSet}
          onDateClick={handleDateClick}
        />
      </main>

      <EditHabitSheet
        isOpen={editSheet.isOpen}
        date={editSheet.date}
        initialValue={editSheet.value}
        initialNotes={editSheet.notes}
        onSave={handleSave}
        onRemove={handleRemove}
        onClose={handleCloseSheet}
      />
    </div>
  );
}
