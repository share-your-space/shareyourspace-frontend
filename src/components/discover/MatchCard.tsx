// Component to display a single match result
import React, { useState } from 'react';
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
import { Info, Link2, UserCheck, Sparkles, Loader2, Check } from 'lucide-react';
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

export const MatchCard: React.FC<MatchCardProps> = ({ match, initialConnectionStatus = 'idle' }) => {
  const { profile, score, reasons } = match;
  const token = useAuthStore(state => state.token);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(initialConnectionStatus);

  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleConnect = async () => {
    if (!token) {
      toast.error('Authentication error. Please log in again.');
      return;
    }
    setConnectionStatus('loading');
    try {
      const response = await api.post<Connection>('/connections', {
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
    } catch (error: any) {
      console.error('Connection request error:', error);
      setConnectionStatus('error');
      const detail = error.response?.data?.detail || 'An error occurred while sending the connection request.';
      toast.error(`Connection failed: ${detail}`);
    }
  };
  
  let connectButtonContent:
    | { text: string; icon: React.ElementType; disabled: boolean; onClick?: () => void }
    | undefined = undefined;

  switch (connectionStatus) {
    case 'loading':
      connectButtonContent = { text: 'Connecting...', icon: Loader2, disabled: true };
      break;
    case 'pending':
      connectButtonContent = { text: 'Pending', icon: Check, disabled: true };
      break;
    case 'connected':
      connectButtonContent = { text: 'Connected', icon: Check, disabled: true };
      break;
    case 'error':
      connectButtonContent = { text: 'Connect', icon: UserCheck, disabled: false, onClick: handleConnect };
      toast.warning('Connection failed. You can try again.');
      break;
    case 'idle':
    default:
      connectButtonContent = { text: 'Connect', icon: UserCheck, disabled: false, onClick: handleConnect };
  }

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={profile.profile_picture_signed_url || undefined} alt={profile.full_name || 'User profile'} />
          <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle>{profile.full_name || `User ${profile.user_id}`}</CardTitle>
          <CardDescription>{profile.title || 'No title specified'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span>Match Score: {score.toFixed(2)}</span>
        </div>
        
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
        )}

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
        
         {reasons && reasons.length > 0 && (
           <div>
             <h4 className="text-xs font-semibold mb-1 uppercase text-muted-foreground">Match Reasons</h4>
             <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                {reasons.filter(r => r !== 'Similar Profile Vector').slice(0, 3).map((reason, index) => (
                    <li key={index}>{reason}</li>
                ))}
                {reasons.includes('Similar Profile Vector') && reasons.length <= 4 && 
                    <li className='italic'>+ Overall profile similarity</li>
                }
             </ul>
           </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/users/${profile.user_id}`}> 
            <Link2 className="mr-2 h-4 w-4" /> View Profile
          </Link>
        </Button>
        {connectButtonContent && (
            <Button 
                size="sm" 
                onClick={connectButtonContent.onClick} 
                disabled={connectButtonContent.disabled}
            >
                <connectButtonContent.icon 
                    className={`mr-2 h-4 w-4 ${connectionStatus === 'loading' ? 'animate-spin' : ''}`} 
                /> 
                {connectButtonContent.text}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}; 