"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserRoleAction } from "@/serverActions/auth/actions";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "passenger" | "driver">("passenger");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Login failed");
        setLoading(false);
        return;
      }

      // Wait a bit for session to be established
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check user role using server action
      const roleResult = await getUserRoleAction();

      if (roleResult.error) {
        setError(roleResult.error);
        setLoading(false);
        return;
      }

      const userRole = roleResult.role;

      if (!userRole) {
        setError("User role not found. Please contact support.");
        setLoading(false);
        return;
      }

      // Verify role matches selected role
      if (userRole !== role) {
        setError(`Please login as ${userRole}`);
        await authClient.signOut();
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (userRole === "admin") {
        router.push("/dashboard/admin");
      } else if (userRole === "driver") {
        router.push("/dashboard/driver");
      } else {
        router.push("/dashboard/passenger");
      }
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-black p-4">
      <div className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-slate-800/90">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <Tabs value={role} onValueChange={(v) => setRole(v as "admin" | "passenger" | "driver")}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="passenger">Passenger</TabsTrigger>
                    <TabsTrigger value="driver">Driver</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                href="/signup"
                className="text-red-600 hover:text-red-700 font-medium hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

