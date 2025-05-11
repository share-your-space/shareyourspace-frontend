import { create } from 'zustand';

interface ChatState {
  onlineUserIds: Set<number>;
  setOnlineUsers: (userIds: number[]) => void;
  addOnlineUser: (userId: number) => void;
  removeOnlineUser: (userId: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  onlineUserIds: new Set(),
  setOnlineUsers: (userIds) => set({ onlineUserIds: new Set(userIds) }),
  addOnlineUser: (userId) => 
    set((state) => ({ onlineUserIds: new Set(state.onlineUserIds).add(userId) })),
  removeOnlineUser: (userId) => 
    set((state) => {
      const newSet = new Set(state.onlineUserIds);
      newSet.delete(userId);
      return { onlineUserIds: newSet };
    }),
})); 