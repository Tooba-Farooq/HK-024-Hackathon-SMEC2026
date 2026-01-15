import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            QR Chat
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/connections">Connections</Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
