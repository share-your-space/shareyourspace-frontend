import { User } from './user'; // Assuming a User type/interface exists
import { BasicUser } from './user'; 

export interface Notification {
  id: number;
  user_id: number;
  type: string; // Or a more specific enum type like NotificationType
  message: string;
  is_read: boolean;
  is_actioned: boolean;
  created_at: string; // ISO 8601 date string
  related_entity_id: number | null;
  reference: string | null;
  link: string | null;
  sender: BasicUser; // Member request notifications will have a sender
  reference_meta?: { // And may have metadata in the reference
    startup_name?: string;
    [key: string]: any;
  };
  requesting_user?: User; // Optional nested user object
} 