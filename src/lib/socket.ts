import { io, Socket } from 'socket.io-client';
import { ReactionUpdatedEventPayload } from '@/store/chatStore';

// Placeholder for ChatMessageData, ideally this would be imported from a shared types file
// For now, using 'any' to resolve linter errors quickly.
// Consider moving the ChatMessageData interface from MessageArea.tsx to a shared location.
// type ChatMessageData = any; 

// Define the shape of Server-to-Client events (optional but recommended)
interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  receive_message: (message: ChatMessageData) => void;
  connect_error: (err: Error) => void;
  messages_read: (data: { reader_id: number; conversation_partner_id: number; count: number }) => void;
  user_online: (data: { user_id: number }) => void;
  user_offline: (data: { user_id: number }) => void;
  online_users_list: (userIds: number[]) => void;
  reaction_updated: (payload: ReactionUpdatedEventPayload) => void;
  message_updated: (payload: ChatMessageData) => void;
  message_deleted: (payload: ChatMessageData) => void;
  // Add other expected server events here
}

// Define the shape of Client-to-Server events (optional but recommended)
interface ClientToServerEvents {
  send_message: (message: { recipient_id: number; content: string }) => void;
  mark_as_read: (data: { sender_id: number }) => void; // New event
  // Add other events the client will emit
}

const URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:8000';

// Initialize socket instance
// Use the defined event types for better type safety
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: false, // Only connect manually when authenticated
  // You might need withCredentials: true if using cookies for auth later
});

// Optional: Add some basic logging for connection events
socket.on('connect', () => {
  console.log('Socket.IO connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket.IO disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Socket.IO connection error:', err.message);
});