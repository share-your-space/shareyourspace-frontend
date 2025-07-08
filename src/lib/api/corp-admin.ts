import { apiClient } from "./base";
import {
  ManagedSpaceDetail,
  SpaceTenantResponse,
  SpaceWorkstationListResponse,
  WorkstationDetail,
  MessageResponse,
  WorkstationAssignmentRequest,
  WorkstationStatusUpdateRequest,
  SpaceUsersListResponse,
  SpaceConnectionStatsResponse,
  WorkstationCreate,
  WorkstationUpdate,
  EmployeeListResponse,
  BasicStartup,
  Space,
  SpaceProfile,
  SpaceProfileUpdate,
  WaitlistedUser,
  WaitlistedStartup,
  SpaceCreate,
  SpaceImage,
} from "@/types/space";
import { UserSimpleInfo } from "@/types/user";

const CORP_ADMIN_API_BASE = "/corp-admin";

/**
 * Fetches the spaces associated with the current corporate admin's company.
 */
export const getCompanySpaces = async (): Promise<Space[]> => {
  const response = await apiClient.get<Space[]>(`${CORP_ADMIN_API_BASE}/spaces`);
  return response.data;
};

// Get details of a specific managed space
export const getManagedSpace = async (spaceId: string): Promise<ManagedSpaceDetail> => {
  const response = await apiClient.get<ManagedSpaceDetail>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}`);
  return response.data;
};

// List employees in a specific managed space
export const listSpaceEmployees = async (spaceId: string): Promise<UserSimpleInfo[]> => {
  const response = await apiClient.get<UserSimpleInfo[]>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/employees`);
  return response.data;
};

// List startups and freelancers in a specific managed space
export const listSpaceTenants = async (
  spaceId: number, 
  search?: string, 
  sortBy?: string
): Promise<SpaceTenantResponse> => {
  const response = await apiClient.get<SpaceTenantResponse>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/tenants`, {
    params: { search, sortBy },
  });
  return response.data;
};

// List all workstations in a specific managed space
export const listSpaceWorkstations = async (
  spaceId: number,
  search?: string,
  sortBy?: string
): Promise<SpaceWorkstationListResponse> => {
  const response = await apiClient.get<SpaceWorkstationListResponse>(
    `${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations`,
    {
      params: { search, sortBy },
    }
  );
  return response.data;
};

// Assign a user to a workstation in a specific space
export const assignWorkstation = async (spaceId: string, workstationId: string, userId: string): Promise<any> => {
  const response = await apiClient.post(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations/${workstationId}/assign`, {
    user_id: userId,
    workstation_id: workstationId
  });
  return response.data;
};

// Unassign a user from a workstation in a specific space
export const unassignWorkstation = async (spaceId: string, workstationId: number): Promise<void> => {
  await apiClient.post(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations/${workstationId}/unassign`);
};

// Update the status of a workstation in a specific space
export const updateWorkstationStatus = async (spaceId: string, workstationId: number, status: string): Promise<MessageResponse> => {
  const response = await apiClient.put<MessageResponse>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations/${workstationId}/status`, { status } as WorkstationStatusUpdateRequest);
  return response.data;
};

// Create a workstation in a specific space
export const createWorkstation = async (spaceId: string, data: { name: string }): Promise<WorkstationDetail> => {
  const response = await apiClient.post<WorkstationDetail>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations`, data);
  return response.data;
};

// Update a workstation in a specific space
export const updateWorkstation = async (spaceId: string, workstationId: number, data: WorkstationUpdate): Promise<WorkstationDetail> => {
  const response = await apiClient.put<WorkstationDetail>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations/${workstationId}`, data);
  return response.data;
};

// Delete a workstation from a specific space
export const deleteWorkstation = async (spaceId: string, workstationId: number): Promise<void> => {
  await apiClient.delete(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations/${workstationId}`);
};

// List all users in a specific managed space
export const listAllUsersInSpace = async (
  spaceId: number,
  search?: string,
  sortBy?: string
): Promise<SpaceUsersListResponse> => {
  const response = await apiClient.get<SpaceUsersListResponse>(
    `${CORP_ADMIN_API_BASE}/spaces/${spaceId}/users`,
    {
      params: { search, sortBy },
    }
  );
  return response.data;
};

// Get connection statistics for a specific managed space
export const getSpaceConnectionStats = async (spaceId: string): Promise<SpaceConnectionStatsResponse> => {
  const response = await apiClient.get<SpaceConnectionStatsResponse>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/stats`);
  return response.data;
};

