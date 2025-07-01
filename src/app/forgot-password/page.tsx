"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';
import { requestPasswordReset } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await requestPasswordReset(email);
      
      // Display a generic success message regardless of whether the email exists 
      // to avoid revealing registered emails.
      setMessage(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
       // Optionally, display a generic error to avoid revealing information
      // setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnauthenticatedLayout>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we will send you a link to reset your
              password.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Link href="/login" className="text-sm underline">
                  Back to Login
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </UnauthenticatedLayout>
  );
} 