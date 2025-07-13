"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Booking } from "@/types/booking";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { UserRole } from "@/types/auth";
import { WorkstationStatus, WorkstationType } from "@/types/workstation";

const mockBookings: Booking[] = [
  {
    id: 1,
    start_date: new Date('2023-10-01T09:00:00Z').toISOString(),
    end_date: new Date('2023-10-01T17:00:00Z').toISOString(),
    user: {
      id: 101,
      full_name: 'Alice Johnson',
      email: 'alice@example.com',
      profile: {
        id: 101,
        user_id: 101,
        role: UserRole.FREELANCER,
        bio: 'Creative designer.',
        location: 'New York, USA',
        website: 'https://alice.design',
        profile_picture_url: 'https://i.pravatar.cc/150?u=alice',
        interests: [],
        is_profile_complete: true,
      },
    },
    workstation: {
      id: 201,
      name: 'Hot Desk #12',
      type: WorkstationType.HOT_DESK,
      status: WorkstationStatus.OCCUPIED,
    },
    status: 'CONFIRMED',
  },
  {
    id: 2,
    start_date: new Date('2023-10-02T10:00:00Z').toISOString(),
    end_date: null,
    user: {
      id: 102,
      full_name: 'Bob Williams',
      email: 'bob@startup.io',
      profile: {
        id: 102,
        user_id: 102,
        role: UserRole.STARTUP,
        bio: 'Founder of a cool tech startup.',
        location: 'San Francisco, USA',
        website: 'https://startup.io',
        profile_picture_url: 'https://i.pravatar.cc/150?u=bob',
        interests: [],
        is_profile_complete: true,
      },
    },
    workstation: {
      id: 205,
      name: 'Private Office #3',
      type: WorkstationType.PRIVATE_OFFICE,
      status: WorkstationStatus.OCCUPIED,
    },
    status: 'CONFIRMED',
  },
  {
    id: 3,
    start_date: new Date('2023-10-03T09:00:00Z').toISOString(),
    end_date: new Date('2023-10-03T12:00:00Z').toISOString(),
    user: {
      id: 103,
      full_name: 'Charlie Brown',
      email: 'charlie@freelance.com',
      profile: {
        id: 103,
        user_id: 103,
        role: UserRole.FREELANCER,
        bio: 'Frontend developer.',
        location: 'London, UK',
        website: 'https://charlie.dev',
        profile_picture_url: 'https://i.pravatar.cc/150?u=charlie',
        interests: [],
        is_profile_complete: true,
      },
    },
    workstation: {
      id: 202,
      name: 'Hot Desk #15',
      type: WorkstationType.HOT_DESK,
      status: WorkstationStatus.AVAILABLE,
    },
    status: 'PENDING',
  },
  {
    id: 4,
    start_date: new Date('2023-09-28T14:00:00Z').toISOString(),
    end_date: new Date('2023-09-28T18:00:00Z').toISOString(),
    user: {
      id: 101,
      full_name: 'Alice Johnson',
      email: 'alice@example.com',
      profile: {
        id: 101,
        user_id: 101,
        role: UserRole.FREELANCER,
        bio: 'Creative designer.',
        location: 'New York, USA',
        website: 'https://alice.design',
        profile_picture_url: 'https://i.pravatar.cc/150?u=alice',
        interests: [],
        is_profile_complete: true,
      },
    },
    workstation: {
      id: 210,
      name: 'Private Desk #5',
      type: WorkstationType.PRIVATE_DESK,
      status: WorkstationStatus.AVAILABLE,
    },
    status: 'CANCELLED',
  },
];


export default function BookingsPage() {
  const bookings = mockBookings;

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
          <DataTable columns={columns} data={bookings} />
        </CardContent>
      </Card>
    </div>
  );
}
