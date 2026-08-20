"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const [status, setStatus] = useState("Unlocking your plan…");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (!sessionId) {
      setStatus("Start a plan from the homepage to unlock the full sparks.");
      return;
    }

    fetch("/api/billing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription) {
          setStatus(
            data.subscription.status === "trialing"
              ? "Trial is on. Full sparks are unlocked for 7 days."
              : "You are in. Full sparks are unlocked."
          );
        } else {
          setStatus(data.error || "Could not unlock the plan yet.");
        }
      })
      .catch(() => setStatus("Could not unlock the plan yet."));
  }, []);

  return (
    <main className="min-h-screen bg-[#07060c] text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-6">
        <p className="text-amber-300/90 text-sm tracking-[0.2em] uppercase">
          You&apos;re in
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Your first spark arrives tomorrow at 7:14 AM.
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">{status}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-amber-300 text-zinc-950 px-6 py-3 font-medium hover:bg-amber-200 transition"
        >
          Open today&apos;s sparks
        </Link>
      </div>
    </main>
  );
}
