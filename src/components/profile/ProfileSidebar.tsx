import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Share2, MessageSquare } from 'lucide-react';
import { UserProfile } from '@/types/userProfile';

interface ProfileSidebarProps {
  profile: UserProfile | null;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile }) => {
  
  const calculateProfileCompletion = (profile: UserProfile | null): number => {
    if (!profile) return 0;

    const fields = [
      profile.title,
      profile.bio,
      profile.skills_expertise,
      profile.industry_focus,
      profile.project_interests_goals,
      profile.collaboration_preferences,
      profile.tools_technologies,
      profile.linkedin_profile_url,
      profile.profile_picture_signed_url,
      profile.cover_photo_signed_url
    ];

    const filledFields = fields.filter(field => {
      if (Array.isArray(field)) return field.length > 0;
      return !!field;
    }).length;

    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = calculateProfileCompletion(profile);

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