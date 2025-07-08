"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api"; // Import the api client
import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';
import { type User } from "@/types/auth";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Use the api client for login (it handles base URL and content type)
      const response = await api.post(
        '/auth/login',
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
             // Override Content-Type for this specific request
             'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data; // axios puts data directly in .data

      if (!data.access_token) {
        throw new Error(data.detail || "Login failed. No token received.");
      }

      // --- CRITICAL FIX: Set token in api client BEFORE making next request ---
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

      // After getting the token, get user info and store it
      // This ensures the user state is immediately populated on login
      const userResponse = await api.get('/users/me/profile');
      
      login(response.data.access_token, userResponse.data);

      toast.success('Login successful!', {
        duration: 3000,
      });

      router.push("/dashboard"); // Redirect to dashboard

    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UnauthenticatedLayout>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account.
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password" // Link to the forgot password page
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
           <CardFooter className="flex flex-col items-center text-sm">
            <div>
              Don't have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </UnauthenticatedLayout>
  );
} 