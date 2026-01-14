import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { ConnectionsList } from "@/components/connections-list";
import { QRScanner } from "@/components/qr-scanner";
import { Nav } from "@/components/nav";

export default async function ConnectionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Connections</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your connections
            </p>
          </div>
          <QRScanner />
        </div>

        <ConnectionsList />
      </div>
    </div>
    </div>
  );
}
