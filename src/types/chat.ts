// types/chat.ts

// User type (as defined in MessageArea.tsx context for chat)
// Consider if this should be a more generic User type from a central location like @/types/user.ts or @/store/userStore.ts
export interface User {
    id: number;
    full_name: string;
    email: string; // Maintained for potential use though profile_picture_url and full_name are primary for display
    profile_picture_url?: string; // Used for avatar
    role?: string; // Maintained for potential future use in chat context
}

// ChatMessageData (as defined in MessageArea.tsx, matching backend ChatMessage schema)
export interface ChatMessageData {
    id: number;
    sender_id: number;
    recipient_id: number; // Can be null for channel/group messages in future, but required for 1-on-1
    conversation_id?: number | null;
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
  id: number;
  emoji: string;
  message_id: number;
  user_id: number;
  created_at: string; // ISO date string
  // user?: User; // Optional: if you plan to include user details directly
}

// ReactionUpdatedEventPayload (as defined in chatStore.ts)
export interface ReactionUpdatedEventPayload {
  message_id: number;
  conversation_id: number;
  reaction: MessageReaction | null; // Reaction object if added, null if removed by toggle
  user_id_who_reacted: number;
  emoji: string; // The emoji that was acted upon
  action: "added" | "removed";
}

// From SocketConnectionManager.tsx
export interface NewMessageNotificationPayload {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  message_preview: string;
  created_at: string;
}

// Message interface (as defined in chatStore.ts - Note: it's very similar to ChatMessageData)
// We should probably consolidate ChatMessageData and Message. For now, keeping both if they serve slightly different state needs.
// If ChatMessageData is the raw fetch type and Message is the store type, they might diverge.
// For now, making Message identical to ChatMessageData as it seems to be used that way in the store.
export interface Message extends ChatMessageData {}

// Conversation interface (as defined in chatStore.ts)
export interface Conversation {
  id: number;
  is_external?: boolean;
  participants: User[]; // Representing all participants including current user
  other_user?: User; // ADDED: For 1-on-1 chat, this is often more convenient than filtering participants
  last_message: Message | null;
  unread_count: number;
  messages: Message[]; // Note: This might only be filled when a specific conversation's history is loaded
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  messagesFetched: boolean;
} 

export type ConversationData = Conversation; 