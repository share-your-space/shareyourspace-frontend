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
import { UserRole, ContactVisibility } from "@/types/enums";
import { WorkstationStatus, WorkstationType } from "@/types/workstation";

const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    start_date: new Date('2023-10-01T09:00:00Z').toISOString(),
    end_date: new Date('2023-10-01T17:00:00Z').toISOString(),
    user: {
      id: 'user-101',
      full_name: 'Alice Johnson',
      email: 'alice@example.com',
      profile: {
        id: 'profile-101',
        user_id: 'user-101',
        role: UserRole.FREELANCER,
        first_name: 'Alice',
        last_name: 'Johnson',
        full_name: 'Alice Johnson',
        title: 'Creative Designer',
        bio: 'Creative designer.',
        profile_picture_url: 'https://i.pravatar.cc/150?u=alice',
        skills_expertise: ['Graphic Design', 'Branding'],
        industry_focus: ['Marketing', 'Web Design'],
        tools_technologies: ['Adobe Creative Suite', 'Figma'],
        linkedin_profile_url: 'https://linkedin.com/in/alice',
        contact_info_visibility: ContactVisibility.CONNECTIONS,
      },
    },
    workstation: {
      id: 'ws-201',
      name: 'Hot Desk #12',
      type: WorkstationType.HOT_DESK,
      status: WorkstationStatus.OCCUPIED,
    },
    status: 'CONFIRMED',
  },
  {
    id: 'booking-2',
    start_date: new Date('2023-10-02T10:00:00Z').toISOString(),
    end_date: null,
    user: {
      id: 'user-102',
      full_name: 'Bob Williams',
      email: 'bob@startup.io',
      profile: {
        id: 'profile-102',
        user_id: 'user-102',
        role: UserRole.STARTUP_MEMBER,
        first_name: 'Bob',
        last_name: 'Williams',
        full_name: 'Bob Williams',
        title: 'Founder',
        bio: 'Founder of a cool tech startup.',
        profile_picture_url: 'https://i.pravatar.cc/150?u=bob',
        skills_expertise: ['Leadership', 'Product Management'],
        industry_focus: ['SaaS', 'Fintech'],
        tools_technologies: ['Jira', 'Notion'],
        linkedin_profile_url: 'https://linkedin.com/in/bob',
        contact_info_visibility: ContactVisibility.PUBLIC,
      },
    },
    workstation: {
      id: 'ws-205',
      name: 'Private Office #3',
      type: WorkstationType.PRIVATE_OFFICE,
      status: WorkstationStatus.OCCUPIED,
    },
    status: 'CONFIRMED',
  },
  {
    id: 'booking-3',
    start_date: new Date('2023-10-03T09:00:00Z').toISOString(),
    end_date: new Date('2023-10-03T12:00:00Z').toISOString(),
    user: {
      id: 'user-103',
      full_name: 'Charlie Brown',
      email: 'charlie@freelance.com',
      profile: {
        id: 'profile-103',
        user_id: 'user-103',
        role: UserRole.FREELANCER,
        first_name: 'Charlie',
        last_name: 'Brown',
        full_name: 'Charlie Brown',
        title: 'Frontend Developer',
        bio: 'Frontend developer.',
        profile_picture_url: 'https://i.pravatar.cc/150?u=charlie',
        skills_expertise: ['React', 'TypeScript', 'Next.js'],
        industry_focus: ['Web Development', 'E-commerce'],
        tools_technologies: ['VS Code', 'GitHub'],
        linkedin_profile_url: 'https://linkedin.com/in/charlie',
        contact_info_visibility: ContactVisibility.CONNECTIONS,
      },
    },
    workstation: {
      id: 'ws-202',
      name: 'Hot Desk #15',
      type: WorkstationType.HOT_DESK,
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
