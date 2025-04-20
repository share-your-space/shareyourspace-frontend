import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button
import { useAuthStore } from "@/store/authStore"; // Assuming Zustand store
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Bell,
  MessageSquare,
  User,
  Gift,
  Settings,
  LogOut,
} from "lucide-react"; // Icons

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
}) => {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Placeholder for navigation items
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/discover", label: "Discover Connections", icon: Users },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/chat", label: "Chats", icon: MessageSquare },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/referrals", label: "Referrals", icon: Gift },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border p-4">
        <div className="mb-6 text-2xl font-bold">ShareYourSpace</div>
        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout; 