export interface Activity {
  id: string;
  type: string;
  timestamp: string; // Using string for ISO date format
  description: string;
  user_avatar_url?: string;
  link?: string;
}

export interface PaginatedActivityResponse {
  activities: Activity[];
  total: number;
}
