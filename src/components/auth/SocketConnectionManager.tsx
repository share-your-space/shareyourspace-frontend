import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { socket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore'; // Import chat store
import { toast } from 'sonner'; // <<< ADDED IMPORT
import { useRouter } from 'next/navigation'; // <<< ADDED IMPORT
import { NewMessageNotificationPayload } from '@/types/chat';

/**
 * Component responsible for managing the Socket.IO connection based on auth state.
 * This should be mounted client-side within a layout component.
 */

export function SocketConnectionManager() {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading); // Use isLoading to wait for hydration
  const currentUser = useAuthStore((state) => state.user); // Get the full user object from authStore
  
  // Actions from chat store
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const addOnlineUser = useChatStore((state) => state.addOnlineUser);
  const removeOnlineUser = useChatStore((state) => state.removeOnlineUser);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

  // Router for navigation
  const router = useRouter();

  useEffect(() => {
    // Wait for Zustand store to rehydrate before managing connection
    if (isLoading) {
        return;
    }

    if (isAuthenticated && token) {
      // Connect or update auth if already connected but token changed
      if (!socket.connected) {
        socket.auth = { token };
        socket.connect();
        console.log('Attempting socket connection with token...');
      } else if ((socket.auth as { token: string }).token !== token) {
        // Token might have refreshed, update auth and reconnect if needed
        console.log('Socket token changed, updating auth...');
        socket.auth = { token };
        socket.disconnect().connect(); // Disconnect and reconnect with new token
      }
    } else {
      // Disconnect if not authenticated or no token
      if (socket.connected) {
        console.log('Disconnecting socket...');
        socket.disconnect();
        setOnlineUsers([]); // Clear online users on logout
      }
    }

    // Cleanup function to disconnect on component unmount or before re-running effect
    return () => {
        // Avoid disconnecting if transitioning between authenticated states with valid token
        // Only disconnect if explicitly logging out (token becomes null)
        if (!token && socket.connected) {
           console.log('Disconnecting socket on effect cleanup (logout)...');
           socket.disconnect();
           setOnlineUsers([]); // Clear online users on logout during cleanup too
        }
    };
  // Depend on isAuthenticated, token, and isLoading to re-run the effect when they change
  }, [isAuthenticated, token, isLoading, setOnlineUsers]);

  // Add listeners for online status events
  useEffect(() => {
    const handleUserOnline = (data: { user_id: number }) => {
      console.log('User online:', data.user_id);
      addOnlineUser(data.user_id);
    };
    const handleUserOffline = (data: { user_id: number }) => {
      console.log('User offline:', data.user_id);
      removeOnlineUser(data.user_id);
    };
    const handleOnlineUsersList = (userIds: number[]) => {
      console.log('Received online users list:', userIds);
      setOnlineUsers(userIds);
    };

    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('online_users_list', handleOnlineUsersList);

    return () => {
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('online_users_list', handleOnlineUsersList);
    };
  }, [addOnlineUser, removeOnlineUser, setOnlineUsers]); // Dependencies for these listeners

  // Listener for new message notifications
  useEffect(() => {
    const handleNewMessageNotification = (payload: NewMessageNotificationPayload) => {
      console.log('Received new_message_notification:', payload);

      if (!currentUser || typeof currentUser.id === 'undefined') { // Check if currentUser and currentUser.id exist
        console.log('Current user or user ID not available, skipping notification.');
        return; 
      }
      
      const currentUserId = currentUser.id; 
      if (isNaN(currentUserId)) {
        console.error('Current user ID from authStore is not a valid number:', currentUser.id);
        return;
      }

      // Don't show notification for your own messages
      if (payload.sender_id === currentUserId) {
        return;
      }

      // Don't show notification if the relevant chat is already active
      if (payload.conversation_id === activeConversationId) {
        return;
      }

      toast.info(`New message from ${payload.sender_name}`, {
        description: payload.message_preview,
        action: {
          label: "Open Chat",
          onClick: () => {
            setActiveConversationId(payload.conversation_id);
            router.push('/chat'); 
          },
        },
        duration: 8000, // milliseconds
      });
    };

    socket.on('new_message_notification', handleNewMessageNotification);

    return () => {
      socket.off('new_message_notification', handleNewMessageNotification);
    };
  }, [currentUser, activeConversationId, setActiveConversationId, router]); // Added currentUser to dependencies

  // This component doesn't render anything itself
  return null;
} 