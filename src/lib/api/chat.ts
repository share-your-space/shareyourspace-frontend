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