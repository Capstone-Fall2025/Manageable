import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || null;
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

    return NextResponse.json({
      clientId,
      hasClientSecret,
      appUrl,
      redirectUri,
    });
  } catch (e) {
    return NextResponse.json({ error: 'debug_failed' }, { status: 500 });
  }
}
