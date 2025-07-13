import { TeamSize } from "./enums";

export interface CompanySettings {
  companyName: string;
  contactEmail: string;
  website?: string;
  address?: string;
  // Add other settings fields as needed
}

export interface Company {
  id: number;
  name: string;
  description: string;
  website: string | null;
  industry_focus: string | null;
  team_size: TeamSize | null;
  created_at: string;
  updated_at: string;
  owner_id: number;
}
