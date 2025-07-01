import { apiClient } from "./base";
import { 
    TokenWithUser, 
    UserCreateAcceptInvitation,
    InvitationListResponse, 
    Invitation,
    InvitationDeclineRequest,
    CorpAdminDirectInviteCreate,
    InvitationDetails,
    StartupDirectInviteCreate
} from "@/types/auth";

const INVITATIONS_API_BASE = "/invitations";

export const getInvitationDetails = async (token: string): Promise<InvitationDetails> => {
  const response = await apiClient.get<InvitationDetails>(`${INVITATIONS_API_BASE}/${token}/details`);
  return response.data;
};

export const acceptInvitation = async (
  invitationToken: string,
  userData: UserCreateAcceptInvitation
): Promise<TokenWithUser> => {
    const response = await apiClient.post<TokenWithUser>(
      `${INVITATIONS_API_BASE}/accept/${invitationToken}`,
      userData
    );
    return response.data;
};

/**
 * Lists pending invitations for the current startup admin's startup.
 * Requires STARTUP_ADMIN role.
 */
export const listPendingStartupInvitations = async (): Promise<InvitationListResponse> => {
  try {
    const response = await apiClient.get<InvitationListResponse>(
      `${INVITATIONS_API_BASE}/startup/pending`
    );
    return response.data;
  } catch (error) {
    console.error("Error listing pending startup invitations:", error);
    throw error;
  }
};

/**
 * Revokes a pending startup invitation.
 * Requires STARTUP_ADMIN role.
 * @param invitationId The ID of the invitation to revoke.
 */
export const revokeStartupInvitation = async (invitationId: number): Promise<Invitation> => {
  try {
    const response = await apiClient.put<Invitation>(
      `${INVITATIONS_API_BASE}/${invitationId}/revoke`
      // No body needed for revoke, action is based on path param and auth
    );
    return response.data;
  } catch (error) {
    console.error(`Error revoking startup invitation ${invitationId}:`, error);
    throw error;
  }
};

/**
 * Declines a startup invitation.
 * @param invitationToken The token of the invitation to decline.
 * @param declineData Optional data containing the reason for declining.
 */
export const declineStartupInvitation = async (
  invitationToken: string,
  declineData?: InvitationDeclineRequest
): Promise<Invitation> => {
  try {
    const response = await apiClient.post<Invitation>(
      `${INVITATIONS_API_BASE}/decline/${invitationToken}`,
      declineData // Optional body
    );
    return response.data;
  } catch (error) {
    console.error(`Error declining startup invitation ${invitationToken}:`, error);
    throw error;
  }
};

/**
 * Allows a Corp Admin to directly invite a user to a startup.
 * @param inviteData Email and startup_id for the invitation.
 */
export const directInviteByCorpAdmin = async (
  inviteData: CorpAdminDirectInviteCreate
): Promise<Invitation> => {
  try {
    const response = await apiClient.post<Invitation>(
      `${INVITATIONS_API_BASE}/corp-admin/direct-invite`,
      inviteData
    );
    return response.data;
  } catch (error) {
    console.error("Error sending direct invitation by Corp Admin:", error);
    throw error;
  }
};

/**
 * Allows a Startup Admin to directly invite a user to their startup.
 * @param inviteData Email and startup_id for the invitation.
 */
export const directInviteStartupMember = async (
  inviteData: StartupDirectInviteCreate
): Promise<Invitation> => {
  try {
    const response = await apiClient.post<Invitation>(
      `${INVITATIONS_API_BASE}/invite`,
      inviteData
    );
    return response.data;
  } catch (error) {
    console.error("Error sending direct invitation by Startup Admin:", error);
    throw error;
  }
}; 