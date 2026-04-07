import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Admin wachtwoord niet geconfigureerd" }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  const token = hashPassword(adminPassword + "bruiloft-secret-salt");

  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  return NextResponse.json({ success: true });
}
