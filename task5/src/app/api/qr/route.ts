import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import QRCode from "qrcode";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const qrCodeDataURL = await QRCode.toDataURL(user.id, {
      width: 300,
      margin: 2,
    });

    return NextResponse.json({ qrCode: qrCodeDataURL, userId: user.id });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
