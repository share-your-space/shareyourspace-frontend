import { TeamSize, StartupStage } from "./enums";
import { User } from "./auth";

export interface CompanySettings {
  companyName: string;
  contactEmail: string;
  website?: string;
  address?: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  website: string | null;
  industry_focus: string[] | null;
  team_size?: TeamSize | null;
  looking_for?: string[] | null;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  admin?: User | null;
  direct_members?: User[] | null;
  profile_image_url?: string;
  type: 'Company' | 'Startup';
}

export interface Company extends Organization {
    type: 'Company';
}

export interface Startup extends Organization {
    type: 'Startup';
    mission?: string;
    stage?: StartupStage;
    pitch_deck_url?: string;
}
