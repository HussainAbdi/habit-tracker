# Habit - A Google Sheets Powered Habit Tracker
A visual, mobile friendly habit tracker built with Next.js, Tailwind and the Google Sheets API.
This is the real habit system I use every day - synced to the same Google Sheet I track my habits in.

The app renders a month-by-month calendar UI, hydrates from my Sheet on load, and updates the Sheet instantly when I mark habits complete.

## How it works

The frontend loads habit data by calling: `GET /api/habit`

This API route:

- Authenticates using a Google service account

- Reads my Google Sheet via the Sheets API

- Returns an array of { date, value } entries

When I click a date, the app:

- Updates UI optimistically

- Sends a request to: `POST /api/habit`

Which writes the new value into the correct sheet cell.

Secrets (private key, sheet ID, etc.) are stored securely in environment variables

# Screenshots

<img width="824" height="621" alt="image" src="https://github.com/user-attachments/assets/b0e5c9fa-31ce-4ecd-b14f-136ced16ab87" />
