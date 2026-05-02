import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — HabitPulse",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-xl font-bold text-primary">
            HabitPulse
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <p><strong>Last updated:</strong> May 2026</p>
          <p>
            HabitPulse collects your email address for authentication via magic link.
            We store your habit data (habit names, daily check-ins, streaks) to provide
            the service. We do not sell your data or share it with third parties.
          </p>
          <p>
            We use Vercel Analytics to understand general usage patterns. This collects
            anonymous, aggregated data — no personal information is tracked.
          </p>
          <p>
            Your data is stored securely on Supabase with row-level security, meaning
            only you can access your own habits and logs.
          </p>
          <p>
            You can delete your account and all associated data at any time by contacting
            us at <a href="mailto:hello@habitpulse.app" className="text-primary hover:underline">hello@habitpulse.app</a>.
          </p>
        </div>
        <div className="mt-12">
          <Link href="/" className="text-sm text-primary font-semibold hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
