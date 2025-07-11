"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Booking } from "@/types/booking";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setLoading(false);
        setError("Authentication token not found.");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/corp-admin/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-3 h-6 w-6" />
            Bookings
          </CardTitle>
          <CardDescription>
            View and manage all workstation bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <DataTable columns={columns} data={bookings} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
