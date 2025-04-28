import { type UserProfile as BackendUserProfile } from './user'; // Assuming user types are in user.ts

export interface UserProfile extends BackendUserProfile {
    // Frontend specific additions if any
    // Ensure all fields from backend schemas/user_profile.UserProfile are here
    title?: string | null;
    bio?: string | null;
    contact_info_visibility?: string; // Consider using the enum string values
    skills_expertise?: string[] | null;
    industry_focus?: string[] | null;
    project_interests_goals?: string | null;
    collaboration_preferences?: string[] | null;
    tools_technologies?: string[] | null;
    linkedin_profile_url?: string | null;
    profile_picture_url?: string | null; // Original blob name
    id: number;
    user_id: number;
    full_name?: string | null; // Added
    profile_picture_signed_url?: string | null; // Added
}

export interface MatchResult {
  profile: UserProfile;
  score: number;
  reasons: string[];
} 