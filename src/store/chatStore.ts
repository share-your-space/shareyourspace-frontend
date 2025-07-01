import { create } from 'zustand';
import { useAuthStore } from './authStore'; // Import auth store
// import { User } from './userStore'; // Assuming User type is imported from userStore or similar - NO, now from @/types/chat
import { User, Message, Conversation, MessageReaction, ReactionUpdatedEventPayload, ConversationData } from '@/types/chat'; // Added import

interface AuthState {
  //...
}

interface ChatState {
  onlineUserIds: Set<number>;
  setOnlineUsers: (userIds: number[]) => void;
  addOnlineUser: (userId: number) => void;
  removeOnlineUser: (userId: number) => void;
  conversations: Conversation[];
  activeConversationId: number | null;
  setConversations: (conversations: Conversation[]) => void;
  addOrUpdateConversation: (conversation: ConversationData, currentUserId: string | number) => void;
  addMessage: (message: Message) => void;
  setActiveConversationId: (conversationId: number | null) => void;
  loadMessagesForConversation: (conversationId: number, messages: Message[], hasMore: boolean) => void;
  updateMessageReaction: (payload: ReactionUpdatedEventPayload) => void;
  updateMessage: (updatedMessage: Message) => void;
  setConversationLoading: (conversationId: number, isLoading: boolean) => void;
  setMessagesForConversation: (conversationId: number, messages: Message[]) => void;
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
  addOrUpdateConversation: (conversation, currentUserId) => set(state => {
    // Ensure conversation has the 'other_user' field if it has 'participants'
    let conversationToProcess: Conversation = { ...conversation };
    if ('participants' in conversationToProcess && !conversationToProcess.other_user) {
        const participants = (conversationToProcess as ConversationData).participants;
        // The user ID from auth store can be a string, participants have number IDs
        const otherUser = participants.find(p => p.id.toString() !== currentUserId.toString());
        if (otherUser) {
            conversationToProcess.other_user = otherUser;
        }
        delete (conversationToProcess as Partial<ConversationData>).participants;
    }

    const existingConvIndex = state.conversations.findIndex(c => c.id === conversationToProcess.id);
    const newConversations = [...state.conversations];
    
    const conversationWithDefaults = {
        ...conversationToProcess,
        messages: conversationToProcess.messages || [],
        isLoadingMessages: false,
        hasMoreMessages: true,
        messagesFetched: !!(existingConvIndex > -1 && newConversations[existingConvIndex].messagesFetched),
    };

    if (existingConvIndex > -1) {
        // Merge messages to prevent overwriting loaded history
        const existingMessages = newConversations[existingConvIndex].messages || [];
        const newMessages = conversationWithDefaults.messages || [];
        const combinedMessages = [...existingMessages];
        const existingMessageIds = new Set(existingMessages.map(m => m.id));
        newMessages.forEach(msg => {
            if (!existingMessageIds.has(msg.id)) {
                combinedMessages.push(msg);
            }
        });
        // Sort messages by creation time
        combinedMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        newConversations[existingConvIndex] = { ...newConversations[existingConvIndex], ...conversationWithDefaults, messages: combinedMessages };
    } else {
        newConversations.unshift(conversationWithDefaults);
    }
    return { conversations: newConversations };
  }),
  addMessage: (message) => set((state) => {
    let conversationExists = false;
    const conversations = state.conversations.map((conv) => {
      if (conv.id === message.conversation_id) {
        conversationExists = true;
        // Avoid duplicating messages
        if (conv.messages.some(m => m.id === message.id)) {
          return conv;
        }
        const messageWithReactions = { ...message, reactions: message.reactions || [] };
        return {
          ...conv,
          messages: [...conv.messages, messageWithReactions],
          last_message: messageWithReactions,
          unread_count: (conv.unread_count || 0) + 1,
        };
      }
      return conv;
    });

    // If conversation doesn't exist, we can't properly add the message
    // as we lack context (participants, etc.). This should be handled
    // by fetching the conversation first.
    // For now, we log this case. A better approach might be to trigger a fetch.
    if (!conversationExists) {
        console.warn("Received message for a conversation not in store:", message);
    }

    return { conversations };
  }),
  setActiveConversationId: (conversationId) => {
    set((state) => {
        const conversations = state.conversations.map(c => {
            if (c.id === conversationId) {
                return { ...c, unread_count: 0 };
            }
            return c;
        });
        return { activeConversationId: conversationId, conversations };
    });
  },
  loadMessagesForConversation: (conversationId, messages, hasMore) => set((state) => {
    const conversations = state.conversations.map((conv) => {
      if (conv.id === conversationId) {
        const messagesWithReactions = messages.map(m => ({ ...m, reactions: m.reactions || [] }));
        return {
          ...conv,
          // Prepend older messages, ensure reactions are initialized
          messages: [...messagesWithReactions, ...conv.messages.filter(m => !messages.some(nm => nm.id === m.id))],
          isLoadingMessages: false,
          hasMoreMessages: hasMore,
        };
      }
      return conv;
    });
    return { conversations };
  }),
  setConversationLoading: (conversationId, isLoading) => set(state => ({
    conversations: state.conversations.map(conv => 
      conv.id === conversationId ? { ...conv, isLoadingMessages: isLoading } : conv
    )
  })),
  setMessagesForConversation: (conversationId, messages) => set(state => ({
    conversations: state.conversations.map(conv => {
        if (conv.id === conversationId) {
            return {
                ...conv,
                messages: messages,
                messagesFetched: true,
                isLoadingMessages: false,
                hasMoreMessages: messages.length >= 100, // Assuming pagination limit is 100
            };
        }
        return conv;
    }),
  })),
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

export default useChatStore; 