import { TeamSize } from "./enums";
import { UserSimpleInfo } from "./connection";
import { User } from "./auth";

export interface CompanySettings {
  companyName: string;
  contactEmail: string;
  website?: string;
  address?: string;
}

export interface Company {
  id: number;
  name: string;
  description: string;
  website: string | null;
  industry_focus: string[] | null;
  team_size?: TeamSize | null;
  looking_for?: string[] | null;
  created_at?: string;
  updated_at?: string;
  owner_id?: number;
  admin?: UserSimpleInfo | null;
  direct_members?: User[] | null;
  profile_image_url?: string;
  type: 'Company' | 'Startup';
}
