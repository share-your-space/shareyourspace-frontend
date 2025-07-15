import { create } from 'zustand';
import { User, Conversation, ChatMessageData } from '@/types/chat';

interface ChatState {
  onlineUserIds: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  setConversations: (conversations: Conversation[]) => void;
  addOrUpdateConversation: (conversation: Conversation) => void;
  addMessage: (conversationId: string, message: ChatMessageData) => void;
  setActiveConversationId: (conversationId: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
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
  setConversations: (conversations) => {
      const conversationsWithDefaults = conversations.map(c => ({
          ...c,
          messages: c.messages || [],
          isLoadingMessages: false,
          hasMoreMessages: true,
          messagesFetched: false,
      }));
      set({ conversations: conversationsWithDefaults });
  },
  addOrUpdateConversation: (conversation) => set(state => {
    const existingIndex = state.conversations.findIndex(c => c.id === conversation.id);
    if (existingIndex > -1) {
      const updatedConversations = [...state.conversations];
      updatedConversations[existingIndex] = {
        ...updatedConversations[existingIndex],
        ...conversation,
      };
      return { conversations: updatedConversations };
    } else {
      return { conversations: [conversation, ...state.conversations] };
    }
  }),
  addMessage: (conversationId, message) => set((state) => {
    const conversations = state.conversations.map((conv) => {
      if (conv.id === conversationId) {
        const newMessages = [...conv.messages, message];
        return { ...conv, messages: newMessages, last_message: message };
      }
      return conv;
    });
    // Move the conversation with the new message to the top
    const updatedConvIndex = conversations.findIndex(c => c.id === conversationId);
    if (updatedConvIndex > -1) {
      const updatedConv = conversations.splice(updatedConvIndex, 1)[0];
      conversations.unshift(updatedConv);
    }
    return { conversations };
  }),
  setActiveConversationId: (conversationId) => set({ activeConversationId: conversationId }),
}));

export default useChatStore;