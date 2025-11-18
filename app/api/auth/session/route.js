import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const cookie = req.cookies.get('manageable_session');
    if (!cookie) return NextResponse.json({ user: null });
    const raw = decodeURIComponent(cookie.value || '');
    const user = JSON.parse(raw || '{}');
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ user: null });
  }
}
