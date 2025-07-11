"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Booking } from "@/types/booking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const getInitials = (name?: string) =>
  name ? name.split(" ").map((n) => n[0]).join("") : "U";

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "tenant",
    header: "Tenant",
    cell: ({ row }) => {
      const tenant = row.original.tenant;
      return (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={tenant.avatarUrl} />
            <AvatarFallback>{getInitials(tenant.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{tenant.name}</div>
            <div className="text-sm text-muted-foreground">
              {tenant.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "workstation.name",
    header: "Workstation",
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => format(new Date(row.original.startTime), "PPpp"),
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => format(new Date(row.original.endTime), "PPpp"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === "CONFIRMED"
          ? "default"
          : status === "PENDING"
          ? "secondary"
          : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.id)}
            >
              Copy booking ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View tenant details</DropdownMenuItem>
            <DropdownMenuItem>View workstation details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
