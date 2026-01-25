import { sheetsClient } from "@/lib/sheets";
import { NextResponse } from "next/server";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME!;

// Sheet Columns:
// A: Date, B: Day, C: Software Min, D: Music Min, E: Gym Min,
// F: Software Done, G: Music Done, H: Gym Done
const DATE_COL_INDEX = 0;
const SOFTWARE_MIN_COL_INDEX = 2;
const SOFTWARE_DONE_COL_INDEX = 5;

/**
 * GET /api/habit
 * Returns { completedDates: string[] }
 * Example: ["2025-11-25", "2025-11-26", ...]
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
    const completedDates: {date: string, value: string}[] = rows
      .filter(row => row[DATE_COL_INDEX])
      .filter(row => row[SOFTWARE_DONE_COL_INDEX] === "1")
      .map(row => ({
        date: row[DATE_COL_INDEX] as string,
        value: row[SOFTWARE_MIN_COL_INDEX] as string || ""
      }));

    return NextResponse.json({ completedDates });
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
 * Body: { date: YYYY-MM-DD, completed: boolean }
 * - date is ISO format (e.g. "2025-11-29")
 * - completed is the new habit state after toggling
 */

export async function POST(request: Request) {
  try {
    const { date, completed } = await request.json() as {
      date: string;
      completed: boolean;
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
    // Hardcoded "C" for software habit right now
    const updateSoftwareRange = `${SHEET_NAME}!C${rowNumber}`;
    // Make post request

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateSoftwareRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [completed ? ["y"]:[""]]
      }
    });

    return NextResponse.json ({ ok: true })
  } catch (err) {
    console.error("POST /api/habit error", err);
    return NextResponse.json(
      { error: "Failed to update habit data" },
      { status: 500 }
    );
  }
}