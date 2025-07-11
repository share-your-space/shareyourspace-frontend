import { TeamSize, StartupStage, UserStatus } from './enums';
import { UserSimpleInfo } from './connection';
import { User } from './auth';

interface OrganizationBase {
  name: string;
  logo_url?: string | null;
  industry_focus?: string[] | null;
  description?: string | null;
  website?: string | null;
  team_size?: TeamSize | null;
  looking_for?: string[] | null;
  social_media_links?: { [key: string]: string } | null;
}

export interface Company {
  id: number;
  name: string;
  logo_url?: string | null;
  website?: string | null;
  industry_focus?: string | null; // Changed from string[]
  team_size?: TeamSize | null;
  description?: string | null;
  looking_for?: string[] | null;
  social_media_links?: { [key: string]: string } | null;
  created_at: string;
  updated_at: string;
  admin?: UserSimpleInfo | null;
  // This can be expanded based on what the backend provides
  direct_members?: User[] | null;
}

export interface Startup extends OrganizationBase {
  id: number;
  type: "startup"; // Add the type property
  expressed_interest?: boolean;
  mission?: string | null;
  stage?: StartupStage | null;
  pitch_deck_url?: string | null;
  status: UserStatus;
  admin?: UserSimpleInfo | null;
  created_at: string;
  updated_at: string;
  member_slots_allocated?: number | null;
  member_slots_used?: number | null;
  direct_members?: User[] | null;
}

export interface CompanyUpdate extends Omit<OrganizationBase, 'name'> {
  name?: string;
}

export interface StartupUpdate extends Omit<OrganizationBase, 'name'> {
    name?: string;
    mission?: string | null;
    stage?: StartupStage | null;
    pitch_deck_url?: string | null;
}