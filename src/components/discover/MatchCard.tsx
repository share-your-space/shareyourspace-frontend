// Component to display a single match result
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '@/components/ui/card';
import { Heart, UserCheck, Loader2, Check, Star } from 'lucide-react';
import { type MatchResult } from '@/types/matching';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { type Connection } from '@/types/connection';

interface MatchCardProps {
  match: MatchResult;
  initialConnectionStatus?: 'idle' | 'pending' | 'connected';
}

type ConnectionStatus = 'idle' | 'loading' | 'pending' | 'connected' | 'error';

interface ApiError {
    response?: {
        data?: {
            detail?: string;
        };
    };
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, initialConnectionStatus = 'idle' }) => {
  const { profile, score, reasons } = match;
  const token = useAuthStore(state => state.token);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(initialConnectionStatus);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if card is wrapped in a link
    if (!token) {
      toast.error('Authentication error. Please log in again.');
      return;
    }
    setConnectionStatus('loading');
    try {
      const response = await api.post<Connection>('/connections/', {
        recipient_id: profile.user_id
      });

      const result = response.data;

      if (result.status === 'pending' || result.status === 'accepted') {
        setConnectionStatus(result.status === 'pending' ? 'pending' : 'connected');
        toast.success(
          result.status === 'pending'
            ? 'Connection request sent!'
            : 'Already connected!'
        );
      } else {
        setConnectionStatus('error');
        toast.error('Connection request failed. Unexpected status received.');
        console.warn("Unexpected connection status after POST:", result);
      }
    } catch (error: unknown) {
      console.error('Connection request error:', error);
      setConnectionStatus('error');
      const apiError = error as ApiError;
      const detail = apiError.response?.data?.detail || 'An error occurred while sending the connection request.';
      toast.error(`Connection failed: ${detail}`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };
  
  const connectButtonContent = (() => {
    switch (connectionStatus) {
      case 'loading':
        return { text: 'Connecting...', icon: Loader2, disabled: true, className: 'animate-spin' };
      case 'pending':
        return { text: 'Pending', icon: Check, disabled: true };
      case 'connected':
        return { text: 'Connected', icon: Check, disabled: true };
      case 'error':
        return { text: 'Connect', icon: UserCheck, disabled: false, onClick: handleConnect };
      case 'idle':
      default:
        return { text: 'Connect', icon: UserCheck, disabled: false, onClick: handleConnect };
    }
  })();

  return (
    <Link href={`/users/${profile.user_id}`} className="block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group">
        <div className="relative h-60 w-full">
          <Image
            src={profile.profile_picture_signed_url || '/placeholder-image.png'}
            alt={profile.full_name || 'User profile'}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className="absolute top-2 right-2 z-10"
            onClick={handleFavorite}
          >
            <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50 hover:text-white">
              <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <CardTitle className="text-white text-lg font-bold truncate">{profile.full_name || `User ${profile.user_id}`}</CardTitle>
            <CardDescription className="text-gray-300 text-sm truncate">{profile.title || 'No title specified'}</CardDescription>
          </div>
        </div>
        <CardContent className="p-4 grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 font-semibold text-amber-600">
              <Star className="h-4 w-4 fill-current" />
              <span>{(score * 5).toFixed(2)} Match Rating</span>
            </div>
          </div>

          {reasons && reasons.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2 uppercase text-muted-foreground">Top Match Reasons</h4>
              <ul className="list-none text-sm text-muted-foreground space-y-1">
                  {reasons.filter(r => r !== 'Similar Profile Vector').slice(0, 2).map((reason, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{reason}</span>
                      </li>
                  ))}
              </ul>
            </div>
          )}

          {profile.skills_expertise && profile.skills_expertise.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2 uppercase text-muted-foreground">Key Skills</h4>
              <div className="flex flex-wrap gap-1">
                  {profile.skills_expertise.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                  {profile.skills_expertise.length > 3 && <Badge variant="outline">+{profile.skills_expertise.length - 3} more</Badge>}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 flex justify-end gap-2 pt-0">
          <Button 
              size="sm" 
              onClick={connectButtonContent.onClick} 
              disabled={connectButtonContent.disabled}
              variant={connectionStatus === 'idle' ? 'default' : 'secondary'}
              className="w-full"
          >
              <connectButtonContent.icon 
                  className={`mr-2 h-4 w-4 ${connectButtonContent.className || ''}`} 
              /> 
              {connectButtonContent.text}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};