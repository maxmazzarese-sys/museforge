"use client";

import { useState } from "react";

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
    body: "Most tools solve the happy path. Ship a $29/mo companion that owns the ugly edge case your users already pay a contractor to fix.",
  },
  {
    niche: "Creator",
    title: "The 11-minute recap",
    body: "Turn every long interview into a 3-beat recap: one contrarian take, one story, one question. Post the question first. The recap follows 90 minutes later.",
  },
  {
    niche: "Founder",
    title: "Reverse the demo",
    body: "Start sales calls by showing the customer’s current workflow, then delete three steps live. People buy the feeling of less work, not more features.",
  },
];

async function startCheckout(priceKey?: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId: priceKey }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
    return;
  }
  alert(
    data.error ||
      "Checkout is ready once you add Stripe keys in Vercel. This demo landing page is live."
  );
}

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);

  const onPay = async (plan: string) => {
    setLoading(plan);
    try {
      await startCheckout();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid-fade min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300 text-zinc-950 font-black">
            M
          </span>
          <span className="text-lg font-semibold tracking-tight">MuseForge</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <button
            onClick={() => onPay("nav")}
            className="rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20"
          >
            Start trial
          </button>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-10 text-center">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
          Recurring ideas, not another chat window
        </p>
        <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]">
          One idea so good
          <br />
          <span className="text-amber-300">you’ll pay to keep it coming.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-zinc-400 leading-relaxed">
          MuseForge studies your niches and drops a single, usable spark every
          morning — a hook, a product wedge, a system, or a sentence you can
          ship today. No feed. No doomscroll. Just the one thing.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onPay("hero")}
            className="w-full sm:w-auto rounded-full bg-amber-300 px-7 py-3.5 text-zinc-950 font-semibold hover:bg-amber-200 transition"
          >
            {loading === "hero" ? "Opening checkout…" : "Get tomorrow’s spark — $9/mo"}
          </button>
          <a
            href="#sample"
            className="w-full sm:w-auto rounded-full border border-white/15 px-7 py-3.5 text-white hover:bg-white/5"
          >
            Read today’s sample
          </a>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          7-day taste. Cancel in one click. Built for people who already pay for
          tools that respect their attention.
        </p>
      </section>

      <section id="sample" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {sparks.map((s) => (
            <article
              key={s.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-widest text-amber-300/80">
                {s.niche}
              </p>
              <h3 className="mt-3 text-xl font-medium">{s.title}</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Designed so paying feels obvious.
            </h2>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Research on micro-SaaS in 2026 is clear: people subscribe when the
              product is narrow, daily, and tied to money or output. MuseForge
              is a 60-second ritual that compounds. Miss a week and you feel
              it.
            </p>
            <ul className="mt-6 space-y-3 text-zinc-300">
              <li>— Pick 3 niches on day one.</li>
              <li>— A 120-word spark lands at a time you choose.</li>
              <li>— Archive, remix, and export as cards or Notion.</li>
              <li>— The model remembers what you actually used.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6">
            <p className="text-sm text-zinc-500 mb-4">Your niches</p>
            <div className="flex flex-wrap gap-2">
              {niches.map((n) => (
                <span
                  key={n}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold">Simple, recurring, worth it.</h2>
          <p className="mt-3 text-zinc-400">
            Cheaper than one freelance hour. More useful than another AI tab.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/10 p-8">
            <p className="text-sm text-zinc-400">Creator</p>
            <p className="mt-2 text-4xl font-semibold">
              $9<span className="text-lg text-zinc-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-zinc-300 text-sm">
              <li>1 tailored spark every morning</li>
              <li>3 niches + full archive</li>
              <li>Shareable cards</li>
              <li>Cancel anytime</li>
            </ul>
            <button
              onClick={() => onPay("creator")}
              className="mt-8 w-full rounded-full bg-white text-zinc-950 py-3 font-medium hover:bg-zinc-200"
            >
              {loading === "creator" ? "Opening…" : "Subscribe to Creator"}
            </button>
          </div>
          <div className="rounded-3xl border border-amber-300/40 bg-amber-300/5 p-8">
            <p className="text-sm text-amber-200">Studio</p>
            <p className="mt-2 text-4xl font-semibold">
              $19<span className="text-lg text-zinc-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-zinc-300 text-sm">
              <li>Unlimited sparks & remixes</li>
              <li>Custom voice & constraints</li>
              <li>Team seats (3)</li>
              <li>Priority generation window</li>
            </ul>
            <button
              onClick={() => onPay("studio")}
              className="mt-8 w-full rounded-full bg-amber-300 text-zinc-950 py-3 font-medium hover:bg-amber-200"
            >
              {loading === "studio" ? "Opening…" : "Subscribe to Studio"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <h2 className="text-center text-2xl font-semibold mb-8">Why this converts</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          {[
            {
              q: "Daily ritual",
              a: "Subscriptions stick when they show up on a schedule. Morning email + app.",
            },
            {
              q: "Output, not chat",
              a: "One finished idea beats 40 prompts. People pay to skip the blank page.",
            },
            {
              q: "Narrow niche",
              a: "2026 micro-SaaS data favors specific jobs over general AI wrappers.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-white/10 p-5">
              <p className="font-medium text-amber-200">{item.q}</p>
              <p className="mt-2 text-zinc-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-zinc-500">
        MuseForge · Recurring ideas for people who ship · Deployed on Vercel
      </footer>
    </div>
  );
}
