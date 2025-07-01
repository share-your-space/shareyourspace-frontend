import { apiClient } from "./base";
import { UserDetail, User } from "@/types/auth";
import { UserProfile, UserProfileUpdateRequest } from "@/types/userProfile";

const USERS_API_BASE = "/users";

/**
 * Fetches the detailed profile of a specific user.
 * @param userId The ID of the user whose profile is to be fetched.
 */
export const getUserDetailedProfile = async (userId: number): Promise<UserDetail> => {
  try {
    const response = await apiClient.get<UserDetail>(
      `${USERS_API_BASE}/${userId}/detailed-profile`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching detailed profile for user ${userId}:`, error);
    throw error; 
  }
};

/**
 * Fetches the profile of the currently authenticated user.
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get<UserProfile>(`${USERS_API_BASE}/me/profile`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user's profile:", error);
    throw error;
  }
};

/**
 * Updates the profile of the currently authenticated user.
 * @param profileData The data to update.
 */
export const updateMyProfile = async (profileData: UserProfileUpdateRequest): Promise<UserProfile> => {
  try {
    const response = await apiClient.put<UserProfile>(`${USERS_API_BASE}/me/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating current user's profile:", error);
    throw error;
  }
};

/**
 * Uploads a profile picture for the currently authenticated user.
 * @param file The image file to upload.
 */
export const uploadMyProfilePicture = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post<UserProfile>(
      `${USERS_API_BASE}/me/profile/picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

/**
 * Fetches the basic details of the currently authenticated user.
 */
export const getMe = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`${USERS_API_BASE}/me`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user details:", error);
    throw error;
  }
}; 