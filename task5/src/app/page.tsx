import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { QRScanner } from "@/components/qr-scanner";

export default async function Home() {
  const user = await getCurrentUser();
  
  if (user) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
              <p className="text-muted-foreground">
                Connect with others by scanning or sharing QR codes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your QR Code</h2>
                <QRCodeDisplay />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Scan QR Code</h2>
                <div className="flex items-center justify-center h-full">
                  <QRScanner />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/connections">View Connections</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            QR Chat
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Connect instantly by scanning QR codes. No usernames needed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
