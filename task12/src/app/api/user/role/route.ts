import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserRole } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ role: null, error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(user.id);
    return NextResponse.json({ role });
  } catch (error) {
    console.error("Error getting user role:", error);
    return NextResponse.json({ role: null, error: "Internal server error" }, { status: 500 });
  }
}
