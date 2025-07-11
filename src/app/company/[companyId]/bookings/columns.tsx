"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Booking } from "@/types/booking"
import { format } from 'date-fns';

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "workstation.name",
    header: "Workstation",
  },
  {
    accessorKey: "user.profile.full_name",
    header: "Tenant",
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
        const date = row.getValue("start_date") as string;
        return format(new Date(date), "PPP");
    }
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
        const date = row.getValue("end_date") as string | null;
        return date ? format(new Date(date), "PPP") : <span className="text-muted-foreground">Active</span>;
    }
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
        const isActive = !row.original.end_date;
        return isActive ? (
            <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
                Active
            </span>
        ) : (
            <span className="px-2 py-1 font-semibold leading-tight text-gray-700 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-100">
                Ended
            </span>
        );
    }
  }
]
