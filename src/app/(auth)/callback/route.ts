import { NextRequest, NextResponse } from "next/server";

// Redirect to the canonical auth callback at /api/auth/callback
// Supabase magic links should be configured to use /api/auth/callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const origin = new URL(request.url).origin;

  const redirectUrl = new URL("/api/auth/callback", origin);
  if (code) {
    redirectUrl.searchParams.set("code", code);
  }

  return NextResponse.redirect(redirectUrl);
}
