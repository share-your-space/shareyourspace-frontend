import { api as apiClient } from "../api"; // Adjusted path
import type {
  ManagedSpaceDetail,
  EmployeeListResponse,
  SpaceTenantResponse,
  BasicUser,
  StartupTenantInfo,
  FreelancerTenantInfo,
  TenantInfo,
  WorkstationDetail,
  SpaceWorkstationListResponse,
  WorkstationStatus,
  MessageResponse,
  WorkstationAssignmentRequest,
  WorkstationStatusUpdateRequest,
  SpaceUsersListResponse,
  SpaceConnectionStatsResponse,
  WorkstationCreate,
  WorkstationUpdate
} from '../../types/space';
import { Space, SpaceCreate, SpaceUpdate, SpaceUser, SpaceUserListResponse, BasicStartup } from "@/types/space";

const API_BASE_URL = '/spaces'; // Correct base path for space-related APIs

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken(); 
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || "API request failed");
  }
  return response.json();
}

// Get details of the managed space
export const getMyManagedSpace = async (): Promise<ManagedSpaceDetail> => {
  const response = await apiClient.get<ManagedSpaceDetail>(`${API_BASE_URL}/me`);
  return response.data;
};

// List employees in the managed space
export const listMySpaceEmployees = async (): Promise<BasicUser[]> => {
  const response = await apiClient.get<EmployeeListResponse>(`${API_BASE_URL}/me/employees`);
  return response.data;
};

// List startups and freelancers in the managed space
export const listMySpaceTenants = async (): Promise<SpaceTenantResponse> => {
  const response = await apiClient.get<SpaceTenantResponse>(`${API_BASE_URL}/me/startups-freelancers`);
  return response.data;
};

// List all workstations in the managed space
export const listMySpaceWorkstations = async (): Promise<SpaceWorkstationListResponse> => {
  const response = await apiClient.get<SpaceWorkstationListResponse>(`${API_BASE_URL}/me/workstations`);
  return response.data;
};

// Assign a user to a workstation
export const assignWorkstation = async (workstationId: number, userId: number): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(`${API_BASE_URL}/me/workstations/assign`, { workstation_id: workstationId, user_id: userId } as WorkstationAssignmentRequest);
  return response.data;
};

// Unassign a user from a workstation
export const unassignWorkstation = async (workstationId: number): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(`${API_BASE_URL}/me/workstations/unassign`, { workstation_id: workstationId });
  return response.data;
};

// Update the status of a workstation
export const updateWorkstationStatus = async (workstationId: number, status: WorkstationStatus): Promise<MessageResponse> => {
  const response = await apiClient.put<MessageResponse>(`${API_BASE_URL}/me/workstations/${workstationId}/status`, { status: status } as WorkstationStatusUpdateRequest);
  return response.data;
};

// --- New Workstation CRUD API functions ---
export const createWorkstation = async (data: WorkstationCreate): Promise<WorkstationDetail> => {
  const response = await apiClient.post<WorkstationDetail>(`${API_BASE_URL}/me/workstations`, data);
  return response.data;
};

export const updateWorkstation = async (workstationId: number, data: WorkstationUpdate): Promise<WorkstationDetail> => {
  const response = await apiClient.put<WorkstationDetail>(`${API_BASE_URL}/me/workstations/${workstationId}`, data);
  return response.data;
};

export const deleteWorkstation = async (workstationId: number): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/me/workstations/${workstationId}`);
  // DELETE typically returns 204 No Content, so no data to return
};
// --- End New Workstation CRUD API functions ---

// New function to list all users in the Corp Admin's managed space
export const listAllUsersInMySpace = async (): Promise<SpaceUserListResponse> => {
  const response = await apiClient.get<SpaceUserListResponse>(`${API_BASE_URL}/me/users`);
  return response.data;
};

/**
 * Fetches the total connection statistics for the corporate admin's managed space.
 */
export const getSpaceConnectionStats = async (): Promise<SpaceConnectionStatsResponse> => {
  const response = await apiClient.get<SpaceConnectionStatsResponse>(`${API_BASE_URL}/me/stats`);
  return response.data;
};

/**
 * Fetches all startups within the current user's (Corp Admin's) space.
 * Requires CORP_ADMIN role.
 */
export const getStartupsInMySpace = async (): Promise<BasicStartup[]> => {
  try {
    const response = await apiClient.get<BasicStartup[]>("/spaces/my-space/startups");
    return response.data;
  } catch (error) {
    console.error("Error fetching startups in my space:", error);
    // Consider returning an empty array or re-throwing a more specific error
    throw error;
  }
}; 

// --- System Admin level space management ---

/**
 * [Admin] Fetches a list of all spaces in the system.
 */
export const adminGetAllSpaces = async (): Promise<Space[]> => {
    const response = await apiClient.get<Space[]>('/admin/spaces');
    return response.data;
};

/**
 * [Admin] Creates a new space.
 * @param spaceData - The data for the new space, including company_id.
 */
export const adminCreateSpace = async (spaceData: SpaceCreate): Promise<Space> => {
    const response = await apiClient.post<Space>('/admin/spaces', spaceData);
    return response.data;
};