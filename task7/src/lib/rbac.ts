import { getCurrentUser } from "./auth-server";
import { redirect } from "next/navigation";

export async function requireAuth(): Promise<{ id: string; email: string }> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
