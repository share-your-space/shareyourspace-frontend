import { TeamSize, StartupStage, UserStatus } from './enums';
import { UserSimpleInfo } from './connection';

interface OrganizationBase {
  name: string;
  logo_url?: string | null;
  industry_focus?: string | null;
  description?: string | null;
  website?: string | null;
  team_size?: TeamSize | null;
  looking_for?: string[] | null;
  social_media_links?: { [key: string]: string } | null;
}

export interface Company extends OrganizationBase {
  id: number;
  created_at: string;
  updated_at: string;
  admin?: UserSimpleInfo | null;
}

export interface Startup extends OrganizationBase {
  id: number;
  mission?: string | null;
  stage?: StartupStage | null;
  pitch_deck_url?: string | null;
  status: UserStatus;
  admin?: UserSimpleInfo | null;
  created_at: string;
  updated_at: string;
  member_slots_allocated?: number | null;
  member_slots_used?: number | null;
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