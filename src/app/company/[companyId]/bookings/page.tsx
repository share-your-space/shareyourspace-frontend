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
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/base";

export default function BookingsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token || !companyId) {
        setLoading(false);
        setError("Authentication token or company ID not found.");
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/company/${companyId}/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBookings(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchBookings();
    }
  }, [token, companyId]);

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
