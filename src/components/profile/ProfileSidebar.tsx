import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Share2, MessageSquare } from 'lucide-react';

export const ProfileSidebar = () => {
  const completion = 80; // This would be calculated based on profile data

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Strength</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={completion} />
        <p className="text-sm text-center text-gray-600">{completion}% complete</p>
        <Button variant="outline" className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          View Public Profile
        </Button>
        <Button variant="outline" className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </Button>
         <Button className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </CardContent>
    </Card>
  );
}; 