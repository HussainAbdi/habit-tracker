"use client";

import { useEffect, useRef, useState } from "react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DATES_STORAGE_KEY = "habit-completedDates";
const CLICKABLE_START_DATE = "2025-08-23";

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDatesUiOffset = (datesOffset: number) => {
  if (0 <= datesOffset && datesOffset <= 6 ){
    if (1 <= datesOffset && datesOffset <= 5){
      return datesOffset-1;
    } else if (datesOffset === 0) {
      return 6;
    } else if (datesOffset === 6) {
      return 5;
    }
  }
  console.error("getDatesUiOffset: datesOffset outside of expected range!")
  return -1;
}

const getDatesOffset = (month: number, year: number) => {
  let tempOffset = new Date(year, month, 1).getDay();
  let actualOffset = getDatesUiOffset(tempOffset);
  return actualOffset;
}

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
}

const getCalendarCells = (offset: number, daysInMonth: number) => {
  const cells = [
    ...Array(offset).fill(0),
    ...Array.from({length: daysInMonth}, (_,i) => i + 1)
  ]
  return cells;
}

type MonthData = {
  monthIndex: number, //0-11
  year: number
}

const getMonthsToDisplay = (): MonthData[] => {
  const [startYear, startMonth] = CLICKABLE_START_DATE.split("-").map(Number);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11

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

const months = getMonthsToDisplay();

export default function Home () {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [completedDates, setCompletedDates] = useState<{date: string, value: string}[]>([]);
  const [hasInitialScroll, setHasInitialScroll] = useState(false);

  const toggleDates = (habitDate: string) => {
    const currentValue = completedDates.find(entry => entry.date == habitDate)?.value ?? "";

    const isSimple = currentValue === "y" || currentValue === "";

    if (!isSimple) {
      const ok = window.confirm(
        `This date has notes: ${currentValue}. Overwrite it?`
      )
      if (!ok) return;
    }

    setCompletedDates(prev => {
      const exists = prev.some(entry => entry.date === habitDate);
      const next = exists
        ? prev.filter(entry => entry.date !== habitDate)
        : [...prev, {date: habitDate, value: "y"}]

      fetch("/api/habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: habitDate,
          completed: !exists
        })
      }).catch(err =>{
        console.error("Failed to sync habit", err);
      });
      
      return next;
    });
  }

  useEffect(() => {
    {/* jump to the current month */}
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setHasInitialScroll(true);
    }
    {/* Hydrating completedDates from Google Sheet */}
    async function load() {
      try {
        const res = await fetch("/api/habit");
        if (!res.ok) return;
        const data = await res.json() as { completedDates: {date: string, value: string}[] }
        setCompletedDates(data.completedDates); 
      } catch (err) {
        console.log("Unable to fetch completed habits", err);
      }
    }

    load();
  }, []);

  useEffect(() => {
    localStorage.setItem(DATES_STORAGE_KEY, JSON.stringify(completedDates));
  }, [completedDates]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex justify-center text-5xl mt-4">Habit</header>
      <main className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col border border-slate-600 rounded-xl mx-auto mt-6 max-w-3xl">
          <h1 className="text-slate-300 mx-auto mt-4">Calendar</h1>
          <div className="grid grid-cols-7 text-center text-xl text-slate-300 font-semibold mt-6 px-10">
            <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
          </div>
          <div 
            ref={scrollRef} 
            className={`mt-4 h-100 overflow-y-auto transition-opacity duration-150
              ${hasInitialScroll ? "opacity-100":"opacity-0"}
            `} 
          >
            {months.map(
              (monthData,i) => {
                const {monthIndex, year} = monthData;
                const daysInMonth = getDaysInMonth(monthIndex, year);
                const offset = getDatesOffset(monthIndex, year);
                const paddedDates = getCalendarCells(offset, daysInMonth);            
                
                return (
                  <div key={`${monthIndex+1}-${year}`} className="py-2">
                    <div className="text-slate text-lg text-slate-200 font-semibold px-10 sm:px-12 md:px-15">{MONTH_NAMES[monthIndex]} {year}</div>
                    <div className="grid grid-cols-7 px-10 text-center text-slate-300">
                      {paddedDates.map(
                        (date, i) => {
                          const habitDate = `${year}-${String(monthIndex+1).padStart(2,"0")}-${String(date).padStart(2,"0")}`;
                          const today = getTodayString();
                          const isDateBeforeStart = habitDate < CLICKABLE_START_DATE;
                          const isDateInFuture = habitDate > today;
                          const isClickable = !isDateBeforeStart && !isDateInFuture;
                          return (
                            <div key={date === 0 ? `pad-${i}`:`date-${date}`} className={date === 0 ? "invisible": "flex justify-center items-center h-14"} >
                              <div
                                className={
                                  `relative flex justify-center items-center h-10 w-10 rounded-full
                                  ${completedDates.some(entry => entry.date === habitDate)
                                  ? "bg-slate-800"
                                  : isClickable ? "hover:bg-slate-900 hover:border border-slate-800" : ""}`
                                }
                                onClick={isClickable ? () => toggleDates(habitDate) : undefined}
                              >
                                <div className={completedDates.some(entry => entry.date === habitDate) 
                                  ? "flex absolute -top-1 -right-1 h-4 w-4 justify-center items-center bg-green-600 rounded-full"
                                  : "hidden"}>
                                    {/* checkmark svg */}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-3 w-3 text-white">
                                      <path d="M4 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="text-sm select-none">{date}</div>
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

