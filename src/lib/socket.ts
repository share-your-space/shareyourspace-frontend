import { io, Socket } from 'socket.io-client';
// import { ReactionUpdatedEventPayload } from '@/store/chatStore'; // REMOVED
import { ChatMessageData, ReactionUpdatedEventPayload } from '@/types/chat'; // Added import

// Placeholder for ChatMessageData, ideally this would be imported from a shared types file - NO LONGER NEEDED
// For now, using 'any' to resolve linter errors quickly. - NO LONGER NEEDED
// Consider moving the ChatMessageData interface from MessageArea.tsx to a shared location. - DONE
// type ChatMessageData = any; 

// Define the shape of Server-to-Client events (optional but recommended)
interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  receive_message: (message: ChatMessageData) => void; // Uses ChatMessageData from @/types/chat
  connect_error: (err: Error) => void;
  messages_read: (data: { reader_id: number; conversation_partner_id: number; count: number }) => void;
  user_online: (data: { user_id: number }) => void;
  user_offline: (data: { user_id: number }) => void;
  online_users_list: (userIds: number[]) => void;
  reaction_updated: (payload: ReactionUpdatedEventPayload) => void; // Uses ReactionUpdatedEventPayload from @/types/chat
  message_updated: (payload: ChatMessageData) => void; // Uses ChatMessageData from @/types/chat
  message_deleted: (payload: ChatMessageData) => void; // Uses ChatMessageData from @/types/chat
  workstation_changed: (data: { status: 'assigned' | 'unassigned', workstation_name?: string }) => void;
  // Add other expected server events here
}

// Define the shape of Client-to-Server events (optional but recommended)

// Re-import SendMessagePayload or define it here if it's simple enough
// For now, assuming it's imported or defined above if complex
// For this edit, let's assume SendMessagePayload structure is known implicitly
// from the MessageInput component. Ideally, it would be defined in types/chat.ts and imported here.
// For now, defining a simplified version here for the edit, will refine if type is moved.
interface SendMessagePayloadSocket {
    recipient_id: number;
    content: string;
    attachment_url?: string;
    attachment_filename?: string;
    attachment_mimetype?: string;
}

interface ClientToServerEvents {
  send_message: (message: SendMessagePayloadSocket) => void; // UPDATED to use a specific type
  mark_as_read: (data: { sender_id: number }) => void; 
  user_typing: (data: { recipient_id: number; is_typing: boolean }) => void; // ADDED from dev plan
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