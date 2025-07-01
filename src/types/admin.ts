// Expanded User type based on backend documentation
// Initially from shareyourspace-frontend/src/app/admin/users/page.tsx
export type AdminUserView = {
  id: string;
  full_name: string;
  email: string;
  role: "SYS_ADMIN" | "CORP_ADMIN" | "CORP_EMPLOYEE" | "STARTUP_ADMIN" | "STARTUP_MEMBER" | "FREELANCER";
  status: "PENDING_VERIFICATION" | "WAITLISTED" | "PENDING_ONBOARDING" | "ACTIVE" | "SUSPENDED" | "BANNED";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  space_id?: string | number | null; // This is the direct space_id from user table
  current_space_id?: string | number | null; // This was an alias, ensure consistency with backend field name
  company?: { id: number; name: string } | null;
  startup?: { id: number; name: string } | null;
  managed_space?: { id: number; name: string } | null; // For Corp Admins viewing their managed space
};

// Interface for Space based on backend schema (SpaceNode)
// Initially from shareyourspace-frontend/src/app/admin/spaces/page.tsx
export interface AdminSpaceView {
    id: number;
    name: string;
    location_description?: string | null;
    corporate_admin_id?: number | null; // User ID of the admin
    total_workstations: number;
    created_at: string;
    // Optional: Add company_id or admin details if fetched and needed for display
    admin?: { id?:number; email?: string; full_name?: string } | null; // Included admin object from /admin/spaces potentially
    company?: { id?:number; name?: string } | null; // Included company object from /admin/spaces potentially
}

export interface AdminStatsData {
    total_users: number;
    active_users: number;
    pending_verification_users: number;
    waitlisted_users: number;
    pending_onboarding_corporates: number;
    suspended_users: number;
    banned_users: number;

    total_spaces: number;
    avg_users_per_space?: number; // Optional if calculation is complex or not always available
    avg_workstation_occupancy_rate?: number; // (Occupied/Total Workstations) - might be space-specific or platform wide avg

    total_connections_pending: number;
    total_connections_accepted: number;
    total_connections_declined: number;
    total_connections_blocked: number;

    total_chat_messages: number;
    total_conversations: number;

    // Could add more from the plan like conversion rates, revenue, agent usage, referrals later
    // For now, focusing on counts that are likely directly available from backend DB queries.
}

export type FeedbackStatus = 'New' | 'In Progress' | 'Resolved';
export type FeedbackCategory = 'Bug Report' | 'Feature Suggestion' | 'Matching Quality' | 'General Comment' | 'Other';

export interface FeedbackItem {
    id: number;
    user_id?: number | null; // Assuming it can be anonymous
    user?: { // Optional user details if backend joins them
        id: number;
        email: string;
        full_name?: string | null;
    } | null;
    category: FeedbackCategory | string; // string for flexibility if categories are dynamic
    text: string;
    status: FeedbackStatus;
    submitted_at: string; // ISO date string
}