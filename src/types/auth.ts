import { BasicStartup, BasicCompany, BasicSpace, UserWorkstationInfo } from "./space";
import { UserProfile } from "./userProfile"; // Import UserProfile
import { User } from "./user";

// Corresponds to app.models.invitation.InvitationStatus enum
export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
  REVOKED = "revoked",
  DECLINED = "declined",
}

// Corresponds to app.schemas.user.User
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string; // Consider using an enum if you have UserStatus on frontend
  is_active: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  corporate_admin_id?: number | null;
  startup_id?: number | null;
  space_id?: number | null;
  company_id?: number | null;
  profile?: UserProfile | null;
}

// Corresponds to app.schemas.auth.Token
export interface Token {
  access_token: string;
  token_type: string;
}

// Corresponds to app.schemas.auth.TokenWithUser
export interface TokenWithUser extends Token {
  user: User;
}

// Corresponds to app.schemas.user.UserCreateAcceptInvitation
export interface UserCreateAcceptInvitation {
  full_name: string;
  password: string;
}

// Corresponds to app.schemas.invitation.Invitation
export interface Invitation {
  id: number;
  email: string;
  startup_id: number;
  invitation_token: string;
  status: InvitationStatus;
  expires_at: string; // ISO datetime string
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  approved_by_admin_id?: number | null;
  accepted_at?: string | null; // ISO datetime string
  accepted_by_user_id?: number | null;
  revoked_at?: string | null; // ISO datetime string
  revoked_by_admin_id?: number | null;
  declined_at?: string | null;
  decline_reason?: string | null;

  // Optional populated fields from backend schema
  startup?: BasicStartup | null;
  approved_by_admin?: User | null;
  accepted_by_user?: User | null;
  revoked_by_admin?: User | null;
}

// Corresponds to app.schemas.invitation.InvitationListResponse
export interface InvitationListResponse {
  invitations: Invitation[];
}

// Corresponds to app.schemas.member_request.StartupMemberRequestCreate
export interface StartupMemberRequestCreate {
  email: string;
  full_name?: string | null;
}

// Corresponds to app.schemas.invitation.InvitationDecline (request body)
export interface InvitationDeclineRequest {
  reason?: string | null;
}

// Corresponds to app.schemas.invitation.CorpAdminDirectInviteCreate (request body)
export interface CorpAdminDirectInviteCreate {
  email: string;
  startup_id: number;
}

// Corresponds to app.schemas.invitation.StartupDirectInviteCreate (request body)
export interface StartupDirectInviteCreate {
  email: string;
  startup_id: number;
  full_name?: string | null;
}

// Corresponds to app.schemas.user.UserDetail
export interface UserDetail extends User { // Extends the base User type
  profile?: UserProfile | null;
  company?: BasicCompany | null;
  startup?: BasicStartup & { space_id?: number | null } | null;
  space?: BasicSpace | null;         // Space user BELONGS to
  managed_space?: BasicSpace | null; // Space user MANAGES (if CORP_ADMIN)
  current_workstation?: UserWorkstationInfo | null;
  is_profile_complete?: boolean;
  role: string;
  space_id?: number | null;
}

export interface AuthState {
  user: User | null;
  token_type: string;
}

export interface SpaceUser extends User {
    // SpaceUser might have additional properties in the future
} 

export interface FreelancerCreate {
    full_name: string;
    email: string;
    password: string;
}

export interface StartupAdminCreate {
    user_data: {
        full_name: string;
        email: string;
        password: string;
    };
    startup_data: {
        name: string;
        website: string;
        description: string;
    };
}

export interface CorporateAdminCreate {
    user_data: {
        full_name: string;
        email: string;
        password: string;
    };
    company_data: {
        name: string;
        website: string;
        description: string;
    };
} 