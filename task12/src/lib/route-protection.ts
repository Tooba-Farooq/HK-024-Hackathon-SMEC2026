import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth-server";
import { getUserRole, UserRole } from "./rbac";

export interface ProtectedRouteConfig {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export async function protectRoute(config: ProtectedRouteConfig) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(config.redirectTo || "/login");
  }

  const role = await getUserRole(user.id);
  
  if (!role || !config.allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }

  return { user, role };
}

export const passengerRoutes = {
  allowedRoles: ["passenger"] as UserRole[],
  redirectTo: "/login",
};

export const driverRoutes = {
  allowedRoles: ["driver"] as UserRole[],
  redirectTo: "/login",
};

