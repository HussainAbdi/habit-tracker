# Habit - A Google Sheets Powered Habit Tracker
A visual, mobile-first habit tracker PWA built with Next.js, Tailwind and the Google Sheets API.
This is the real habit system I use every day - synced to the same Google Sheet I track my habits in.

The app renders a month-by-month calendar UI, hydrates from my Sheet on load, and updates the Sheet instantly when I mark habits complete.

# Demo
![habit-tracker-demo-edited](https://github.com/user-attachments/assets/98231057-b871-4770-ab7d-aceda46898f3)

<p align="center">
  <img width="31%" alt="habit-tracker-software-preview" src="https://github.com/user-attachments/assets/9a087618-ff9d-40fc-a785-132dd0223a26" />
  <img width="31%" alt="habit-tracker-gym-preview" src="https://github.com/user-attachments/assets/6901c5b1-7a5c-453b-8617-f14020d74cce" />
  <img width="31%" alt="habit-tracker-music-preview" src="https://github.com/user-attachments/assets/6cb42911-4009-4826-b92a-604a159142b3" />
  <img width="33%" alt="habit tracker - update habit" src="https://github.com/user-attachments/assets/d0b5ebed-635f-4fe6-9cd0-44f07ee850f5" />
</p>

## Google Sheets Backend
<img width="2048" height="1038" alt="habit-tracker-sheets-backend" src="https://github.com/user-attachments/assets/b7002fa8-5e2e-45d6-8cad-1cffdbbc5c00" />

## How It Works

### Data Flow
```
Google Sheet ←→ Sheets API ←→ Next.js API Routes ←→ React Frontend
```

### Loading Habits
The frontend calls `GET /api/habit` on mount, which:
- Authenticates with Google via a service account
- Reads the sheet and returns completed dates for all habits (Software, Music, Gym)
- Groups entries by habit using a config-driven column mapping

### Marking a Habit Complete
Tapping an uncompleted date:
- Instantly updates the UI (optimistic update)
- Triggers haptic feedback (Vibration API on Android, hidden `<input switch>` workaround on iOS 18+)
- Fires an async `POST /api/habit` to write the value into the correct sheet cell

### Editing a Completed Habit
Tapping a completed date opens a draggable bottom sheet where you can:
- Log time spent (minutes or hours)
- Add notes
- Remove the entry

The bottom sheet uses velocity-based gesture detection for natural swipe-to-dismiss.

### Multi-Habit Support
Habits are driven by a single `HABIT_CONFIG` object that maps each habit to its sheet columns. Switching between habits is done via arrow navigation, and adding a new habit requires only a config change.

### Security
- PIN-based authentication with rate limiting and secure HTTP-only cookies
- All secrets (private key, sheet ID) stored in environment variables

## Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Google Sheets API
- **Deployment:** Vercel with automatic CI/CD from GitHub
