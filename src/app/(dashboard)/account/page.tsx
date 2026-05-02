"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  id: string;
  email: string;
  tier: "free" | "pro";
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      // Get profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, tier, created_at")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        // Fallback to auth user data if profile not found
        setProfile({
          id: user.id,
          email: user.email || "",
          tier: "free",
          created_at: user.created_at,
        });
      } else {
        setProfile({
          id: profileData.id,
          email: profileData.email || user.email || "",
          tier: profileData.tier,
          created_at: profileData.created_at,
        });
      }
    } catch (err) {
      setError("Couldn't load your account. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      router.push("/");
    } catch (err) {
      setError("Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-slate-200 rounded-lg w-32 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="h-5 bg-slate-200 rounded-lg w-24 animate-pulse mb-3" />
            <div className="h-6 bg-slate-200 rounded-lg w-48 animate-pulse" />
          </div>

          <div className="card">
            <div className="h-5 bg-slate-200 rounded-lg w-24 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Couldn&apos;t load your account</h2>
        <p className="text-slate-600 text-center mb-6">{error}</p>
        <button
          onClick={fetchProfile}
          className="h-11 px-6 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-slate-600">No account data available</p>
      </div>
    );
  }

  const accountAge = Math.floor(
    (new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Account</h1>

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Section */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Profile</h2>
        <div>
          <p className="text-xs md:text-sm font-semibold text-slate-600 mb-1">Email</p>
          <p className="text-base md:text-lg font-semibold text-slate-900">{profile.email}</p>
        </div>
        <div>
          <p className="text-xs md:text-sm font-semibold text-slate-600 mb-1">Member Since</p>
          <p className="text-base md:text-lg font-semibold text-slate-900">
            {new Date(profile.created_at).toLocaleDateString()} ({accountAge} days)
          </p>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-semibold text-slate-600 mb-1">Current Tier</p>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                profile.tier === "pro"
                  ? "bg-primary text-white"
                  : "bg-slate-200 text-slate-900"
              }`}>
                {profile.tier.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {profile.tier === "free" && (
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">
              <span className="font-semibold">Free tier:</span> Up to 3 habits, streak tracking, daily check-in, weekly summary
            </p>
            <button
              disabled
              className="w-full h-11 rounded-lg bg-primary/10 text-primary font-semibold text-base opacity-50 cursor-not-allowed"
            >
              Upgrade Coming Soon
            </button>
          </div>
        )}

        {profile.tier === "pro" && (
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-4">
              You&apos;re pro! All features unlocked including unlimited habits and weekly email summaries.
            </p>
            <button
              disabled
              className="w-full h-11 rounded-lg border border-slate-300 text-slate-900 font-semibold text-base hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Manage Subscription
            </button>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="card space-y-3">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full h-11 rounded-lg bg-red-600 text-white font-semibold text-base hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoggingOut && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
