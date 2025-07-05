import { apiClient } from "./base";
import { Space, SpaceCreate } from "@/types/space";
import { User, PaginatedUsers, UserStatusUpdate } from "@/types/user";

/**
 * [Sys Admin] Fetches a list of all spaces in the system.
 */
export const getAllSpaces = async (): Promise<Space[]> => {
    const response = await apiClient.get<Space[]>('/sys-admin/spaces');
    return response.data;
};

/**
 * [Sys Admin] Creates a new space.
 * @param spaceData - The data for the new space.
 */
export const createSpace = async (spaceData: SpaceCreate): Promise<Space> => {
    const response = await apiClient.post<Space>('/sys-admin/spaces', spaceData);
    return response.data;
};
