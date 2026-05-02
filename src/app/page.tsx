import Link from "next/link";

export const metadata = {
  title: "HabitPulse — Build Better Routines For Freelancers",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header/Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            HabitPulse
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Build Better Routines — For Freelancers
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8">
            Track your daily habits, build unstoppable streaks, and stay consistent with what matters most.
          </p>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 md:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
            Why HabitPulse?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="rounded-lg border border-slate-200 bg-white p-8">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Simple Daily Check-In
              </h3>
              <p className="text-slate-600">
                Tap once a day to mark your habits complete. No complexity, just consistency.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-slate-200 bg-white p-8">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Streak Tracking
              </h3>
              <p className="text-slate-600">
                Watch your streaks grow. The motivation to keep them alive is real.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-slate-200 bg-white p-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Weekly Summary
              </h3>
              <p className="text-slate-600">
                See your progress with a clear weekly breakdown. Track what's working.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border border-slate-200 bg-white p-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Free for 3 Habits
              </h3>
              <p className="text-slate-600">
                Start free with up to 3 habits. Upgrade to Pro for unlimited tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
            Simple Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="rounded-lg border border-slate-200 bg-white p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Free</h3>
              <p className="text-4xl font-bold text-primary mb-6">$0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Up to 3 habits
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Streak tracking
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Daily check-in
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Weekly summary
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full rounded-lg border border-primary bg-white px-6 py-3 text-center font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="rounded-lg border-2 border-primary bg-white p-8 relative">
              <div className="absolute -top-4 left-8 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Pro</h3>
              <p className="text-4xl font-bold text-primary mb-6">$9/mo</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Unlimited habits
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Everything in Free
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Weekly email summaries
                </li>
                <li className="flex items-center text-slate-600">
                  <span className="text-primary font-bold mr-3">✓</span>
                  Export habit data
                </li>
              </ul>
              <Link
                href="/login"
                className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Start Free, Upgrade Later
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 md:py-28 bg-slate-900 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to build better habits?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Start tracking today. Free for up to 3 habits, no credit card required.
          </p>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
          <p>© 2026 HabitPulse. Built for freelancers who value consistency.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <a href="mailto:hello@habitpulse.app" className="hover:text-slate-900 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
