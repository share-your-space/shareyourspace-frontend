// Based on app.schemas.user.User (BasicUser in space.py context)
export interface BasicUser {
  id: number;
  full_name: string | null;
  email: string;
  role: string; // Consider an Enum if roles are strictly defined on frontend too
}

// Based on app.schemas.organization.Startup (BasicStartup in space.py context)
export interface BasicStartup {
  id: number;
  name: string;
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
  id: number;
  name: string;
  address: string | null;
  total_workstations: number;
  occupied_workstations: number;
  available_workstations: number;
  maintenance_workstations: number;
  company_id: number | null;
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
  user_id: number;
  full_name: string | null;
  email: string | null;
}

// Based on app.schemas.space.WorkstationDetail
export interface WorkstationDetail {
  id: number;
  name: string;
  status: WorkstationStatus;
  space_id: number;
  occupant: WorkstationTenantInfo | null;
}

// Based on app.schemas.space.SpaceWorkstationListResponse
export interface SpaceWorkstationListResponse {
  workstations: WorkstationDetail[];
}

// Based on app.schemas.space.WorkstationAssignmentRequest
export interface WorkstationAssignmentRequest {
  user_id: number;
  workstation_id: number;
}

// Based on app.schemas.space.WorkstationAssignmentResponse
export interface WorkstationAssignmentResponse {
  assignment_id: number;
  user_id: number;
  workstation_id: number;
  space_id: number;
}

// Based on app.schemas.space.WorkstationUnassignRequest
export interface WorkstationUnassignRequest {
  workstation_id: number;
}

// Based on app.schemas.space.BrowseableSpace
export interface BrowsableSpace {
  id: number;
  name: string;
  address: string | null;
  headline: string | null;
  cover_image_url: string | null;
  total_workstations: number;
  company_name: string;
  company_id: number | null;
  interest_status: string;
}

// Based on app.schemas.space.WorkstationStatusUpdateRequest
export interface WorkstationStatusUpdateRequest {
  status: WorkstationStatus;
}

// For app.routers.spaces.list_my_space_employees which returns List[UserSchema]
// Assuming UserSchema is more detailed than BasicUser for this context if needed,
// but for now, let's assume it returns a list of BasicUser.
// If it's the full User schema from app.schemas.user.User, we might need a more detailed interface.
// For simplicity now, reusing BasicUser:

// Generic message response (app.schemas.message.Message)
export interface MessageResponse {
  message: string;
}

export interface SpaceUsersListResponse {
  users: BasicUser[];
}

// New interface for connection statistics
export interface SpaceConnectionStatsResponse {
    total_tenants: number;
    total_workstations: number;
    occupied_workstations: number;
    connections_this_month: number;
}

// Basic Company Information
export interface BasicCompany {
  id: number;
  name: string;
  logo_url?: string | null;
}

// Basic Space Information
export interface BasicSpace {
  id: number;
  name: string;
}

// Information about a user's current workstation assignment
export interface UserWorkstationInfo {
  workstation_id: number;
  workstation_name: string;
  assignment_start_date: string; // ISO datetime string
}

export interface WorkstationCreate {
    name: string;
    status?: WorkstationStatus;
}

export interface WorkstationUpdate {
    name?: string;
    status?: WorkstationStatus;
}

import { User } from '../types/auth';
import { Startup } from '../types/organization';
import { UserRole } from './enums';

export interface Interest {
    id: number;
    user: User;
    status: string;
    startup?: Startup;
    created_at: string;
} 

export interface Space {
  id: number;
  name: string;
  address: string | null;
  company_id: number | null;
  total_workstations: number;
  headline: string | null;
  amenities: string[] | null;
  house_rules: string | null;
  vibe: string | null;
  opening_hours?: any;
  key_highlights: string[] | null;
  neighborhood_description: string | null;
  description: string | null;
}

export interface SpaceImage {
  id: number;
  image_url: string;
  description?: string;
}

export interface SpaceProfile {
  id: number;
  name: string;
  address?: string;
  headline?: string;
  description?: string;
  amenities?: string[];
  house_rules?: string;
  vibe?: string;
  key_highlights?: string[];
  images: SpaceImage[];
  company?: BasicCompany | null;
}

export interface SpaceProfileUpdate {
  name?: string;
  address?: string;
  headline?: string;
  description?: string;
  amenities?: string[];
  house_rules?: string;
  vibe?: string;
  key_highlights?: string[];
}

export interface SpaceCreate {
  name: string;
  address: string;
  total_workstations: number;
  corporate_admin_id?: number;
  company_id?: number | null;
}

interface WaitlistedMember {
  id: number;
  role: UserRole;
  full_name?: string;
}

export interface WaitlistedUser {
  id: number;
  name?: string; // For startups
  full_name?: string; // For freelancers
  type: 'freelancer' | 'startup';
  expressed_interest: boolean;
  interest_id?: number;
  entity_type: 'user' | 'startup';
  direct_members?: WaitlistedMember[];
} 

export interface AddUserToSpaceRequest {
  user_id: number;
} 