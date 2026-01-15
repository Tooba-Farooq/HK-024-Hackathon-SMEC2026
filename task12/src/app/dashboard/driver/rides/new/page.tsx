import { requireDriver } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostRideForm } from "./post-ride-form";

export default async function PostRidePage() {
  const { user, role } = await requireDriver();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-black">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            asChild
            variant="outline"
            className="mb-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
          >
            <Link href="/dashboard/driver">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent">
            Post New Ride
          </h1>
          <p className="text-gray-600 mt-2">Create a new ride and start sharing!</p>
        </div>

        {/* Form Card */}
        <Card className="border-red-200 bg-white">
          <CardHeader>
            <CardTitle>Ride Details</CardTitle>
            <CardDescription>
              Fill in the details of your ride. Only one active ride can be open at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostRideForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
