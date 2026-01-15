import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { user as authUser } from "@/db/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createUserWithRole } from "@/lib/rbac";

export async function POST() {
  const headersList = await headers();
  try {
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    // Check if admin user already exists in auth table
    const [existingAuthUser] = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, adminEmail))
      .limit(1);

    let adminUserId: string;

    if (existingAuthUser) {
      adminUserId = existingAuthUser.id;

      // Check if role already exists
      const [existingUserRole] = await db
        .select()
        .from(users)
        .where(eq(users.userId, adminUserId))
        .limit(1);

      if (existingUserRole) {
        if (existingUserRole.role !== "admin") {
          // Update role to admin
          await db
            .update(users)
            .set({ role: "admin" })
            .where(eq(users.userId, adminUserId));

          return NextResponse.json({
            message: "Admin role created for existing user",
          });
        } else {
          return NextResponse.json({
            message: "Admin user already exists with correct role",
          });
        }
      } else {
        // Create role entry
        await createUserWithRole(adminUserId, "admin");
        return NextResponse.json({
          message: "Admin role created for existing user",
        });
      }
    } else {
      // Create new admin user using Better Auth
      try {
        const result = await auth.api.signUpEmail({
          headers: headersList,
          body: {
            email: adminEmail,
            password: adminPassword,
            name: "Admin",
          },
        });

        if (result.error) {
          return NextResponse.json(
            { error: result.error.message || "Failed to create admin user" },
            { status: 400 }
          );
        }

        if (result.data?.user) {
          adminUserId = result.data.user.id;

          // Wait a bit for the user to be fully created
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Create role entry
          try {
            await createUserWithRole(adminUserId, "admin");
          } catch (roleError: any) {
            // If role already exists, that's okay
            if (
              roleError?.code !== "23505" &&
              !roleError?.message?.includes("duplicate")
            ) {
              throw roleError;
            }
          }

          return NextResponse.json({
            message: "Admin user created successfully",
            email: adminEmail,
            password: adminPassword,
          });
        } else {
          return NextResponse.json(
            { error: "Failed to create admin user" },
            { status: 500 }
          );
        }
      } catch (error: any) {
        console.error("Error creating admin:", error);
        return NextResponse.json(
          { error: error.message || "Failed to create admin user" },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("Error in admin seed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
