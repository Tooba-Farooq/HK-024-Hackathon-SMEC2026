import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { db } from "@/db";
import { connection, user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        connectedAt: connection.createdAt,
      })
      .from(connection)
      .innerJoin(user, eq(connection.connectedUserId, user.id))
      .where(eq(connection.userId, currentUser.id));

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}
