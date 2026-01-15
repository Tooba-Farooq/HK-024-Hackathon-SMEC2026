import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await getCurrentUser();
  
  if (user) {
    redirect("/feed");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <main className="flex flex-col items-center gap-8 text-center px-4 animate-in fade-in-0 zoom-in-95 duration-700">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TechShare
              </h1>
              <p className="text-sm text-muted-foreground">Knowledge Hub</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            Share your tech knowledge, connect with developers, and grow together
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
