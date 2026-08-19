"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AccountMenu from "@/components/AccountMenu";
import { NICHE_OPTIONS } from "@/lib/settings";

type SettingsData = {
  displayName: string;
  timezone: string;
  sparkTime: string;
  emailDaily: boolean;
  emailProduct: boolean;
  niches: string[];
};

type UserData = {
  id: string;
  username: string;
  email: string;
  createdAt: string | null;
  settings: SettingsData;
};

const TIMEZONES = [
  "Europe/Athens",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [sparkTime, setSparkTime] = useState("07:30");
  const [timezone, setTimezone] = useState("Europe/Athens");
  const [emailDaily, setEmailDaily] = useState(true);
  const [emailProduct, setEmailProduct] = useState(false);
  const [niches, setNiches] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.user) return;
        const next = data.user as UserData;
        setUser(next);
        setUsername(next.username);
        setDisplayName(next.settings.displayName);
        setEmail(next.email);
        setSparkTime(next.settings.sparkTime);
        setTimezone(next.settings.timezone);
        setEmailDaily(next.settings.emailDaily);
        setEmailProduct(next.settings.emailProduct);
        setNiches(next.settings.niches);
      })
      .catch(() => setError("Could not load settings."));
  }, []);

  async function save(body: Record<string, unknown>, key: string) {
    setSaving(key);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save.");
        return;
      }
      setUser(data.user);
      setMessage("Saved.");
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(null);
    }
  }

  function toggleNiche(name: string) {
    setNiches((current) => {
      if (current.includes(name)) return current.filter((item) => item !== name);
      if (current.length >= 3) return current;
      return [...current, name];
    });
  }

  async function deleteAccount() {
    const ok = window.confirm("Delete this account on this device? You will be signed out.");
    if (!ok) return;
    setSaving("delete");
    await fetch("/api/account", { method: "DELETE" });
    window.location.href = "/signup";
  }

  return (
    <div className="grid-fade min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300 text-zinc-950 font-black">M</span>
          <span className="text-lg font-semibold tracking-tight">Settings</span>
        </Link>
        <AccountMenu />
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-20 space-y-6">
        <p className="text-zinc-400">Who you are, when your spark arrives, and how we email you.</p>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-amber-200">{message}</p> : null}

        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <label className="block text-sm"><span className="text-zinc-400">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-300/60" />
          </label>
          <label className="block text-sm"><span className="text-zinc-400">Display name</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How sparks should greet you" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-300/60" />
          </label>
          <label className="block text-sm"><span className="text-zinc-400">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-300/60" />
          </label>
          <button onClick={() => save({ username, email, settings: { displayName } }, "profile")} disabled={saving === "profile"} className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-200 disabled:opacity-60">
            {saving === "profile" ? "Saving…" : "Save profile"}
          </button>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Password</h2>
          <label className="block text-sm"><span className="text-zinc-400">Current password</span>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-300/60" />
          </label>
          <label className="block text-sm"><span className="text-zinc-400">New password</span>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-300/60" />
          </label>
          <button onClick={() => save({ currentPassword, newPassword }, "password")} disabled={saving === "password"} className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/10 disabled:opacity-60">
            {saving === "password" ? "Updating…" : "Update password"}
          </button>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Daily spark</h2>
          <p className="text-sm text-zinc-400">Pick up to 3 niches and a delivery time.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm"><span className="text-zinc-400">Time</span>
              <input type="time" value={sparkTime} onChange={(e) => setSparkTime(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-300/60" />
            </label>
            <label className="block text-sm"><span className="text-zinc-400">Timezone</span>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none focus:border-amber-300/60">
                {TIMEZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {NICHE_OPTIONS.map((name) => {
              const on = niches.includes(name);
              return (
                <button key={name} type="button" onClick={() => toggleNiche(name)} className={`rounded-full px-3 py-1.5 text-sm border ${on ? "border-amber-300/50 bg-amber-300/15 text-amber-100" : "border-white/10 bg-white/5 text-zinc-300"}`}>
                  {name}
                </button>
              );
            })}
          </div>
          <button onClick={() => save({ settings: { sparkTime, timezone, niches } }, "spark")} disabled={saving === "spark"} className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-200 disabled:opacity-60">
            {saving === "spark" ? "Saving…" : "Save spark settings"}
          </button>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
            <span><span className="block">Daily spark email</span><span className="text-sm text-zinc-400">One idea in the morning. No feed.</span></span>
            <input type="checkbox" checked={emailDaily} onChange={(e) => setEmailDaily(e.target.checked)} className="h-5 w-5 accent-amber-300" />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 px-4 py-3">
            <span><span className="block">Product updates</span><span className="text-sm text-zinc-400">Occasional notes about new features.</span></span>
            <input type="checkbox" checked={emailProduct} onChange={(e) => setEmailProduct(e.target.checked)} className="h-5 w-5 accent-amber-300" />
          </label>
          <button onClick={() => save({ settings: { emailDaily, emailProduct } }, "notify")} disabled={saving === "notify"} className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-200 disabled:opacity-60">
            {saving === "notify" ? "Saving…" : "Save notifications"}
          </button>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 space-y-3">
          <h2 className="text-xl font-semibold">Subscription</h2>
          <p className="text-sm text-zinc-400">Start or change a plan from the homepage. Manage billing in Stripe after checkout.</p>
          <Link href="/#pricing" className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/10">View plans</Link>
        </section>

        <section className="rounded-3xl border border-rose-400/20 bg-rose-500/5 p-6 space-y-3">
          <h2 className="text-xl font-semibold">Danger zone</h2>
          <p className="text-sm text-zinc-400">Signed in as {user ? `@${user.username}` : "…"}.</p>
          <button onClick={deleteAccount} disabled={saving === "delete"} className="rounded-full border border-rose-400/40 px-5 py-2.5 text-sm text-rose-200 hover:bg-rose-500/10 disabled:opacity-60">
            {saving === "delete" ? "Deleting…" : "Delete account"}
          </button>
        </section>
      </main>
    </div>
  );
}
