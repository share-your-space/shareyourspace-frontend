import { ContactVisibility } from './enums';
import { UserRole } from './enums';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  full_name?: string | null;
  title?: string | null;
  headline?: string | null;
  industry?: string | null;
  bio?: string | null;
  contact_info_visibility?: ContactVisibility | null;
  skills_expertise?: string[] | null;
  industry_focus?: string[] | null;
  project_interests_goals?: string | null;
  collaboration_preferences?: string[] | null;
  tools_technologies?: string[] | null;
  linkedin_profile_url?: string | null;
  website_url?: string | null;
  profile_picture_url?: string | null; // Blob name
  profile_picture_signed_url?: string | null; // Temporary signed URL
  cover_photo_url?: string | null; // Blob name for cover photo
  cover_photo_signed_url?: string | null; // Temporary signed URL for cover
  location?: string;
  website?: string;
  interests?: { id: string; name: string }[];
  is_profile_complete?: boolean;
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
  cover_photo_url?: string | null;
  // profile_picture_url is typically handled by a separate upload endpoint
}