// Fetches all startups within a specific space.
export const getStartupsInSpace = async (spaceId: string): Promise<BasicStartup[]> => {
  const response = await apiClient.get<BasicStartup[]>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/startups`);
  return response.data;
};

/**
 * [Corp Admin] Fetches the editable profile of a specific space.
 * @param spaceId The ID of the space.
 */
export const getSpaceProfileForEdit = async (spaceId: string): Promise<SpaceProfile> => {
  const response = await apiClient.get<SpaceProfile>(`/spaces/${spaceId}/profile`);
  return response.data;
};

/**
 * [Corp Admin] Updates the profile of a specific space.
 * @param spaceId The ID of the space to update.
 * @param profileData The new profile data.
 */
export const updateSpaceProfile = async (spaceId: string, profileData: SpaceProfileUpdate): Promise<SpaceProfile> => {
  const response = await apiClient.put<SpaceProfile>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/profile`, profileData);
  return response.data;
};

/**
 * [Corp Admin] Uploads an image for a space gallery.
 * @param spaceId The ID of the space.
 * @param file The image file to upload.
 */
export const uploadSpaceImage = async (spaceId: string, file: File): Promise<SpaceImage> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<SpaceImage>(
    `${CORP_ADMIN_API_BASE}/spaces/${spaceId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * [Corp Admin] Deletes an image from a space gallery.
 * @param spaceId The ID of the space.
 * @param imageId The ID of the image to delete.
 */
export const deleteSpaceImage = async (spaceId: string, imageId: number): Promise<void> => {
  await apiClient.delete<void>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/images/${imageId}`);
};

/**
 * [Corp Admin] Fetches the waitlist, ranked by interest.
 */
export const getRankedWaitlist = async (
  search?: string,
  type?: string,
  sortBy?: string,
  spaceId?: number,
): Promise<(WaitlistedUser | WaitlistedStartup)[]> => {
  const response = await apiClient.get<(WaitlistedUser | WaitlistedStartup)[]>(`${CORP_ADMIN_API_BASE}/browse-waitlist`, {
    params: { search, type, sortBy, spaceId },
  });
  return response.data;
};

/**
 * [Corp Admin] Adds a tenant (freelancer or startup) to a managed space.
 * @param spaceId The ID of the space to add the tenant to.
 * @param tenantData The ID of the user or startup to add.
 */
export const addTenantToSpace = async (spaceId: number, tenantData: { userId?: number; startupId?: number }): Promise<void> => {
  await apiClient.post(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/add-tenant`, tenantData);
};

/**
 * [Corp Admin] Invites a new user to become a corporate admin for the company.
 * @param email The email of the person to invite.
 */
export const inviteAdmin = async (email: string): Promise<void> => {
  await apiClient.post(`${CORP_ADMIN_API_BASE}/invite-admin`, { email });
};

/**
 * [Corp Admin] Deletes a managed space.
 * @param spaceId The ID of the space to delete.
 */
export const deleteSpace = async (spaceId: number): Promise<void> => {
  await apiClient.delete(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}`);
};

/**
 * [Corp Admin] Creates a new space for the admin's company.
 * @param spaceData The data for the new space.
 */
export const createSpaceForCompany = async (spaceData: SpaceCreate): Promise<Space> => {
  const response = await apiClient.post<Space>(`${CORP_ADMIN_API_BASE}/spaces`, spaceData);
  return response.data;
};

// Update a workstation's details
export const updateWorkstationDetails = async (spaceId: string, workstationId: number, data: { name: string }): Promise<WorkstationDetail> => {
  const response = await apiClient.put<WorkstationDetail>(`${CORP_ADMIN_API_BASE}/spaces/${spaceId}/workstations/${workstationId}`, data);
  return response.data;
};
