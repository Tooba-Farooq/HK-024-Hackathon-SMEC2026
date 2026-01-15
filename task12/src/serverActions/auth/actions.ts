"use server";

import { getCurrentUser } from "@/lib/auth-server";
import { getUserRole, createUserWithRole, UserRole } from "@/lib/rbac";

export async function getUserRoleAction(): Promise<{ role: UserRole | null; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { role: null, error: "Unauthorized" };
    }

    const role = await getUserRole(user.id);
    return { role };
  } catch (error) {
    console.error("Error getting user role:", error);
    return { role: null, error: "Internal server error" };
  }
}

export async function createUserRoleAction(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!userId || !role) {
      return { success: false, error: "userId and role are required" };
    }

    if (role !== "admin" && role !== "passenger" && role !== "driver") {
      return { success: false, error: "Invalid role" };
    }

    // Verify the userId matches the current user
    if (userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    try {
      await createUserWithRole(userId, role);
    } catch (error: unknown) {
      // If user already exists, that's okay
      if (
        error instanceof Error &&
        (("code" in error && error.code === "23505") || error.message.includes("duplicate"))
      ) {
        return { success: true };
      }
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating user role:", error);
    return { success: false, error: "Internal server error" };
  }
}

