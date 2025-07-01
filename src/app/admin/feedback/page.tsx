"use client";

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
// Assume fetchWithAuth: import { fetchWithAuth } from "@/lib/fetchWithAuth";

const fetchFeedback = async (filters: any) => {
  console.log("Fetching feedback with filters:", filters);
  // const queryParams = new URLSearchParams(filters).toString();
  // return fetchWithAuth(`/api/v1/admin/feedback?${queryParams}`);
  return [
    { id: "fb1", userId: "3", userEmail: "startup@example.com", category: "Feature Suggestion", text: "It would be great to have dark mode for the dashboard.", status: "New", submittedAt: new Date(Date.now() - 86400000).toISOString() }, // 1 day ago
    { id: "fb2", userId: "4", userEmail: "joe@example.com", category: "Bug Report", text: "The profile picture upload is not working on Firefox.", status: "In Progress", submittedAt: new Date(Date.now() - 172800000).toISOString() }, // 2 days ago
    { id: "fb3", userId: "2", userEmail: "corp@example.com", category: "General Comment", text: "Great platform, very useful!", status: "Resolved", submittedAt: new Date(Date.now() - 259200000).toISOString() }, // 3 days ago
  ];
};

const updateFeedbackStatus = async (feedbackId: string, status: string) => {
  console.log(`Updating feedback ${feedbackId} to status ${status}`);
  // return fetchWithAuth(`/api/v1/admin/feedback/${feedbackId}/status`, { method: "PUT", body: JSON.stringify({ status }) });
  return { success: true };
};

interface FeedbackItem {
  id: string;
  userId?: string;
  userEmail?: string; // Denormalized for display
  category: string;
  text: string;
  status: "New" | "In Progress" | "Resolved";
  submittedAt: string;
}

const feedbackCategories = ["Bug Report", "Feature Suggestion", "Matching Quality", "General Comment"];
const feedbackStatuses: FeedbackItem["status"][] = ["New", "In Progress", "Resolved"];

export default function FeedbackInboxPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [categoryFilter, statusFilter]);

  const loadFeedback = async () => {
    const filters: any = {};
    if (categoryFilter) filters.category = categoryFilter;
    if (statusFilter) filters.status = statusFilter;
    const items = await fetchFeedback(filters);
    setFeedbackItems(items);
  };

  const handleStatusUpdate = async (feedbackId: string, status: FeedbackItem["status"]) => {
    await updateFeedbackStatus(feedbackId, status);
    loadFeedback();
  };

  const getStatusBadgeVariant = (status: FeedbackItem["status"]) => {
    switch (status) {
      case "New": return "destructive";
      case "In Progress": return "outline";
      case "Resolved": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feedback Inbox</h1>

      <div className="flex gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{categoryFilter || "Category"} <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setCategoryFilter(null)}>All Categories</DropdownMenuItem>
            {feedbackCategories.map(cat => (
              <DropdownMenuItem key={cat} onSelect={() => setCategoryFilter(cat)}>{cat}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{statusFilter || "Status"} <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
            {feedbackStatuses.map(stat => (
              <DropdownMenuItem key={stat} onSelect={() => setStatusFilter(stat)}>{stat}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-[40%]">Feedback</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbackItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.userEmail || item.userId || "Anonymous"}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="whitespace-pre-wrap break-words">{item.text}</TableCell>
              <TableCell>{new Date(item.submittedAt).toLocaleDateString()}</TableCell>
              <TableCell><Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge></TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">Update Status <ChevronDown className="ml-1 h-3 w-3"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {feedbackStatuses.map(status => (
                      <DropdownMenuItem 
                        key={status} 
                        onSelect={() => handleStatusUpdate(item.id, status)}
                        disabled={item.status === status}
                      >
                        Mark as {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* TODO: Add link to internal task tracker if applicable */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {feedbackItems.length === 0 && <p className="text-center py-4">No feedback items found.</p>}
    </div>
  );
} 