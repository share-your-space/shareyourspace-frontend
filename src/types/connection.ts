export interface UserSimpleInfo {
    id: number;
    full_name: string | null;
    email: string;
    profile: {
        title?: string | null;
        profile_picture_url?: string | null;
    } | null;
}

export interface Connection {
    id: number;
    requester_id: number;
    recipient_id: number;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    created_at: string;
    updated_at: string;
    requester: UserSimpleInfo;
    recipient: UserSimpleInfo;
} 