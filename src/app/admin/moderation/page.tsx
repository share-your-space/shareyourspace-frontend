"use client";

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, UserX, ShieldCheck, MessageCircleWarning } from "lucide-react";
// Assume fetchWithAuth: import { fetchWithAuth } from "@/lib/fetchWithAuth";

const fetchReports = async (filters: any) => {
  console.log("Fetching reports with filters:", filters);
  // const queryParams = new URLSearchParams(filters).toString();
  // return fetchWithAuth(`/api/v1/admin/moderation/reports?${queryParams}`);
  return [
    { id: "rep1", reporterId: "3", reporterEmail: "startup@example.com", reportedUserId: "4", reportedUserEmail: "joe@example.com", reportedMessageId: null, reason: "Spamming in chat with unsolicited offers.", status: "New", createdAt: new Date(Date.now() - 3600000).toISOString() }, // 1 hour ago
    { id: "rep2", reporterId: "2", reporterEmail: "corp@example.com", reportedUserId: null, reportedMessageId: "msgXYZ123", reason: "Inappropriate language used in a message.", status: "New", createdAt: new Date(Date.now() - 7200000).toISOString() }, // 2 hours ago
    { id: "rep3", reporterId: "4", reporterEmail: "joe@example.com", reportedUserId: "3", reportedUserEmail: "startup@example.com", reportedMessageId: null, reason: "Misleading profile information.", status: "Reviewed", createdAt: new Date(Date.now() - 86400000).toISOString() }, // 1 day ago
  ];
};

const updateReportStatus = async (reportId: string, status: string) => {
  console.log(`Updating report ${reportId} to status ${status}`);
  // return fetchWithAuth(`/api/v1/admin/moderation/reports/${reportId}/status`, { method: "PUT", body: JSON.stringify({ status }) });
  return { success: true };
};

const takeModerationAction = async (action: string, targetUserId?: string, reportId?: string) => {
  console.log(`Taking action: ${action} on targetUser: ${targetUserId} related to report: ${reportId}`);
  // Example: if (action === 'suspend') return fetchWithAuth(`/api/v1/admin/users/${targetUserId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'SUSPENDED' }) });
  if (reportId) await updateReportStatus(reportId, "Reviewed"); // Mark as reviewed after action
  return { success: true };
};

interface ReportItem {
  id: string;
  reporterId: string;
  reporterEmail?: string;
  reportedUserId?: string | null;
  reportedUserEmail?: string | null;
  reportedMessageId?: string | null;
  reason: string;
  status: "New" | "Reviewed";
  createdAt: string;
}

const reportStatuses: ReportItem["status"][] = ["New", "Reviewed"];

export default function ModerationQueuePage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>("New"); // Default to New reports

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    const items = await fetchReports(filters);
    setReports(items);
  };

  const handleUpdateStatus = async (reportId: string, status: ReportItem["status"]) => {
    await updateReportStatus(reportId, status);
    loadReports();
  };
  
  const handleAction = async (action: string, report: ReportItem) => {
    if (!confirm(`Are you sure you want to ${action} based on report ${report.id}?`)) return;
    await takeModerationAction(action, report.reportedUserId || undefined, report.id);
    loadReports(); // Refresh list
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Moderation Queue</h1>

      <div className="flex gap-2 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{statusFilter || "Status"} <ChevronDown className="ml-2 h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
            {reportStatuses.map(stat => (
              <DropdownMenuItem key={stat} onSelect={() => setStatusFilter(stat)}>{stat}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reported By</TableHead>
            <TableHead>Target</TableHead>
            <TableHead className="w-[35%]">Reason</TableHead>
            <TableHead>Reported At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.reporterEmail || report.reporterId}</TableCell>
              <TableCell>
                {report.reportedUserEmail || report.reportedUserId || "N/A"}
                {report.reportedMessageId && <span className="text-xs block text-muted-foreground">(Message ID: {report.reportedMessageId})</span>}
              </TableCell>
              <TableCell className="whitespace-pre-wrap break-words">{report.reason}</TableCell>
              <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
              <TableCell><Badge variant={report.status === "New" ? "destructive" : "secondary"}>{report.status}</Badge></TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">Actions <ChevronDown className="ml-1 h-3 w-3"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {report.status === "New" && <DropdownMenuItem onSelect={() => handleUpdateStatus(report.id, "Reviewed")}>Mark as Reviewed</DropdownMenuItem>}
                    {report.reportedUserId && (
                        <DropdownMenuItem onSelect={() => handleAction("warn_user", report)} className="text-yellow-600">
                            <MessageCircleWarning className="mr-2 h-4 w-4"/> Warn User (Manual Email)
                        </DropdownMenuItem>
                    )}
                    {report.reportedUserId && (
                        <DropdownMenuItem onSelect={() => handleAction("suspend_user", report)} className="text-orange-600">
                            <UserX className="mr-2 h-4 w-4"/> Suspend User
                        </DropdownMenuItem>
                    )}
                    {report.reportedUserId && (
                        <DropdownMenuItem onSelect={() => handleAction("ban_user", report)} className="text-red-600">
                            <UserX className="mr-2 h-4 w-4"/> Ban User
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => alert("Dismiss report (no action). Future: Will set status to Dismissed.") }>
                        <ShieldCheck className="mr-2 h-4 w-4"/> Dismiss Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {reports.length === 0 && <p className="text-center py-4">No reports found matching criteria.</p>}
    </div>
  );
} 