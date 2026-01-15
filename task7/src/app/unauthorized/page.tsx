import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

