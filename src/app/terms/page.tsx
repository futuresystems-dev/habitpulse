import Link from "next/link";

export const metadata = {
  title: "Terms of Service — HabitPulse",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <p><strong>Last updated:</strong> May 2026</p>
          <p>
            By using HabitPulse, you agree to these terms. HabitPulse is a habit tracking
            tool provided as-is. We do our best to keep it reliable, but we make no
            guarantees about uptime or data availability.
          </p>
          <p>
            Free accounts are limited to 3 active habits. Pro accounts (when available)
            unlock unlimited habits and additional features.
          </p>
          <p>
            You are responsible for the content you create. Do not use HabitPulse for
            illegal purposes or to store sensitive personal data beyond what is needed
            for habit tracking.
          </p>
          <p>
            We may update these terms at any time. Continued use of HabitPulse after
            changes constitutes acceptance.
          </p>
          <p>
            Questions? Contact us at <a href="mailto:hello@habitpulse.app" className="text-primary hover:underline">hello@habitpulse.app</a>.
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
