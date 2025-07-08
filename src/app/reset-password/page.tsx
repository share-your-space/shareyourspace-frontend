"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';
import { resetPassword } from "@/lib/api/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
      // Consider redirecting or disabling the form
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
       setError("Invalid or missing reset token.");
       return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await resetPassword(token, password);

      setMessage("Password reset successfully! You can now log in.");
      // Optional: Redirect to login after a short delay
      // setTimeout(() => router.push('/login'), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isLoading || !token || !!message} // Disable if loading, no token, or success
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <PasswordInput
                id="confirm-password"
                required
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !token || !!message}
                autoComplete="new-password"
              />
            </div>
             {message && (
              <p className="text-sm font-medium text-green-600">{message}</p>
            )}
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !token || !!message}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            {message && (
                 <Link href="/login" className="text-sm underline">
                    Proceed to Login
                </Link>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// Wrap with Suspense because useSearchParams() needs it during initial render
export default function ResetPasswordPage() {
    return (
      <UnauthenticatedLayout>
        <Suspense fallback={<div>Loading...</div>}> 
            <ResetPasswordForm />
        </Suspense>
      </UnauthenticatedLayout>
    );
} 