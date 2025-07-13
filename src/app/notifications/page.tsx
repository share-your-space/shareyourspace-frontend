"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, Trash2, MailQuestion, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { mockNotifications } from '@/lib/mock-data';
import { Notification } from '@/types/notification';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleMarkRead = (notificationId: number) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
    toast.success('Notification marked as read.');
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read.');
  };

  const handleAcceptConnection = (notificationId: number) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    toast.success("Connection accepted!");
  };

  const handleDeclineConnection = (notificationId: number) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    toast.success("Connection declined.");
  };

  const handleDeleteNotification = (notificationId: number) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    toast.success("Notification deleted.");
  };

  const getIconForNotification = (type: string) => {
    switch (type) {
      case 'connection_request':
        return <UserCheck className="h-6 w-6 text-blue-500" />;
      case 'new_message':
        return <MailQuestion className="h-6 w-6 text-green-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
          <Button onClick={handleMarkAllRead} disabled={notifications.every(n => n.is_read)}>
            Mark All as Read
          </Button>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              You have no new notifications.
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                    notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getIconForNotification(notification.type)}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {notification.link && (
                      <Link href={notification.link} className="text-sm text-blue-600 hover:underline">
                        View Details
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    {notification.type === 'connection_request' && !notification.is_read && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAcceptConnection(notification.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineConnection(notification.id)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notification.id)}
                      title="Delete notification"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;