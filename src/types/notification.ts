import { User } from './auth';

export interface Notification {
  id: string;
  user_id: string;
  type: string; // Or a more specific enum type like NotificationType
  message: string;
  is_read: boolean;
  created_at: string; // ISO 8601 date string
  related_entity_id: string | null;
  link: string | null;
  sender: User; // Member request notifications will have a sender
}