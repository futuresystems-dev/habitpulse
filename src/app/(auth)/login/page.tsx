"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("That doesn't look like an email address. Please try again.");
        setIsLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (authError) {
        setError("Something went wrong. Please try again or contact support.");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="card text-center">
        <div className="mb-4 text-4xl">✉️</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
        <p className="text-slate-600 mb-6">
          We've sent a magic link to <span className="font-semibold text-slate-900">{email}</span>.
        </p>
        <p className="text-sm text-slate-500 mb-6">
          The link will expire in 24 hours. If you don't see it, check your spam folder.
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            setEmail("");
          }}
          className="text-sm text-primary font-semibold hover:underline"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <Link href="/" className="text-xl font-bold text-primary">
          HabitPulse
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign In to HabitPulse</h1>
      <p className="text-slate-600 text-sm mb-6">
        We'll send you a magic link to sign in. No password needed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-normal text-slate-900 placeholder-slate-500 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
          />
          {error && (
            <p className="text-sm text-red-600 font-medium mt-2">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full h-11 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
          )}
          {isLoading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-600 text-center">
          New to HabitPulse?{" "}
          <span className="text-slate-600">Use the form above to get started.</span>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-primary font-semibold hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
