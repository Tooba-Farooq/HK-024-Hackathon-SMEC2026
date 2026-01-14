import { db } from "../src/db";
import { user as authUser } from "../src/db/auth-schema";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "../src/db/auth-schema";

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

async function seedAdmin() {
  try {
    console.log("Starting admin seed...");

    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(authUser)
      .where(eq(authUser.email, "admin"))
      .limit(1);

    if (existingAdmin.length > 0) {
      const adminUserId = existingAdmin[0].id;
      
      // Check if user role exists
      const existingUserRole = await db
        .select()
        .from(users)
        .where(eq(users.userId, adminUserId))
        .limit(1);

      if (existingUserRole.length > 0) {
        // Update role to admin if not already
        if (existingUserRole[0].role !== "admin") {
          await db
            .update(users)
            .set({ role: "admin" })
            .where(eq(users.userId, adminUserId));
          console.log("Admin role updated for existing user");
        } else {
          console.log("Admin user already exists with correct role");
        }
        return;
      } else {
        // Create user role entry
        await db.insert(users).values({
          userId: adminUserId,
          role: "admin",
        });
        console.log("Admin role created for existing user");
        return;
      }
    }

    // Create admin user using Better Auth
    // Note: Better Auth requires password hashing, so we'll need to use the API
    // For now, we'll create the user directly in the database with a hashed password
    // In production, you should use Better Auth's signUp API
    
    console.log("Please create admin user manually through the signup page, then run this script again.");
    console.log("Or use Better Auth API to create the user programmatically.");
    
    // Alternative: Create user directly (requires password hashing)
    // This is a simplified approach - in production, use Better Auth's API
    const userId = `admin_${Date.now()}`;
    
    await db.insert(authUser).values({
      id: userId,
      name: "Admin",
      email: "admin",
      emailVerified: true,
    });

    // Create account with password
    // Note: This requires proper password hashing from Better Auth
    // For now, we'll create the user role entry
    await db.insert(users).values({
      userId: userId,
      role: "admin",
    });

    console.log("Admin user created. Please set password through Better Auth API or signup flow.");
    
  } catch (error) {
    console.error("Error seeding admin:", error);
    throw error;
  }
}

seedAdmin()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
