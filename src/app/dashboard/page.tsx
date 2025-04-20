"use client";

import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import AuthGuard from "@/components/layout/AuthGuard";
import { useAuthStore } from "@/store/authStore";

// Define a basic type for the user data expected from the API
interface UserData {
  full_name?: string;
  email?: string;
  // Add other fields as needed from your backend User schema
}

const DashboardPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token); // Get token from store

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        // AuthGuard should handle redirect, but good to double-check
        console.log("No token found, skipping fetch.");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`;

      try {
        // TODO: Replace with a proper API client if you have one
        const response = await fetch(apiUrl, { // Use the full API URL
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
             // Handle unauthorized, maybe logout user
             console.error("Unauthorized fetching user data.");
             setError("Failed to fetch user data: Unauthorized.");
             // Potentially call logout action from authStore here
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        const data: UserData = await response.json();
        setUserData(data);
      } catch (err: any) {
        console.error("Failed to fetch user data:", err);
        setError(err.message || "An unexpected error occurred.");
      }
    };

    fetchUserData();
  }, [token]); // Re-run effect if token changes

  return (
    <AuthGuard>
      <AuthenticatedLayout>
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        {error && <p className="text-red-500">Error: {error}</p>}
        {userData ? (
          <p>Welcome, {userData.full_name || "User"}!</p>
        ) : (
          !error && <p>Loading user data...</p> // Show loading only if no error
        )}
        {/* Placeholder for other dashboard content */}
        <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground">
          <p>Your dashboard content will go here.</p>
          <p>Access core features from the sidebar.</p>
        </div>
      </AuthenticatedLayout>
    </AuthGuard>
  );
};

export default DashboardPage; 