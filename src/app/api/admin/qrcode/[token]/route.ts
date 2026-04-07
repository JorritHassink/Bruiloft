import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  const { token } = await params;
  const url = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${url.protocol}//${url.host}`;
  const rsvpUrl = `${baseUrl}/rsvp/${token}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(rsvpUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#2c2c2c",
        light: "#faf8f5",
      },
    });

    return NextResponse.json({ qr: qrDataUrl, url: rsvpUrl });
  } catch {
    return NextResponse.json({ error: "QR code generatie mislukt" }, { status: 500 });
  }
}
