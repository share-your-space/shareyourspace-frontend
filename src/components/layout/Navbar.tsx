import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell } from "lucide-react"

// Placeholder function to check auth state (replace with actual logic)
const useIsAuthenticated = () => {
  // In a real app, check Zustand store, context, or session
  return false; // Assume not logged in for now
}

const Navbar = () => {
  const isAuthenticated = useIsAuthenticated(); // Check auth state

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo/Brand Name */}
        <Link href="/" className="text-lg font-bold">
          ShareYourSpace
        </Link>

        {/* Navigation Links (Placeholder) - Hidden below md breakpoint */}
        <div className="hidden md:flex space-x-4 lg:space-x-6">
          <Link href="/#benefits" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors">
            Benefits
          </Link>
          {/* Conditionally show Discover link? */}
          {isAuthenticated && (
            <Link href="/discover" className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors">
              Discover
            </Link>
          )}
          {/* Add more links as needed */}
        </div>

        {/* Auth Buttons & Theme Toggle */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Notification Bell - Show when authenticated */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {/* Optional: Add a badge for unread notifications */}
                    {/* <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span> */}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        You have 3 unread messages.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      {/* Placeholder Notification Items */}
                      <div className="flex items-start space-x-4 rounded-md p-2 border">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Connection Request
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Alex Johnson wants to connect.
                          </p>
                        </div>
                      </div>
                       <div className="flex items-start space-x-4 rounded-md p-2 border">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Welcome!
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Complete your profile to get started.
                          </p>
                        </div>
                      </div>
                      {/* Add more placeholders... */}
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <Button variant="outline" size="sm">Mark all as read</Button>
                      <Button variant="link" size="sm" asChild>
                        <Link href="/notifications">View all</Link>
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* TODO: Replace Login/Signup with User Menu/Logout when authenticated */}
              <Button size="sm">Account</Button> 
            </>
          ) : (
            <>
              {/* Login/Signup Buttons - Show when not authenticated */}
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 