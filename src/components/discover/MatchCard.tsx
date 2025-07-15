// Component to display a single match result
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Heart, UserCheck, Check, MessageSquare, UserX, UserPlus } from 'lucide-react';
import { type MatchResult } from '@/types/matching';
import { toast } from 'sonner';

type ConnectionStatusValue = 'connected' | 'pending_from_me' | 'pending_from_them' | 'not_connected' | 'declined';

export interface MatchCardProps {
  match: MatchResult;
  connectionStatus: ConnectionStatusValue;
  onConnect: (userId: string) => void;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  onSendMessage: (userId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  connectionStatus,
  onConnect,
  onAccept,
  onDecline,
  onSendMessage,
}) => {
  const { profile, score, reasons } = match;
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };
  
  const renderConnectButton = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Button variant="outline" onClick={() => onSendMessage(profile.user_id)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
        );
      case 'pending_from_me':
        return <Button disabled>Pending</Button>;
      case 'pending_from_them':
        return (
          <div className="flex gap-2">
            <Button onClick={() => onAccept(profile.user_id)} size="sm">
              <Check className="mr-1 h-4 w-4" /> Accept
            </Button>
            <Button variant="outline" onClick={() => onDecline(profile.user_id)} size="sm">
              <UserX className="mr-1 h-4 w-4" /> Decline
            </Button>
          </div>
        );
      case 'not_connected':
      case 'declined':
        return (
          <Button onClick={() => onConnect(profile.user_id)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Connect
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="relative">
        <Link href={`/users/${profile.user_id}`} className="block">
          <Image
            src={profile.profile_picture_signed_url || '/placeholder-image.png'}
            alt={`Profile picture of ${profile.full_name}`}
            width={300}
            height={300}
            className="object-cover w-full aspect-square"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white hover:text-white rounded-full"
          onClick={handleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>
      <CardContent className="p-4 flex-grow">
        <Link href={`/users/${profile.user_id}`} className="block">
          <CardTitle className="text-lg truncate">{profile.full_name}</CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground truncate">{profile.headline}</p>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {profile.skills_expertise?.slice(0, 3).map(skill => (
            <Badge key={skill} variant="secondary">{skill}</Badge>
          ))}
        </div>

        <div className="mt-3 text-sm">
          <p className="font-semibold">Why we matched:</p>
          <ul className="list-disc list-inside text-muted-foreground">
            {reasons.slice(0, 2).map((reason, index) => (
              <li key={index} className="truncate">{reason}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {renderConnectButton()}
      </CardFooter>
    </Card>
  );
};