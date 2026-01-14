import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { db } from "@/db";
import { connection, user } from "@/db/auth-schema";
import { eq, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: scannedUserId } = await request.json();

    if (!scannedUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("Scanning QR code - Scanned User ID:", scannedUserId);
    console.log("Current User ID:", currentUser.id);

    if (scannedUserId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot connect to yourself" },
        { status: 400 }
      );
    }

    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, scannedUserId))
      .limit(1);

    console.log("Target user found:", targetUser.length > 0);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: `User not found with ID: ${scannedUserId}` },
        { status: 404 }
      );
    }

    const existingConnection = await db
      .select()
      .from(connection)
      .where(
        or(
          and(
            eq(connection.userId, currentUser.id),
            eq(connection.connectedUserId, scannedUserId)
          ),
          and(
            eq(connection.userId, scannedUserId),
            eq(connection.connectedUserId, currentUser.id)
          )
        )
      )
      .limit(1);

    if (existingConnection.length > 0) {
      return NextResponse.json(
        { error: "Connection already exists" },
        { status: 400 }
      );
    }

    await db.insert(connection).values({
      id: nanoid(),
      userId: currentUser.id,
      connectedUserId: scannedUserId,
    });

    return NextResponse.json({
      success: true,
      connectedUser: {
        id: targetUser[0].id,
        name: targetUser[0].name,
        email: targetUser[0].email,
        image: targetUser[0].image,
      },
    });
  } catch (error) {
    console.error("Error scanning QR code:", error);
    return NextResponse.json(
      { error: "Failed to process QR code" },
      { status: 500 }
    );
  }
}
