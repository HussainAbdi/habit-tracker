"use client";

import { useState, useEffect } from "react";
import { BottomSheet } from "./BottomSheet";
import { formatDateHeader, parseTimeValue, buildValueString } from "@/lib/utils";
import type { TimeUnit } from "@/lib/types";

type EditHabitSheetProps = {
  isOpen: boolean;
  date: string;
  initialValue: string;
  initialNotes: string;
  onSave: (value: string, notes: string) => void;
  onRemove: () => void;
  onClose: () => void;
};

/**
 * Bottom sheet for editing a completed habit entry
 *
 * Allows editing:
 * - Time spent (number + mins/hours toggle)
 * - Notes (optional text)
 *
 * Actions:
 * - Save: Updates the entry
 * - Remove: Deletes the entry (marks as incomplete)
 */
export function EditHabitSheet({
  isOpen,
  date,
  initialValue,
  initialNotes,
  onSave,
  onRemove,
  onClose
}: EditHabitSheetProps) {
  const [timeValue, setTimeValue] = useState("");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("mins");
  const [notes, setNotes] = useState("");

  // Reset form when sheet opens with new data
  useEffect(() => {
    if (isOpen) {
      const parsed = parseTimeValue(initialValue);
      setTimeValue(parsed.timeValue);
      setTimeUnit(parsed.timeUnit);
      setNotes(initialNotes);
    }
  }, [isOpen, initialValue, initialNotes]);

  const handleSave = () => {
    const value = buildValueString(timeValue, timeUnit);
    onSave(value, notes);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Date Header */}
      <h2 className="text-lg font-semibold text-slate-100 mb-6">
        {date && formatDateHeader(date)}
      </h2>

      {/* Time Input */}
      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-2">Time spent</label>
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="0"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setTimeUnit("mins")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                timeUnit === "mins"
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              mins
            </button>
            <button
              type="button"
              onClick={() => setTimeUnit("hours")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                timeUnit === "hours"
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              hours
            </button>
          </div>
        </div>
      </div>

      {/* Notes Input */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-2">Notes</label>
        <textarea
          placeholder="Optional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRemove}
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-red-400 font-medium hover:bg-slate-700 transition-colors"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 px-4 py-3 bg-green-600 rounded-lg text-white font-medium hover:bg-green-500 transition-colors"
        >
          Save
        </button>
      </div>
    </BottomSheet>
  );
}
