import { apiClient } from "./base";
import { Interest } from "@/types/space";

export const getInterestStatus = async (spaceId: number): Promise<{ has_expressed_interest: boolean }> => {
  const response = await apiClient.get(`/interests/space/${spaceId}/status`);
  return response.data;
};

export const expressInterest = async (spaceId: number): Promise<Interest> => {
    const response = await apiClient.post(`/interests/space/${spaceId}/express`);
    return response.data;
}; 