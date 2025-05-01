"use client";

import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import AuthGuard from "@/components/layout/AuthGuard";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api"; // Import the api client

// Define a basic type for the user data expected from the API
interface UserData {
  full_name?: string;
  email?: string;
  // Add other fields as needed from your backend User schema
}

const DashboardPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token); // Token is used implicitly by api interceptor

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        // AuthGuard should handle redirect, but good to double-check
        console.log("No token found, skipping fetch.");
        return;
      }

      try {
        // Use the api client with the relative path
        const response = await api.get('/users/me');

        // Axios response data is directly in response.data
        const data: UserData = response.data;
        setUserData(data);
      } catch (err: any) {
        // Error handling can likely be simplified as the interceptor handles 401
        console.error("Failed to fetch user data:", err);
        // Check if error has response details (axios error format)
        setError(err.response?.data?.detail || err.message || "An unexpected error occurred.");
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