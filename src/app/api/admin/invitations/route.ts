import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Get all invitations
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const invitations = await prisma.invitation.findMany({
    include: { rsvp: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invitations);
}

// Create a new invitation
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, type, email, maxGuests } = body;

    if (!name || !type || !["dag", "avond"].includes(type)) {
      return NextResponse.json(
        { error: "Naam en type (dag/avond) zijn verplicht" },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.create({
      data: {
        name,
        type,
        email: email || null,
        maxGuests: maxGuests ? Number(maxGuests) : 2,
      },
    });

    return NextResponse.json(invitation);
  } catch {
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
