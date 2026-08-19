"use client";

import { useEffect, useRef, useState } from "react";

type SessionUser = {
  id: string;
  username: string;
  email: string;
};

export default function AccountMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (!user) {
    return (
      <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5" />
    );
  }

  const initial = user.username.slice(0, 1).toUpperCase();

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account profile"
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 hover:border-amber-300/40"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-zinc-950">
          {initial}
        </span>
        <span className="max-w-[88px] truncate text-sm text-zinc-100">
          {user.username}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-300 text-lg font-bold text-zinc-950">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">@{user.username}</p>
              <p className="truncate text-xs text-zinc-400">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
