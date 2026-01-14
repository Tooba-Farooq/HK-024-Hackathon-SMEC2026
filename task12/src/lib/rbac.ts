import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "./auth-server";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "passenger" | "driver";

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);
    
    return user?.role as UserRole | null;
  } catch {
    return null;
  }
}

export async function createUserWithRole(
  userId: string,
  role: UserRole
): Promise<void> {
  try {
    await db.insert(users).values({
      userId,
      role,
    });
  } catch (error) {
    console.error("Error creating user with role:", error);
    throw error;
  }
}

export async function requireAuth(): Promise<{ id: string; email: string; name: string | null }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<{
  user: { id: string; email: string; name: string | null };
  role: UserRole;
}> {
  const user = await requireAuth();
  const role = await getUserRole(user.id);
  
  if (!role || !allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }
  
  return { user, role };
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}

export async function requirePassenger() {
  return requireRole(["passenger", "admin"]);
}

export async function requireDriver() {
  return requireRole(["driver", "admin"]);
}

export async function requireUser() {
  return requireRole(["passenger", "driver", "admin"]);
}

