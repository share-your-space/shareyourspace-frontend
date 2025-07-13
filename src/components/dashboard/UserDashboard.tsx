"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/types/auth';
import { UserRole } from '@/types/enums';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useChatStore } from '@/store/chatStore';

interface UserDashboardProps {
  user: User;
}

const UserDashboard = ({ user }: UserDashboardProps) => {
  const isWaitlisted = user.status === 'WAITLISTED';
  const router = useRouter();
  const addConversation = useChatStore((state) => state.addConversation);

  const handleChatWithAdmin = () => {
    // Simulate creating a new conversation with a space admin
    const adminId = 999; // A consistent mock ID for the admin
    const existingConversation = useChatStore.getState().conversations.find(c => c.participants.some(p => p.id === adminId));

    if (existingConversation) {
      router.push(`/chat?conversationId=${existingConversation.id}`);
      toast.info("A chat with the space admin already exists.");
      return;
    }

    const newConversation = {
      id: `conv-${Date.now()}`,
      participants: [
        { id: user.id, full_name: user.full_name || 'You', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { id: adminId, full_name: 'Space Admin', avatar: 'https://i.pravatar.cc/150?u=spaceadmin' },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender_id: adminId,
          content: 'Hello! How can I help you with the space today?',
          created_at: new Date().toISOString(),
        },
      ],
      unread_count: 1,
    };

    addConversation(newConversation);
    toast.success("Chat with space admin initiated.");
    router.push(`/chat?conversationId=${newConversation.id}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.full_name || user.email}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> <span className={isWaitlisted ? "font-semibold text-orange-500" : "font-semibold text-green-500"}>{user.status}</span></p>
        </CardContent>
      </Card>

      {isWaitlisted && (
        <Card className="mt-4 border-orange-500 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-orange-600">You are Currently Waitlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your access is currently limited. Full platform features will become available once a space provider invites you. In the meantime, please keep your profile updated.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Manage Your Profile</h3>
            <p className="text-sm text-muted-foreground mb-4">Keep your personal and professional details up to date to attract the best opportunities.</p>
            <Link href="/profile" passHref>
              <Button variant="outline">View/Edit My Profile</Button>
            </Link>
          </CardContent>
        </Card>

        {user.space_id && user.role !== UserRole.CORP_ADMIN && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">My Space</h3>
              <p className="text-sm text-muted-foreground mb-4">Have questions about the space? Get in touch with your space admin directly.</p>
              <Button onClick={handleChatWithAdmin}>Chat with Space Admin</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;