import { apiClient } from "./base";
import { Conversation } from "@/types/chat";

const CHAT_API_BASE = "/chat";

/**
 * Gets or creates a conversation with a specific user.
 * @param userId The ID of the other user.
 * @returns The conversation object.
 */
export const getOrCreateConversation = async (userId: number): Promise<Conversation> => {
  try {
    const response = await apiClient.get<Conversation>(`${CHAT_API_BASE}/conversations/with/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting or creating conversation with user ${userId}:`, error);
    throw error;
  }
};

/**
 * Initiates a chat with the space admin.
 * @returns The conversation object.
 */
export const initiateChatWithSpaceAdmin = async (): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(`${CHAT_API_BASE}/initiate-with-space-admin`);
    return response.data;
};

/**
 * Initiates an external chat with a specific user.
 * @param recipientId The ID of the user to chat with.
 * @returns The conversation object.
 */
export const initiateExternalChat = async (recipientId: number): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(`${CHAT_API_BASE}/initiate-external`, { recipient_id: recipientId });
    return response.data;
}; 