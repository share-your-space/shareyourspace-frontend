import { apiClient } from './base';
import { Company, Startup, CompanyUpdate, StartupUpdate } from '@/types/organization';

const ORGANIZATIONS_API_BASE = "/organizations";

export const getCompany = async (companyId: number): Promise<Company> => {
  const response = await apiClient.get<Company>(`${ORGANIZATIONS_API_BASE}/companies/${companyId}`);
  return response.data;
};

export const updateMyCompany = async (data: CompanyUpdate): Promise<Company> => {
  const response = await apiClient.put<Company>(`${ORGANIZATIONS_API_BASE}/companies/me`, data);
  return response.data;
};

export const getStartup = async (startupId: number): Promise<Startup> => {
  const response = await apiClient.get<Startup>(`${ORGANIZATIONS_API_BASE}/startups/${startupId}`);
  return response.data;
};

export const updateMyStartup = async (data: StartupUpdate): Promise<Startup> => {
  const response = await apiClient.put<Startup>(`${ORGANIZATIONS_API_BASE}/startups/me`, data);
  return response.data;
};

export const getMyStartup = async (): Promise<Startup> => {
  const response = await apiClient.get<Startup>(`${ORGANIZATIONS_API_BASE}/startups/me`);
  return response.data;
}

export const createMyStartup = async (startupData: StartupUpdate): Promise<Startup> => {
  const response = await apiClient.post<Startup>(`${ORGANIZATIONS_API_BASE}/startups/me`, startupData);
  return response.data;
}; 