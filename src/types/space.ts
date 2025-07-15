import { Startup } from "./organization";

// Based on app.schemas.user.User (BasicUser in space.py context)
export interface BasicUser {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
}

export interface SpaceImage {
  id: string;
  image_url: string;
  signed_url?: string; // Add this to handle new uploads before they are saved
}

// Based on app.schemas.organization.Startup (BasicStartup in space.py context)
export interface BasicStartup {
  id: string;
  name: string;
  description?: string;
  space_id?: string | null;
}

// Based on app.schemas.space.StartupTenantInfo
export interface StartupTenantInfo {
  type: 'startup';
  details: Startup;
  member_count: number;
}

// Based on app.schemas.space.FreelancerTenantInfo
export interface FreelancerTenantInfo {
  type: 'freelancer';
  details: BasicUser; // This was UserSchema in backend, maps to BasicUser here
}

// Based on app.schemas.space.TenantInfo (Union type)
export type TenantInfo = StartupTenantInfo | FreelancerTenantInfo;

// Based on app.schemas.space.SpaceTenantResponse
export interface SpaceTenantResponse {
  tenants: TenantInfo[];
}

// Based on app.schemas.space.ManagedSpaceDetail
export interface ManagedSpaceDetail {
  id: string;
  name: string;
  address: string | null;
  total_workstations: number;
  occupied_workstations: number;
  available_workstations: number;
  maintenance_workstations: number;
  company_id: string | null;
}

// Based on app.schemas.space.WorkstationStatus (Enum)
export enum WorkstationStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
  RESERVED = "RESERVED",
}

// Based on app.schemas.space.WorkstationTenantInfo
export interface WorkstationTenantInfo {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

// Based on app.schemas.space.WorkstationDetail
export interface WorkstationDetail {
  id: string;
  name: string;
  status: WorkstationStatus;
  space_id: string;
  occupant: WorkstationTenantInfo | null;
}

// Based on app.schemas.space.SpaceWorkstationListResponse
export interface SpaceWorkstationListResponse {
  workstations: WorkstationDetail[];
}

// Based on app.schemas.space.WorkstationAssignmentRequest
export interface WorkstationAssignmentRequest {
  user_id: string;
  workstation_id: string;
}

// Based on app.schemas.space.WorkstationAssignmentResponse
export interface WorkstationAssignmentResponse {
  assignment_id: string;
  user_id: string;
  workstation_id: string;
  space_id: string;
}

// Based on app.schemas.space.WorkstationUnassignRequest
export interface WorkstationUnassignRequest {
  workstation_id: string;
}

// Based on app.schemas.space.SpaceAmenity
export interface SpaceAmenity {
  id: string;
  name: string;
}

// Based on app.schemas.space.Space
export interface Space {
  id: string;
  name: string;
  description?: string;
  address: string | null;
  image_url: string;
  images: SpaceImage[];
  amenities: SpaceAmenity[];
  company_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_workstations: number;
  available_workstations: number;
  headline?: string;
  house_rules?: string[];
  vibe?: string[];
  opening_hours?: string;
  key_highlights?: string[];
  neighborhood_description?: string;
}

// Based on app.schemas.space.SpaceCreate
export interface SpaceCreate {
  name: string;
  address: string;
  description?: string;
  total_workstations: number;
  amenities: string[]; // List of amenity names
  headline?: string;
  house_rules?: string[];
  vibe?: string[];
  opening_hours?: string;
  key_highlights?: string[];
  neighborhood_description?: string;
}

// Based on app.schemas.space.SpaceUpdate
export interface SpaceUpdate {
  name?: string;
  address?: string;
  description?: string;
  total_workstations?: number;
  amenities?: string[];
  headline?: string;
  house_rules?: string[];
  vibe?: string[];
  opening_hours?: string;
  key_highlights?: string[];
  neighborhood_description?: string;
}

// Based on app.schemas.space.BrowsableSpace
export interface BrowsableSpace extends Space {
  company_name: string;
  available_workstations: number;
  interest_status: 'interested' | 'not_interested' | 'undecided' | null;
}

// Based on app.schemas.space.SpaceInterestResponse
export interface SpaceInterestResponse {
  space_id: string;
  user_id: string;
  interested: boolean;
}

// Based on app.schemas.space.SpaceWithMyInterest
export interface SpaceWithMyInterest extends Space {
  my_interest: boolean | null;
}

// Based on app.schemas.space.SpaceWithStartupInterest
export interface SpaceWithStartupInterest extends Space {
  startup_interest: boolean | null;
}

// Based on app.schemas.space.SpaceWithAllInterests
export interface SpaceWithAllInterests extends Space {
  my_interest: boolean | null;
  startup_interest: boolean | null;
}

// Based on app.schemas.space.SpaceListResponse
export interface SpaceListResponse {
  spaces: Space[];
}

// Based on app.schemas.space.BrowsableSpaceListResponse
export interface BrowsableSpaceListResponse {
  spaces: BrowsableSpace[];
}

// Based on app.schemas.space.SpaceDetail
export interface SpaceDetail extends Space {
  company: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
  tenants: TenantInfo[];
  workstations: {
    total: number;
    available: number;
    occupied: number;

  };
}

// Based on app.schemas.user.UserWorkstationInfo
export interface UserWorkstationInfo {
  workstation_id: string;
  workstation_name: string;
  space_id: string;
  space_name: string;
}

// Based on app.schemas.space.BasicCompany
export interface BasicCompany {
  id: string;
  name: string;
  profile_image_url?: string;
}

// Based on app.schemas.space.BasicSpace
export interface BasicSpace {
  id: string;
  name: string;
  image_url?: string;
}