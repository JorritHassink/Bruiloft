import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Delete an invitation
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const { id } = await params;

  try {
    // Delete associated RSVP first
    await prisma.rsvp.deleteMany({ where: { invitationId: id } });
    await prisma.invitation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
}
