import { StartupStage, TeamSize } from "./enums";

export interface CompanySettings {
  companyName: string;
  contactEmail: string;
  website?: string;
  address?: string;
}

export interface BaseOrganization {
    id: string;
    name: string;
    description: string;
    website: string | null;
    industry_focus: string[] | null;
    profile_image_url: string | null;
    type: 'Company' | 'startup';
}

export interface Company extends BaseOrganization {
    type: 'Company';
}

export interface Startup extends BaseOrganization {
    type: 'startup';
    mission?: string | null;
    stage?: StartupStage | null;
    team_size?: TeamSize | null;
    looking_for?: string[] | null;
    pitch_deck_url?: string | null;
    member_slots_allocated?: number;
    member_slots_used?: number;
}
