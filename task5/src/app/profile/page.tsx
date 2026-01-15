import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { ProfileForm } from "@/components/profile-form";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { Nav } from "@/components/nav";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile and share your QR code
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ProfileForm user={user} />
          <QRCodeDisplay />
        </div>
      </div>
    </div>
    </div>
  );
}
