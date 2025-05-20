import { create } from 'zustand';
import { User } from './userStore'; // Assuming User type is imported from userStore or similar

interface ChatState {
  onlineUserIds: Set<number>;
  setOnlineUsers: (userIds: number[]) => void;
  addOnlineUser: (userId: number) => void;
  removeOnlineUser: (userId: number) => void;
  conversations: Conversation[];
  activeConversationId: number | null;
  setConversations: (conversations: Conversation[]) => void;
  addMessage: (message: Message) => void;
  setActiveConversationId: (conversationId: number | null) => void;
  loadMessagesForConversation: (conversationId: number, messages: Message[], hasMore: boolean) => void;
  updateMessageReaction: (payload: ReactionUpdatedEventPayload) => void;
  updateMessage: (updatedMessage: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  onlineUserIds: new Set(),
  conversations: [],
  activeConversationId: null,
  setOnlineUsers: (userIds) => set({ onlineUserIds: new Set(userIds) }),
  addOnlineUser: (userId) => 
    set((state) => ({ onlineUserIds: new Set(state.onlineUserIds).add(userId) })),
  removeOnlineUser: (userId) => 
    set((state) => {
      const newSet = new Set(state.onlineUserIds);
      newSet.delete(userId);
      return { onlineUserIds: newSet };
    }),
  setConversations: (conversations) => set({ conversations }),
  addMessage: (message) => set((state) => {
    const conversations = state.conversations.map((conv) => {
      if (conv.id === message.conversation_id) {
        // Add reactions array if it's not already part of the message object construction
        const messageWithReactions = { ...message, reactions: message.reactions || [] };
        return {
          ...conv,
          messages: [...conv.messages, messageWithReactions],
          last_message: messageWithReactions, // Also update last_message
        };
      }
      return conv;
    });
    return { conversations };
  }),
  setActiveConversationId: (conversationId) => set({ activeConversationId: conversationId }),
  loadMessagesForConversation: (conversationId, messages, hasMore) => set((state) => {
    const conversations = state.conversations.map((conv) => {
      if (conv.id === conversationId) {
        const messagesWithReactions = messages.map(m => ({ ...m, reactions: m.reactions || [] }));
        return {
          ...conv,
          // Prepend older messages, ensure reactions are initialized
          messages: [...messagesWithReactions, ...conv.messages],
          isLoadingMessages: false,
          hasMoreMessages: hasMore,
        };
      }
      return conv;
    });
    return { conversations };
  }),
  updateMessageReaction: (payload) => set((state) => {
    const conversations = state.conversations.map((conv) => {
      if (conv.id === payload.conversation_id) {
        const updatedMessages = conv.messages.map((msg) => {
          if (msg.id === payload.message_id) {
            let newReactions = [...(msg.reactions || [])];
            if (payload.action === 'added' && payload.reaction) {
              // Avoid duplicates: remove existing reaction by this user with this emoji first
              newReactions = newReactions.filter(
                (r) => !(r.user_id === payload.user_id_who_reacted && r.emoji === payload.emoji)
              );
              newReactions.push(payload.reaction);
            } else if (payload.action === 'removed') {
              newReactions = newReactions.filter(
                (r) => !(r.user_id === payload.user_id_who_reacted && r.emoji === payload.emoji)
              );
            }
            return { ...msg, reactions: newReactions };
          }
          return msg;
        });
        // Also update reactions on the last_message if it's the one being reacted to
        let updatedLastMessage = conv.last_message;
        if (conv.last_message && conv.last_message.id === payload.message_id) {
            let newReactions = [...(conv.last_message.reactions || [])];
            if (payload.action === 'added' && payload.reaction) {
              newReactions = newReactions.filter(
                (r) => !(r.user_id === payload.user_id_who_reacted && r.emoji === payload.emoji)
              );
              newReactions.push(payload.reaction);
            } else if (payload.action === 'removed') {
              newReactions = newReactions.filter(
                (r) => !(r.user_id === payload.user_id_who_reacted && r.emoji === payload.emoji)
              );
            }
            updatedLastMessage = { ...conv.last_message, reactions: newReactions };
        }
        return { ...conv, messages: updatedMessages, last_message: updatedLastMessage };
      }
      return conv;
    });
    return { conversations };
  }),
  updateMessage: (updatedMessage) => set((state) => {
    const conversations = state.conversations.map((conv) => {
      if (conv.id === updatedMessage.conversation_id) {
        // Ensure reactions array exists on the updated message
        const messageWithReactions = { ...updatedMessage, reactions: updatedMessage.reactions || [] };
        
        // Update the message within the messages array
        const updatedMessages = conv.messages.map((msg) => 
          msg.id === messageWithReactions.id ? messageWithReactions : msg
        );

        // Also update the last_message if it's the one being updated/deleted
        let updatedLastMessage = conv.last_message;
        if (conv.last_message && conv.last_message.id === messageWithReactions.id) {
          updatedLastMessage = messageWithReactions;
        }
        
        return { ...conv, messages: updatedMessages, last_message: updatedLastMessage };
      }
      return conv;
    });
    return { conversations };
  }),
}));

export interface MessageReaction {
  id: number;
  emoji: string;
  message_id: number;
  user_id: number;
  created_at: string; // ISO date string
  // user?: User; // Optional: if you plan to include user details directly
}

export interface ReactionUpdatedEventPayload {
  message_id: number;
  conversation_id: number;
  reaction: MessageReaction | null; // Reaction object if added, null if removed by toggle
  user_id_who_reacted: number;
  emoji: string; // The emoji that was acted upon
  action: "added" | "removed";
}

// Modify the existing Message interface to include reactions
export interface Message {
  id: number;
  sender_id: number;
  conversation_id: number;
  content: string;
  created_at: string; // ISO date string
  updated_at?: string | null; // ISO date string - Make optional as it might be null
  read_at?: string | null; // ISO date string
  is_deleted: boolean;      // Add field for soft deletion
  sender: User; // Assuming User type is defined elsewhere or inline here
  reactions: MessageReaction[]; // Array of reactions
}

export interface Conversation {
  id: number;
  // other_user: User; // This was in your backend schema, adapt as needed for frontend state
  participants: User[]; // Representing all participants including current user
  last_message: Message | null;
  unread_count: number;
  messages: Message[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
}

export default useChatStore; 