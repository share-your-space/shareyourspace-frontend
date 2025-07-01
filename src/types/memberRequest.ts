export enum MemberRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface RequestingStartupInfo {
  id: number;
  name: string;
}

export interface RequestedUserInfo {
  id?: number | null;
  full_name?: string | null;
  email: string;
}

export interface MemberRequestDetail {
  id: number; // This is the ID of the NotificationNode
  requested_at: string; // Assuming datetime will be serialized as ISO string
  status: MemberRequestStatus;
  requesting_startup: RequestingStartupInfo;
  requested_user_details?: RequestedUserInfo | null;
  requested_email: string;
}

export interface MemberRequestListResponse {
  requests: MemberRequestDetail[];
}

export interface MemberRequestActionResponse {
  message: string;
  request_id: number;
  new_status: MemberRequestStatus;
}
 