"use client";

import { useEffect, useState } from "react";
import AccountMenu from "@/components/AccountMenu";
import { isUnlocked, type Subscription } from "@/lib/subscription";

const niches = [
  "Content & newsletters",
  "SaaS & startups",
  "Personal brand",
  "Product design",
  "Sales outreach",
  "YouTube & short-form",
  "Engineering systems",
  "Wellness & habits",
];

const sparks = [
  {
    niche: "SaaS",
    title: "Charge for the leftover 20%",
    teaser: "Most tools solve the happy path.",
    body: "Most tools solve the happy path. Ship a $29/month companion that owns the messy edge case your users already pay a contractor to fix.",
  },
  {
    niche: "Creator",
    title: "The 11-minute recap",
    teaser: "Turn every long interview into a three-beat recap.",
    body: "Turn every long interview into a three-beat recap: one contrarian take, one story, and one question. Post the question first. Publish the recap 90 minutes later.",
  },
  {
    niche: "Founder",
    title: "Reverse the demo",
    teaser: "Start sales calls by showing the current workflow.",
    body: "Start sales calls by showing the customer’s current workflow, then delete three steps live. People buy the feeling of less work, not more features.",
  },
];

const studioSparks = [
  {
    niche: "Studio",
    title: "Sell the constraint",
    body: "Offer a 48-hour version of your product with one outcome and no settings. Charge more. Ship less.",
  },
  {
    niche: "Studio",
    title: "The leftover inbox",
    body: "Every Friday, reply to five people who almost bought. The follow-up is the product.",
  },
];

async function startCheckout(plan: "creator" | "studio") {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  let data: { url?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("Checkout did not return a valid response. Please try again.");
  }

  if (data.url) {
    window.location.href = data.url;
    return;
  }

  throw new Error(
    data.error || "Checkout will work after you add Stripe keys in Vercel."
  );
}

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const unlocked = isUnlocked(subscription);
  const studio = subscription?.plan === "studio";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.subscription) setSubscription(data.user.subscription);
      })
      .catch(() => {});
  }, []);

  const onPay = async (plan: "creator" | "studio") => {
    setLoading(plan);
    setError(null);
    try {
      await startCheckout(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid-fade min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300 text-zinc-950 font-black">M</span>
          <span className="text-lg font-semibold tracking-tight">MuseForge</span>
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <AccountMenu />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-10 text-center">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
          {unlocked ? "Unlocked" : "Recurring ideas, not another chat window"}
        </p>
        <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]">
          One idea so good<br /><span className="text-amber-300">you’ll pay to keep it coming.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed">
          {unlocked
            ? "Your plan is active. Today’s full sparks are below."
            : "Free accounts get a teaser. A Creator or Studio trial unlocks the full spark, the archive, and morning email."}
        </p>
        {!unlocked ? (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => onPay("creator")} className="w-full sm:w-auto rounded-full bg-amber-300 px-7 py-3.5 text-zinc-950 font-semibold hover:bg-amber-200 transition">
              {loading === "creator" ? "Opening checkout…" : "Unlock with a 7-day trial"}
            </button>
            <a href="#pricing" className="w-full sm:w-auto rounded-full border border-white/15 px-7 py-3.5 text-white hover:bg-white/5">See plans</a>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-zinc-500">
          {unlocked
            ? `${subscription?.plan === "studio" ? "Studio" : "Creator"} · ${subscription?.status}`
            : "Seven-day trial. Cancel in one click."}
        </p>
        {error ? <p className="mt-4 text-sm text-rose-300 max-w-xl mx-auto">{error}</p> : null}
      </section>

      <section id="sample" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {sparks.map((s, index) => {
            const locked = !unlocked && index > 0;
            return (
              <article key={s.title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-widest text-amber-300/80">{s.niche}</p>
                <h3 className="mt-3 text-xl font-medium">{s.title}</h3>
                <p className={`mt-3 text-zinc-400 leading-relaxed ${locked ? "blur-sm select-none" : ""}`}>
                  {unlocked || index === 0 ? s.body : s.teaser}
                </p>
                {index === 0 && !unlocked ? (
                  <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">Free teaser</p>
                ) : null}
                {locked ? (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-6">
                    <button onClick={() => onPay("creator")} className="w-full rounded-full bg-amber-300 py-2.5 text-sm font-medium text-zinc-950">
                      Unlock full spark
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        {studio ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {studioSparks.map((s) => (
              <article key={s.title} className="rounded-3xl border border-amber-300/30 bg-amber-300/5 p-6">
                <p className="text-xs uppercase tracking-widest text-amber-300/80">{s.niche}</p>
                <h3 className="mt-3 text-xl font-medium">{s.title}</h3>
                <p className="mt-3 text-zinc-400 leading-relaxed">{s.body}</p>
              </article>
            ))}
          </div>
        ) : unlocked ? (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Studio unlocks extra daily sparks.{" "}
            <button onClick={() => onPay("studio")} className="text-amber-200 underline">
              Upgrade
            </button>
          </p>
        ) : null}
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Built so the value is obvious.</h2>
        <p className="mt-4 max-w-2xl text-zinc-400 leading-relaxed">
          People subscribe when a product is narrow, daily, and tied to real work. MuseForge is a 60-second morning ritual that compounds. Miss a week, and you feel it.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {niches.map((n) => (
            <span key={n} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">{n}</span>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold">Simple, recurring, and worth it.</h2>
          <p className="mt-3 text-zinc-400">Cheaper than one freelance hour. More useful than another AI tab.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 p-8">
            <p className="text-sm text-zinc-400">Creator</p>
            <p className="mt-2 text-4xl font-semibold">$9<span className="text-lg text-zinc-500">/mo</span></p>
            <ul className="mt-6 space-y-2 text-zinc-300 text-sm">
              <li>Full daily spark, not a teaser</li>
              <li>Three niches and the archive</li>
              <li>Morning email</li>
              <li>Cancel anytime</li>
            </ul>
            <button onClick={() => onPay("creator")} className="mt-8 w-full rounded-full bg-white text-zinc-950 py-3 font-medium">
              {loading === "creator" ? "Opening…" : unlocked && subscription?.plan === "creator" ? "Current plan" : "Subscribe to Creator"}
            </button>
          </div>
          <div className="rounded-3xl border border-amber-300/40 bg-amber-300/5 p-8">
            <p className="text-sm text-amber-200">Studio</p>
            <p className="mt-2 text-4xl font-semibold">$19<span className="text-lg text-zinc-500">/mo</span></p>
            <ul className="mt-6 space-y-2 text-zinc-300 text-sm">
              <li>Everything in Creator</li>
              <li>Extra sparks every day</li>
              <li>All niches</li>
              <li>Priority generation window</li>
            </ul>
            <button onClick={() => onPay("studio")} className="mt-8 w-full rounded-full bg-amber-300 text-zinc-950 py-3 font-medium">
              {loading === "studio" ? "Opening…" : unlocked && subscription?.plan === "studio" ? "Current plan" : "Subscribe to Studio"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
