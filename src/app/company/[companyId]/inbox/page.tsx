'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function CompanyInboxPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Mail className="mr-3 h-6 w-6" />
                        Inbox
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold">Inbox Feature Coming Soon</h2>
                        <p className="text-muted-foreground mt-2">
                            A dedicated space for all your communications is under construction.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
