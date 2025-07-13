import { BasicStartup, BasicSpace, UserWorkstationInfo, BasicCompany } from "./space";
import { UserProfile } from "./userProfile"; // Import UserProfile
import { UserRole } from './enums';

// Corresponds to app.models.invitation.InvitationStatus enum
export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
  REVOKED = "revoked",
  DECLINED = "declined",
}

export { UserRole };

// Corresponds to app.schemas.user.User
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  profile_picture_url?: string;
  company_id?: string | null;
  company_name?: string;
  is_active?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Corresponds to app.schemas.auth.Token
export interface Token {
  access_token: string;
  token_type: string;
}

// Corresponds to app.schemas.auth.TokenWithUser
export interface TokenWithUser extends Token {
  user: User & { full_name: string };
}

// Corresponds to app.schemas.user.UserCreateAcceptInvitation
export interface UserCreateAcceptInvitation {
  full_name: string;
  password: string;
}

// Corresponds to app.schemas.invitation.Invitation
export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  startup_id?: string | null;
  company_id?: string | null;
  invitation_token?: string;
  status: InvitationStatus;
  expires_at: string; // ISO datetime string
  created_at: string; // ISO datetime string
  updated_at?: string; // ISO datetime string
  approved_by_admin_id?: string | null;
  accepted_at?: string | null; // ISO datetime string
  accepted_by_user_id?: string | null;
  revoked_at?: string | null; // ISO datetime string
  revoked_by_admin_id?: string | null;
  declined_at?: string | null;
  decline_reason?: string | null;

  // Optional populated fields from backend schema
  startup?: BasicStartup | null;
  company?: BasicCompany | null;
  approved_by_admin?: { id: string; full_name: string } | null;
  accepted_by_user?: User | null;
  revoked_by_admin?: User | null;
}

// Corresponds to app.schemas.user.UserDetail in the backend
export interface UserDetail extends User {
    profile: UserProfile;
    company: BasicCompany | null;
    startup?: BasicStartup | null;
    spaces?: BasicSpace[];
    interests: { id: number; name: string }[];
    space_id?: string | null; // For freelancers
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

export interface AuthState {
  user: User | null;
  token_type: string;
}

/*
export interface SpaceUser extends User {
    // SpaceUser might have additional properties in the future
} 
*/

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