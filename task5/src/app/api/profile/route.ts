import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData[0] });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, image } = await request.json();

    const updateData: { name?: string; image?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, currentUser.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
