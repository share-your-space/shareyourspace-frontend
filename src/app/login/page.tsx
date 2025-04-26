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
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api"; // Import the api client

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore(); // Get setUser action
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

      // --- Update Zustand Store --- 
      setToken(data.access_token);
      console.log("Login Successful, Token stored.");

      // --- Fetch User Details AFTER setting token --- 
      try {
          const userResponse = await api.get('/users/me'); // api client now uses the token
          setUser(userResponse.data); // Update user state
          console.log("User data fetched and stored:", userResponse.data);
      } catch (userFetchError: any) {
          console.error("Failed to fetch user data after login:", userFetchError);
          // Decide how to handle this - maybe logout? Or proceed but show error?
          setError("Login successful, but failed to fetch user details.");
          setIsLoading(false);
          // Clear token if fetch fails? Optional.
          // logout();
          return; // Stop execution here if user fetch fails
      }
      // -------------------------

      router.push("/dashboard"); // Redirect to dashboard on successful login AND user fetch

    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
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
  );
} 