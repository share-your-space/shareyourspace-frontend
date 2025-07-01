import { apiClient } from './base';
import axios from 'axios';
import { FreelancerCreate, StartupAdminCreate, CorporateAdminCreate } from '@/types/auth';

export const registerFreelancer = async (userData: FreelancerCreate) => {
  try {
    const response = await apiClient.post('/auth/register/freelancer', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error('An unexpected error occurred during registration.');
  }
};

export const registerStartupAdmin = async (data: StartupAdminCreate) => {
  try {
    const response = await apiClient.post('/auth/register/startup-admin', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error('An unexpected error occurred during registration.');
  }
};

export const registerCorporateAdmin = async (data: CorporateAdminCreate) => {
  try {
    const response = await apiClient.post('/auth/register/corporate-admin', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error;
    }
    throw new Error('An unexpected error occurred during registration.');
  }
};

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await apiClient.post('/auth/request-password-reset', { email });
    return response.data;
  } catch (error) {
    // Axios wraps errors, so we re-throw the 'detail' message for consistency
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Failed to send reset link.');
    }
    throw error; // Re-throw other errors
  }
};

export const resetPassword = async (token: string, new_password: string) => {
    try {
        const response = await apiClient.post('/auth/reset-password', { token, new_password });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to reset password.');
        }
        throw error;
    }
}; 