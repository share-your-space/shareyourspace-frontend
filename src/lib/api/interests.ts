import { apiClient } from "./base";
import { Interest } from "@/types/space";
import { ConversationData } from "@/types/chat";

export const getInterestStatus = async (spaceId: number): Promise<{ has_expressed_interest: boolean }> => {
  const response = await apiClient.get(`/interests/space/${spaceId}/status`);
  return response.data;
};

export const expressInterest = async (spaceId: number): Promise<Interest> => {
    const response = await apiClient.post(`/interests/space/${spaceId}/express`);
    return response.data;
}; 

export const acceptInterest = async (interestId: number): Promise<void> => {
    await apiClient.post(`/interests/${interestId}/accept`);
}; 

export const initiateExternalChat = async (userId: number): Promise<ConversationData> => {
    const response = await apiClient.post(`/chat/initiate/external/${userId}`);
    return response.data;
}; 