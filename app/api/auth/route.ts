import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30 * 1000; // 30 seconds
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Simple in-memory rate limiting (resets on server restart)
const attempts = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { pin } = await request.json();

  // Check if locked out
  const attemptData = attempts.get(ip);
  if (attemptData && attemptData.lockedUntil > Date.now()) {
    return NextResponse.json(
      { error: "Too many attempts", locked: true },
      { status: 429 }
    );
  }

  // Verify PIN
  const correctPin = process.env.APP_PIN;
  if (!correctPin) {
    console.error("APP_PIN environment variable not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (pin === correctPin) {
    // Clear attempts on success
    attempts.delete(ip);

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set("auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true });
  }

  // Track failed attempt
  const current = attempts.get(ip) || { count: 0, lockedUntil: 0 };
  current.count += 1;

  if (current.count >= MAX_ATTEMPTS) {
    current.lockedUntil = Date.now() + LOCKOUT_DURATION;
    current.count = 0;
    attempts.set(ip, current);
    return NextResponse.json(
      { error: "Too many attempts", locked: true },
      { status: 429 }
    );
  }

  attempts.set(ip, current);
  return NextResponse.json(
    { error: "Invalid PIN", attemptsRemaining: MAX_ATTEMPTS - current.count },
    { status: 401 }
  );
}
