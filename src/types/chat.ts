// types/chat.ts
import { User } from './auth';

// User type is now imported from @/types/auth to ensure consistency.
export type { User };

// ChatMessageData (as defined in MessageArea.tsx, matching backend ChatMessage schema)
export interface ChatMessageData {
    id: string;
    sender_id: string;
    recipient_id: string; // Can be null for channel/group messages in future, but required for 1-on-1
    conversation_id?: string | null;
    content: string;
    created_at: string; // ISO string format from backend
    read_at?: string | null;
    updated_at?: string | null;
    is_deleted: boolean;
    sender: User; // Embedded sender details
    attachment_url?: string | null;
    attachment_filename?: string | null;
    attachment_mimetype?: string | null;
    reactions?: MessageReaction[];
}

// MessageReaction (as defined in chatStore.ts)
export interface MessageReaction {
  id: string;
  emoji: string;
  message_id: string;
  user_id: string;
  created_at: string; // ISO date string
  // user?: User; // Optional: if you plan to include user details directly
}

// ReactionUpdatedEventPayload (as defined in chatStore.ts)
export interface ReactionUpdatedEventPayload {
  message_id: string;
  conversation_id: string;
  reaction: MessageReaction | null; // Reaction object if added, null if removed by toggle
  user_id_who_reacted: string;
  emoji: string; // The emoji that was acted upon
  action: "added" | "removed";
}

// From SocketConnectionManager.tsx
export interface NewMessageNotificationPayload {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  message_preview: string;
  created_at: string;
}

// Message interface is now consolidated into ChatMessageData.
// The Message type alias is removed to avoid confusion.

// Conversation interface (as defined in chatStore.ts)
export interface Conversation {
  id: string;
  is_external?: boolean;
  participants: User[]; // Representing all participants including current user
  other_user?: User; // ADDED: For 1-on-1, this is often more convenient than filtering participants
  last_message: ChatMessageData | null;
  unread_count: number;
  messages: ChatMessageData[]; // Note: This might only be filled when a specific conversation's history is loaded
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  messagesFetched: boolean;
  created_at?: string;
  updated_at?: string;
} 

export type ConversationData = Conversation;