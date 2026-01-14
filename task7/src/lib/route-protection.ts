import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth-server";

export async function protectRoute(redirectTo?: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(redirectTo || "/login");
  }

  return { user };
}
