"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, EditHabitSheet, HapticTrigger } from "./components";
import { fetchHabits, syncHabit } from "@/lib/api";
import { triggerHaptic } from "@/lib/utils";
import { DATES_STORAGE_KEY, HABIT_NAMES, HabitName } from "@/lib/constants";
import type { AllHabitCompletedDates } from "@/lib/types";

// =============================================================================
// Main Page Component
// =============================================================================

export default function Home() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [selectedHabit, setSelectedHabit] = useState<HabitName>(HABIT_NAMES[0]);
  const [allHabitCompletedDates, setAllHabitCompletedDates] = useState<AllHabitCompletedDates>({
    Software: [],
    Music: [],
    Gym: []
  });
  const [editSheet, setEditSheet] = useState({
    isOpen: false,
    date: "",
    value: "",
    notes: ""
  });

  // Memoize completed dates as a Set for O(1) lookup in Calendar
  const completedDatesSet = useMemo(
    () => new Set(allHabitCompletedDates[selectedHabit].map(entry => entry.date)),
    [allHabitCompletedDates, selectedHabit]
  );

  // ---------------------------------------------------------------------------
  // Data Loading
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const loadHabits = async () => {
      const habits = await fetchHabits();
      setAllHabitCompletedDates(habits);
    };

    loadHabits();
  }, []);

  // Persist to localStorage whenever completedDates changes
  useEffect(() => {
    localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(allHabitCompletedDates));
  }, [allHabitCompletedDates]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleDateClick = useCallback((habitDate: string) => {
    const entry = allHabitCompletedDates[selectedHabit].find(e => e.date === habitDate);

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
      setAllHabitCompletedDates(prev => ({ ...prev, [selectedHabit]: [...prev[selectedHabit], { date: habitDate, value: "y", notes: "" }] }));
      syncHabit(selectedHabit, habitDate, true, "y");
    }
  }, [allHabitCompletedDates, selectedHabit]);

  const handleSave = useCallback((value: string, notes: string) => {
    const { date } = editSheet;

    setAllHabitCompletedDates(prev =>
      ({ ...prev, [selectedHabit]: prev[selectedHabit].map(entry =>
        entry.date === date ? { ...entry, value, notes } : entry
      )})
    );

    syncHabit(selectedHabit, date, true, value, notes);
    setEditSheet(prev => ({ ...prev, isOpen: false }));
  }, [editSheet]);

  const handleRemove = useCallback(() => {
    const { date } = editSheet;

    setAllHabitCompletedDates(prev => ({ ...prev, [selectedHabit]: prev[selectedHabit].filter(entry => entry.date !== date) }));
    syncHabit(selectedHabit, date, false);
    setEditSheet(prev => ({ ...prev, isOpen: false }));
  }, [editSheet]);

  const handleCloseSheet = useCallback(() => {
    setEditSheet(prev => ({ ...prev, isOpen: false }));
  }, []);

  const goToPrevHabit = useCallback(() => {
    setSelectedHabit(prev => {
      const i = HABIT_NAMES.indexOf(prev);
      return HABIT_NAMES[(i - 1 + HABIT_NAMES.length) % HABIT_NAMES.length];
    });
  }, []);

  const goToNextHabit = useCallback(() => {
    setSelectedHabit(prev => {
      const i = HABIT_NAMES.indexOf(prev);
      return HABIT_NAMES[(i + 1) % HABIT_NAMES.length];
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <HapticTrigger />

      <header className="flex justify-center text-5xl mt-4"> {selectedHabit} Habit</header>

      <main className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Calendar
          completedDates={completedDatesSet}
          onDateClick={handleDateClick}
          onPrevHabit={goToPrevHabit}
          onNextHabit={goToNextHabit}
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
