"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const PIN_LENGTH = 4;
const LOCKOUT_DURATION = 30000; // 30 seconds

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle lockout countdown
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1000) {
          setIsLocked(false);
          setError("");
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      submitPin(pin);
    }
  }, [pin]);

  const submitPin = async (pinValue: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        if (data.locked) {
          setIsLocked(true);
          setLockoutRemaining(LOCKOUT_DURATION);
        }
        setError(data.error || "Invalid PIN");
        setPin("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Something went wrong");
      setPin("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setError("");
    setPin(value);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4"
      onClick={focusInput}
    >
      <h1 className="text-slate-100 text-3xl mb-8">Enter PIN</h1>

      <div className="flex gap-3 mb-6 relative">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl text-slate-100
              ${pin.length > i ? "border-slate-500 bg-slate-800" : "border-slate-700"}
              ${error ? "border-red-500" : ""}
            `}
          >
            {pin[i] ? "•" : ""}
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          autoFocus
          value={pin}
          onChange={handleChange}
          disabled={isLocked}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          aria-label="PIN input"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">
          {isLocked ? `Too many attempts. Wait ${Math.ceil(lockoutRemaining / 1000)}s` : error}
        </p>
      )}

      <p className="text-slate-500 text-sm mt-8">
        Tap anywhere to open keypad
      </p>
    </div>
  );
}
