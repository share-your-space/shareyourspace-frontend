'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function BookingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="mr-3 h-6 w-6" />
                        Bookings
                    </CardTitle>
                     <CardDescription>View and manage all workstation bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold">Booking Management Coming Soon</h2>
                        <p className="text-muted-foreground mt-2">
                            A calendar view to manage all your space bookings is on the way.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
