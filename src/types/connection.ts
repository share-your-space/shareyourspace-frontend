import { User } from './auth';

export interface Connection {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    created_at: string;
    updated_at?: string;
    requester: User;
    recipient: User;
}