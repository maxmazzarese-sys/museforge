import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#07060c] text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-6">
        <p className="text-amber-300/90 text-sm tracking-[0.2em] uppercase">
          You&apos;re in
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Your first spark arrives tomorrow at 7:14 AM.
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          MuseForge just reserved a seat in your morning. Check your email for
          the onboarding note and pick your first three niches.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-amber-300 text-zinc-950 px-6 py-3 font-medium hover:bg-amber-200 transition"
        >
          Back to MuseForge
        </Link>
      </div>
    </main>
  );
}
