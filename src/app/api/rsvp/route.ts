import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invitationId, token, attending, guestCount, guestNames, dietaryNotes, remarks } = body;

    // Verify the token matches the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { rsvp: true },
    });

    if (!invitation || invitation.token !== token) {
      return NextResponse.json({ error: "Ongeldige uitnodiging" }, { status: 404 });
    }

    if (invitation.rsvp) {
      return NextResponse.json({ error: "Er is al een registratie voor deze uitnodiging" }, { status: 400 });
    }

    if (attending && guestCount > invitation.maxGuests) {
      return NextResponse.json(
        { error: `Maximaal ${invitation.maxGuests} gasten toegestaan` },
        { status: 400 }
      );
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        invitationId: invitation.id,
        attending: Boolean(attending),
        guestCount: attending ? Number(guestCount) : 0,
        guestNames: guestNames || null,
        dietaryNotes: dietaryNotes || null,
        remarks: remarks || null,
      },
    });

    return NextResponse.json({ success: true, rsvp });
  } catch {
    return NextResponse.json({ error: "Er ging iets mis" }, { status: 500 });
  }
}
