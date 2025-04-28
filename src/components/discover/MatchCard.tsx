// Component to display a single match result
import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, Link2, UserCheck, Sparkles } from 'lucide-react';
import { type MatchResult } from '@/types/matching';

interface MatchCardProps {
  match: MatchResult;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { profile, score, reasons } = match;

  // Function to get initials for Avatar fallback
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <Avatar className="h-12 w-12 border">
          {/* Use signed URL if available, otherwise fallback */}
          <AvatarImage src={profile.profile_picture_signed_url || undefined} alt={profile.full_name || 'User profile'} />
          <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle>{profile.full_name || `User ${profile.user_id}`}</CardTitle>
          <CardDescription>{profile.title || 'No title specified'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Display Score */}
         <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span>Match Score: {score.toFixed(2)}</span>
        </div>
        
        {/* Display Bio */}
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
        )}

        {/* Display Key Skills */}
        {profile.skills_expertise && profile.skills_expertise.length > 0 && (
          <div>
             <h4 className="text-xs font-semibold mb-1 uppercase text-muted-foreground">Key Skills</h4>
             <div className="flex flex-wrap gap-1">
                 {profile.skills_expertise.slice(0, 5).map((skill, index) => (
                 <Badge key={index} variant="secondary">{skill}</Badge>
                 ))}
                 {profile.skills_expertise.length > 5 && <Badge variant="outline">...</Badge>}
             </div>
          </div>
        )}
        
         {/* Display Match Reasons */}
        {reasons && reasons.length > 0 && (
           <div>
             <h4 className="text-xs font-semibold mb-1 uppercase text-muted-foreground">Match Reasons</h4>
             <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                {/* Only show structured reasons? Or all? Let's show all for now */} 
                {reasons.filter(r => r !== 'Similar Profile Vector').slice(0, 3).map((reason, index) => (
                    <li key={index}>{reason}</li>
                ))}
                {/* Optionally show a note about vector similarity */} 
                {reasons.includes('Similar Profile Vector') && reasons.length <= 4 && 
                    <li className='italic'>+ Overall profile similarity</li>
                }
             </ul>
           </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" asChild>
           {/* TODO: Update link when profile routes are finalized */}
          <Link href={`/users/${profile.user_id}`}> 
            <Link2 className="mr-2 h-4 w-4" /> View Profile
          </Link>
        </Button>
        {/* TODO: Implement connect logic later */}
        <Button size="sm">
            <UserCheck className="mr-2 h-4 w-4" /> Connect
        </Button>
      </CardFooter>
    </Card>
  );
}; 