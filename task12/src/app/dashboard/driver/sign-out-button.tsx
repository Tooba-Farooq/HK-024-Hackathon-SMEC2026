"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <Button 
      onClick={handleSignOut} 
      variant="outline" 
      className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-200 font-medium px-6"
    >
      Sign Out
    </Button>
  );
}
