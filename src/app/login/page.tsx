"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { UserRole } from "@/types/enums";
import { User } from "@/types/auth";

const mockUsers: { [key: string]: User } = {
  "corpadmin@example.com": {
    id: "1",
    email: "corpadmin@example.com",
    full_name: "Corporate Admin",
    role: UserRole.CORP_ADMIN,
    company_id: "1",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture_url: "https://i.pravatar.cc/150?u=corpadmin@example.com",
  },
  "corpmember@example.com": {
    id: "2",
    email: "corpmember@example.com",
    full_name: "Corporate Member",
    role: UserRole.CORP_MEMBER,
    company_id: "1",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture_url: "https://i.pravatar.cc/150?u=corpmember@example.com",
  },
  "startupadmin@example.com": {
    id: "3",
    email: "startupadmin@example.com",
    full_name: "Startup Admin",
    role: UserRole.STARTUP_ADMIN,
    company_id: "101",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture_url: "https://i.pravatar.cc/150?u=startupadmin@example.com",
  },
  "startupmember@example.com": {
    id: "4",
    email: "startupmember@example.com",
    full_name: "Startup Member",
    role: UserRole.STARTUP_MEMBER,
    company_id: "101",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture_url: "https://i.pravatar.cc/150?u=startupmember@example.com",
  },
  "freelancer@example.com": {
    id: "5",
    email: "freelancer@example.com",
    full_name: "Freelancer",
    role: UserRole.FREELANCER,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_picture_url: "https://i.pravatar.cc/150?u=freelancer@example.com",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("corpadmin@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Logging in...");

    setTimeout(() => {
      const user = mockUsers[email];

      if (user && password === "password123") {
        login("mock-jwt-token", user);
        toast.success("Login successful!", { id: toastId });
        router.push("/dashboard");
      } else {
        toast.error("Invalid email or password.", { id: toastId });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Use any password. Available emails:
            <ul className="list-disc pl-5 mt-2 text-left">
              {Object.keys(mockUsers).map((email) => (
                <li key={email}>
                  <code>{email}</code>
                </li>
              ))}
            </ul>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}