import { NextResponse } from "next/server";

// Helper to create a response that sets a HttpOnly cookie
function setSessionCookie(user) {
  const res = NextResponse.redirect('/home');
  // store minimal JSON in cookie (not encrypted). For production consider signing/encrypting.
  const payload = JSON.stringify({ email: user.email || '', name: user.name || '' });
  // set cookie; path=/ so it's available site-wide; httpOnly and sameSite lax for basic protection
  res.cookies.set({
    name: 'manageable_session',
    value: encodeURIComponent(payload),
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    // secure should be true in production (requires HTTPS)
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect("/login?error=missing_code");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return NextResponse.redirect("/login?error=token_failed");
  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;
  if (!accessToken) return NextResponse.redirect("/login?error=no_token");

  // Fetch user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!userRes.ok) return NextResponse.redirect("/login?error=userinfo_failed");
  const user = await userRes.json();

  // Set a HttpOnly cookie with basic user info, then redirect to /home
  return setSessionCookie(user);
}
