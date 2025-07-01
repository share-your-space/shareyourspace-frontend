import { apiClient as api } from './base';

export const acceptInterest = async (interestId: number) => {
  const response = await api.post(`/interests/${interestId}/accept`);
  return response.data;
};

export const initiateExternalChat = async (recipientId: number) => {
  const response = await api.post('/chat/initiate-external', { recipient_id: recipientId });
  return response.data;
}; 