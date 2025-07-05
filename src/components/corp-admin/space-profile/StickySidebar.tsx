import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface StickySidebarProps {
  // We'll add props later for availability, actions, etc.
}

export const StickySidebar: React.FC<StickySidebarProps> = () => {
  return (
    <div className="sticky top-24">
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Workstations</span>
            <span className="font-bold">50</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Available</span>
            <span className="font-bold text-green-600">12</span>
          </div>
          <Button className="w-full mt-4">
            <Users className="h-4 w-4 mr-2" />
            Express Interest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 