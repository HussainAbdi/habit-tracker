import { sheetsClient } from "@/lib/sheets";
import { NextResponse } from "next/server";
import { HABIT_NAMES, HabitName } from "@/lib/constants";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME!;

// Sheet Columns:
// A: Date, B: Day, C: Software Min, D: Music Min, E: Gym Min,
// F: Software Done, G: Music Done, H: Gym Done, ... O: Notes
const DATE_COL_INDEX = 0;
const HABIT_CONFIG = {
  Software: {
    valueCol: { index: 2, letter: "C" },
    doneCol: { index: 5, letter: "F" },
    notesCol: { index: 14, letter: "O" },
  },
  Music: {
    valueCol: { index: 3, letter: "D" },
    doneCol: { index: 6, letter: "G" },
    notesCol: { index: 15, letter: "P" },
  },
  Gym: {
    valueCol: { index: 4, letter: "E" },
    doneCol: { index: 7, letter: "H" },
    notesCol: { index: 16, letter: "Q" },
  },
}


/**
 * GET /api/habit
 * Hashmap of habit names to completed dates
 * Returns { allHabitCompletedDates: { [habitName: string]: {date: string, value: string, notes: string}[] } }
 * Example: {
 *   "Software": ["2025-11-25", "2025-11-26", ...],
 *   "Music": ["2025-11-25", "2025-11-26", ...],
 *   "Gym": ["2025-11-25", "2025-11-26", ...]
 * }
 */
export async function GET() {
  try {
    const sheets = await sheetsClient;
    
    const range = `${SHEET_NAME}!A2:T1000`;
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range
    })
    
    const rows = res.data.values ?? [];
    const initial: { [habitName: string]: { date: string; value: string; notes: string }[] } = {
      Software: [],
      Music: [],
      Gym: [],
    };
    const allHabitCompletedDates = rows
      .filter((row: string[]) => row[DATE_COL_INDEX])
      .filter(
        (row: string[]) => {
          return HABIT_NAMES.some((habitName) => row[HABIT_CONFIG[habitName].doneCol.index] === "1");
        }
      )
      .reduce(
        (acc: typeof initial, row: string[]) => {
          HABIT_NAMES.forEach((habitName) => {
            const doneCol = HABIT_CONFIG[habitName].doneCol.index;
            const valueCol = HABIT_CONFIG[habitName].valueCol.index;
            const notesCol = HABIT_CONFIG[habitName].notesCol.index;
            if (row[doneCol] === "1") {
              acc[habitName].push({
                date: row[DATE_COL_INDEX] ?? "",
                value: row[valueCol] ?? "",
                notes: row[notesCol] ?? "",
              });
            }
          });
          return acc;
        },
        { Software: [], Music: [], Gym: [] }
      );

    return NextResponse.json({ allHabitCompletedDates });
  } catch (err) {
    console.error("GET /api/habit error", err);
    return NextResponse.json(
      { error: "Failed to load habit data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habit
 * Body: { habitName: "Software" | "Music" | "Gym", date: YYYY-MM-DD, completed: boolean, value?: string, notes?: string }
 * - habitName is the name of the habit to update
 * - date is ISO format (e.g. "2025-11-29")
 * - completed is the new habit state after toggling
 * - value is optional time spent (e.g. "y", "30 mins", "y - 30 mins")
 * - notes is optional notes text
 */

export async function POST(request: Request) {
  try {
    const { habitName, date, completed, value, notes } = await request.json() as {
      habitName: (typeof HABIT_NAMES)[number];
      date: string;
      completed: boolean;
      value?: string;
      notes?: string;
    };

    const sheets = await sheetsClient;

    // Get row index
    const range = `${SHEET_NAME}!A2:T1000`;
    const resGet = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range
    })
    const rows = resGet.data.values ?? [];
    // Use that to make range or cell number for Software Min ${SHEET_NAME}!C${rowNumber}
    const rowIndex = rows.findIndex(row => row[DATE_COL_INDEX] === date);
    if (rowIndex === -1){
      console.error(`No row found for date ${date}`)
      return NextResponse.json(
        { error: `No row found for date ${date}`},
        { status: 400 }
      )
    }
    const rowNumber = rowIndex + 2;

    // Determine the value to write
    const valueToWrite = completed ? (value ?? "y") : "";
    const notesToWrite = completed ? (notes ?? "") : "";

    // Update Software Min (column C) and Notes (column O)
    const updateHabitMinRange = `${SHEET_NAME}!${HABIT_CONFIG[habitName].valueCol.letter}${rowNumber}`;
    const updateHabitNotesRange = `${SHEET_NAME}!${HABIT_CONFIG[habitName].notesCol.letter}${rowNumber}`;

    await Promise.all([
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: updateHabitMinRange,
        valueInputOption: "RAW",
        requestBody: {
          values: [[valueToWrite]]
        }
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: updateHabitNotesRange,
        valueInputOption: "RAW",
        requestBody: {
          values: [[notesToWrite]]
        }
      })
    ]);

    return NextResponse.json ({ ok: true })
  } catch (err) {
    console.error("POST /api/habit error", err);
    return NextResponse.json(
      { error: "Failed to update habit data" },
      { status: 500 }
    );
  }
}