import { ContactVisibility } from './enums';

export interface UserProfile {
  id: number;
  user_id: number;
  full_name?: string | null;
  title?: string | null;
  bio?: string | null;
  contact_info_visibility?: ContactVisibility | null;
  skills_expertise?: string[] | null;
  industry_focus?: string[] | null;
  project_interests_goals?: string | null;
  collaboration_preferences?: string[] | null;
  tools_technologies?: string[] | null;
  linkedin_profile_url?: string | null;
  profile_picture_url?: string | null; // Blob name
  profile_picture_signed_url?: string | null; // Temporary signed URL
}

// Fields that can be updated for a user profile
export interface UserProfileUpdateRequest {
  title?: string | null;
  bio?: string | null;
  contact_info_visibility?: ContactVisibility | null;
  skills_expertise?: string[] | null;
  industry_focus?: string[] | null;
  project_interests_goals?: string | null;
  collaboration_preferences?: string[] | null;
  tools_technologies?: string[] | null;
  linkedin_profile_url?: string | null;
  // profile_picture_url is typically handled by a separate upload endpoint
} 