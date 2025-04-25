'use client';

import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import AuthGuard from '@/components/layout/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Terminal, Loader2, CheckCircle, XCircle } from 'lucide-react';

// Define types for profile data (mirroring backend schemas)
interface UserProfileData {
  id?: number;
  user_id?: number;
  title?: string | null;
  bio?: string | null;
  contact_info_visibility?: 'private' | 'connections' | 'public';
  skills_expertise?: string[] | null;
  industry_focus?: string[] | null;
  project_interests_goals?: string | null;
  collaboration_preferences?: string[] | null;
  tools_technologies?: string[] | null;
  linkedin_profile_url?: string | null;
  profile_picture_url?: string | null;
  profile_picture_signed_url?: string | null;
}

// --- Main Page Component ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Separate state for saving
  const [isUploading, setIsUploading] = useState(false); // Add this state variable
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // State for success message
  const [isEditing, setIsEditing] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the selected file

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null); // Clear messages on load
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        const data: UserProfileData = await response.json();
        setProfile(data);
        setPreviewImage(data.profile_picture_signed_url || data.profile_picture_url || null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async (updatedData: UserProfileData) => {
    setIsSaving(true); // Indicate overall saving process starts
    setError(null);
    setSuccessMessage(null);

    let pictureUploadSuccess = true; // Assume success if no file selected

    // 1. Upload picture if a new one is selected
    if (selectedFile) {
      pictureUploadSuccess = await handlePictureUpload(selectedFile);
      if (pictureUploadSuccess) {
        setSelectedFile(null); // Clear selected file state on successful upload
      } else {
        // Error state is already set by handlePictureUpload
        setIsSaving(false); // Stop the overall saving process
        return; // Don't proceed to save text data if upload failed
      }
    }

    // 2. Save profile text data (only if picture upload was successful or not needed)
    const dataChanged = Object.keys(updatedData).some(key => {
        const k = key as keyof UserProfileData;
        // Handle array comparison carefully if needed, simple check for MVP
        return updatedData[k] !== profile?.[k];
    });

    if (!dataChanged) {
        // If only the picture was uploaded, or no changes at all
        setIsEditing(false);
        setIsSaving(false);
        if (pictureUploadSuccess && selectedFile === null) { // Check selectedFile null to confirm pic was just uploaded
           setSuccessMessage("Profile picture updated!");
           setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3s
        } else if (!pictureUploadSuccess){
            // Error message is already set
        } else {
             // No text changes, no pic change
        }
        return;
    }

    // Proceed to save text data
    const success = await handleSaveProfileData(updatedData);

    if (success) {
      setIsEditing(false); // Exit edit mode on success
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3s
    }
    // Error state is set within handleSaveProfileData if it fails

    setIsSaving(false); // Indicate overall saving process ends
  };

  // Function to save only the profile text data
  const handleSaveProfileData = async (updatedData: UserProfileData): Promise<boolean> => {
    if (!token || !profile) return false;
    // This function assumes isSaving state is managed by the caller (handleSave)
    setError(null); // Clear previous errors specific to text saving

    const payload: Partial<UserProfileData> = {};
     Object.keys(updatedData).forEach(key => {
        const k = key as keyof UserProfileData;
        // Basic check, might need deeper comparison for arrays/objects later
        if (updatedData[k] !== profile[k]) {
            // Convert comma-separated strings back to arrays for saving
            if (['skills_expertise', 'industry_focus', 'collaboration_preferences', 'tools_technologies'].includes(k)) {
                payload[k] = stringToArray(updatedData[k] as string | null);
            } else if (k === 'linkedin_profile_url') {
                // Send null if the URL is an empty string, otherwise send the value
                payload[k] = updatedData[k] ? updatedData[k] : null;
            } else {
                 payload[k] = updatedData[k];
            }
        }
    });

    if (Object.keys(payload).length === 0) {
        console.log("No textual profile data changes detected.");
        return true; // No changes needed, consider it a success
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        let errorDetail = 'Failed to save profile data';
        try {
            const errorData = await response.json();
            console.error("Backend Validation Error Data:", errorData); // Log the full error data
            // Attempt to extract a more specific message if available (FastAPI validation errors)
            if (errorData.detail && Array.isArray(errorData.detail)) {
                errorDetail = errorData.detail.map((err: any) => `${err.loc ? err.loc.join(' -> ') : 'field'}: ${err.msg}`).join('; ');
            } else if (errorData.detail) {
                errorDetail = errorData.detail;
            }
        } catch (e) {
            // If parsing JSON fails, use the status text
            errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorDetail); // Throw the improved error message
      }
      const savedProfile: UserProfileData = await response.json();
      // Update local state with the full saved profile (includes pic URL if it was just updated)
      setProfile(savedProfile);
      // Ensure preview reflects the saved state (important if upload happened in same save cycle)
      setPreviewImage(savedProfile.profile_picture_signed_url || savedProfile.profile_picture_url || null);
      console.log("Profile data saved successfully!");
      return true; // Indicate success
    } catch (err: any) {
      console.error("Save Data Error:", err);
      // Error message is now more detailed from the throw above
      setError(err.message || 'Failed to save profile data.');
      return false; // Indicate failure
    }
  };

  // Handle file selection for preview - NO UPLOAD HERE
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Generate local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Store the selected file for later upload on save
      setSelectedFile(file);

      // Reset file input value immediately after selection
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Function to handle profile picture upload to backend - Returns success status
  const handlePictureUpload = async (file: File): Promise<boolean> => {
     if (!token) return false;
     console.log("Initiating upload for:", file.name);
     setIsUploading(true);
     setError(null); // Clear previous errors
     setSuccessMessage(null);

     try {
       const formData = new FormData();
       formData.append('file', file);

       const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/profile/picture`, {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${token}`,
         },
         body: formData,
       });

       if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: `HTTP error ${response.status}: ${response.statusText}` }));
         throw new Error(errorData.detail || 'Upload failed');
       }

       const updatedProfilePartial: UserProfileData = await response.json(); // Backend returns the updated profile part

       // Update *only the picture part* of the main profile state immediately
       setProfile(prev => ({
         ...(prev ?? {}), // Ensure prev is not null
         profile_picture_url: updatedProfilePartial.profile_picture_url,
         profile_picture_signed_url: updatedProfilePartial.profile_picture_signed_url
        }));
       // Set the preview to the confirmed signed URL from the server
       setPreviewImage(updatedProfilePartial.profile_picture_signed_url || updatedProfilePartial.profile_picture_url || null);
       console.log("Picture uploaded successfully!");
       // Don't set global success message here, handleSave will do it.
       return true; // Indicate success

     } catch (err: any) {
       console.error("Upload Error:", err);
       setError(err.message || 'Failed to upload picture.');
       // Reset preview to the last known *good* signed URL on error
       // This might revert the user's selection, which is debatable UX, but prevents showing broken state
       setPreviewImage(profile?.profile_picture_signed_url || profile?.profile_picture_url || null);
       return false; // Indicate failure
     } finally {
         setIsUploading(false);
     }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return <AuthenticatedLayout><div className="p-4 md:p-8"><ProfileSkeleton /></div></AuthenticatedLayout>;
  }

  if (!profile && !isLoading) {
     return (
      <AuthenticatedLayout>
        <div className="p-4 md:p-8">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Could not load profile data.'}</AlertDescription>
          </Alert>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  // Helper function to convert array to comma-separated string for display/editing
  const arrayToString = (arr: string[] | null | undefined): string => {
    return arr ? arr.join(', ') : '';
  };

  // Helper function to convert comma-separated string back to array
  const stringToArray = (str: string | null | undefined): string[] => {
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
  };

  return (
    <AuthGuard>
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>

          {/* Display Success/Error messages */}
          {successMessage && (
             <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300">
               <CheckCircle className="h-4 w-4" />
               <AlertTitle>Success</AlertTitle>
               <AlertDescription>{successMessage}</AlertDescription>
             </Alert>
           )}
           {/* Show error inline during editing or if it happens outside edit mode */}
           {error && (
             <Alert variant="destructive" className="mb-4">
               <XCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           )}

          <Separator className="mb-8" />

          {profile && !isEditing && (
            <ProfileDisplay profile={profile} previewImage={previewImage} />
          )}

          {profile && isEditing && (
            <ProfileEditForm
              profile={profile}
              onSave={handleSave} // Use the combined save handler
              onCancel={() => {
                setIsEditing(false);
                setError(null); // Clear errors on cancel
                setSuccessMessage(null);
                // Reset preview image to original profile URL on cancel
                setPreviewImage(profile.profile_picture_signed_url || profile.profile_picture_url || null);
                setSelectedFile(null); // Clear any selected file
              }}
              isLoading={isSaving || isUploading} // Form shows loading if saving data OR uploading image
              triggerFileInput={triggerFileInput}
              previewImage={previewImage} // Pass current preview
              // Convert arrays to comma-separated strings for Textarea editing
              initialSkills={arrayToString(profile.skills_expertise)}
              initialIndustries={arrayToString(profile.industry_focus)}
              initialCollaborationPrefs={arrayToString(profile.collaboration_preferences)}
              initialTools={arrayToString(profile.tools_technologies)}
            />
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/png, image/jpeg, image/gif" // Accept common image types
          />
        </div>
      </AuthenticatedLayout>
    </AuthGuard>
  );
}

// --- Child Components ---

// --- Profile Display Component ---
interface ProfileDisplayProps {
  profile: UserProfileData;
  previewImage: string | null; // Display uses the potentially updated preview
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile, previewImage }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
         <Avatar className="h-20 w-20">
           <AvatarImage src={previewImage ?? undefined} alt={profile.user_id?.toString() || 'User'} />
           <AvatarFallback>
             {profile.user_id?.toString().substring(0, 2).toUpperCase() || 'U'}
           </AvatarFallback>
         </Avatar>
         <div>
           <h2 className="text-2xl font-semibold">{profile.user_id?.toString()}</h2>
           <p className="text-muted-foreground">{profile.title || 'No title set'}</p>
         </div>
       </div>

      <ProfileField label="Bio" value={profile.bio} isLongText />
      <ProfileField label="LinkedIn Profile" value={profile.linkedin_profile_url} isUrl/>
      <ProfileField label="Contact Info Visibility" value={profile.contact_info_visibility} />
      <ProfileField label="Skills & Expertise" value={profile.skills_expertise?.join(', ')} />
      <ProfileField label="Industry Focus" value={profile.industry_focus?.join(', ')} />
      <ProfileField label="Project Interests/Goals" value={profile.project_interests_goals} isLongText />
      <ProfileField label="Collaboration Preferences" value={profile.collaboration_preferences?.join(', ')} />
      <ProfileField label="Tools & Technologies" value={profile.tools_technologies?.join(', ')} />
    </div>
  );
};

const ProfileField = ({ label, value, isLongText = false, isUrl = false }: { label: string; value: string | string[] | undefined | null; isLongText?: boolean; isUrl?: boolean }) => (
  <div>
    <h3 className="text-lg font-medium mb-1">{label}</h3>
    {value ? (
       isUrl && typeof value === 'string' ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
            {value}
          </a>
        ) : isLongText ? (
        <p className="text-muted-foreground whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-muted-foreground">{Array.isArray(value) ? value.join(', ') : value}</p>
      )
    ) : (
      <p className="text-muted-foreground italic">Not provided</p>
    )}
  </div>
);

// --- Skeleton Loader ---
const ProfileSkeleton = () => (
  <div className="space-y-8">
     <div className="flex justify-between items-center">
       <Skeleton className="h-8 w-48" />
       <Skeleton className="h-10 w-24" />
     </div>
     <Separator />
     <div className="flex items-center space-x-4">
       <Skeleton className="h-20 w-20 rounded-full" />
       <div className="space-y-2">
         <Skeleton className="h-6 w-32" />
         <Skeleton className="h-4 w-48" />
       </div>
     </div>
     <div className="space-y-4">
       <Skeleton className="h-4 w-1/4" />
       <Skeleton className="h-10 w-full" />
     </div>
     <div className="space-y-4">
       <Skeleton className="h-4 w-1/4" />
       <Skeleton className="h-6 w-full" />
     </div>
     <div className="space-y-4">
       <Skeleton className="h-4 w-1/4" />
       <Skeleton className="h-6 w-3/4" />
     </div>
     {/* Add more skeleton fields as needed */}
   </div>
);

// --- Profile Edit Form Component ---
interface ProfileEditFormProps {
  profile: UserProfileData;
  onSave: (data: UserProfileData) => void; // Function now handles both image and text
  onCancel: () => void;
  isLoading: boolean; // Combined loading state for save/upload
  triggerFileInput: () => void; // Function to trigger file input
  previewImage: string | null; // Current preview image URL (local or remote)
  initialSkills: string; // Comma-separated strings for easier textarea editing
  initialIndustries: string;
  initialCollaborationPrefs: string;
  initialTools: string;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isLoading,
  triggerFileInput,
  previewImage,
  initialSkills,
  initialIndustries,
  initialCollaborationPrefs,
  initialTools
}) => {
  // Use initial state from props, converting arrays to strings for editing
  const [formData, setFormData] = useState({
    title: profile.title || '',
    bio: profile.bio || '',
    linkedin_profile_url: profile.linkedin_profile_url || '',
    contact_info_visibility: profile.contact_info_visibility || 'connections',
    skills_expertise: initialSkills, // Use pre-converted string
    industry_focus: initialIndustries, // Use pre-converted string
    project_interests_goals: profile.project_interests_goals || '',
    collaboration_preferences: initialCollaborationPrefs, // Use pre-converted string
    tools_technologies: initialTools, // Use pre-converted string
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper function integrated directly into handleSaveProfileData now

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the current form data (which includes comma-separated strings)
    // The handleSave function (and its sub-functions) will handle conversion back to arrays if needed
    onSave({ ...formData }); // Pass the updated form data
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Image Upload Section */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-24 w-24 cursor-pointer relative group" onClick={triggerFileInput}>
           <AvatarImage src={previewImage ?? undefined} alt={profile.user_id?.toString() || 'User'} className="group-hover:opacity-50 transition-opacity"/>
           <AvatarFallback>{profile.user_id?.toString().substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
           <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white h-8 w-8" />
           </div>
        </Avatar>
        <Button type="button" onClick={triggerFileInput} variant="outline" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
           Change Picture
        </Button>
      </div>

      {/* Text Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <Label htmlFor="title">Title/Role</Label>
           <Input id="title" name="title" value={formData.title} onChange={handleChange} disabled={isLoading} />
        </div>
        <div>
          <Label htmlFor="linkedin_profile_url">LinkedIn Profile URL</Label>
          <Input id="linkedin_profile_url" name="linkedin_profile_url" value={formData.linkedin_profile_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." disabled={isLoading}/>
        </div>
      </div>

      <div>
         <Label htmlFor="bio">Bio/Introduction</Label>
         <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} disabled={isLoading} />
      </div>

       {/* Array-like fields as Textareas */}
       <div>
          <Label htmlFor="skills_expertise">Skills & Expertise (comma-separated)</Label>
          <Textarea id="skills_expertise" name="skills_expertise" value={formData.skills_expertise} onChange={handleChange} rows={3} placeholder="e.g., Python, React, Project Management, UX Design" disabled={isLoading} />
       </div>
       <div>
          <Label htmlFor="industry_focus">Industry Focus (comma-separated)</Label>
          <Textarea id="industry_focus" name="industry_focus" value={formData.industry_focus} onChange={handleChange} rows={2} placeholder="e.g., Automotive, SaaS, Healthcare" disabled={isLoading} />
       </div>
       <div>
          <Label htmlFor="collaboration_preferences">Collaboration Preferences (comma-separated)</Label>
          <Textarea id="collaboration_preferences" name="collaboration_preferences" value={formData.collaboration_preferences} onChange={handleChange} rows={2} placeholder="e.g., Brainstorming, Focused Work, Pair Programming" disabled={isLoading} />
       </div>
        <div>
          <Label htmlFor="tools_technologies">Tools & Technologies (comma-separated)</Label>
          <Textarea id="tools_technologies" name="tools_technologies" value={formData.tools_technologies} onChange={handleChange} rows={2} placeholder="e.g., Figma, Docker, AWS, Jira" disabled={isLoading}/>
       </div>

      <div>
         <Label htmlFor="project_interests_goals">Project Interests / Goals</Label>
         <Textarea id="project_interests_goals" name="project_interests_goals" value={formData.project_interests_goals} onChange={handleChange} rows={4} disabled={isLoading}/>
      </div>

      <div>
          <Label htmlFor="contact_info_visibility">Contact Info Visibility</Label>
           <Select
              name="contact_info_visibility"
              value={formData.contact_info_visibility}
              onValueChange={(value) => handleSelectChange('contact_info_visibility', value)}
              disabled={isLoading}
            >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private (Nobody)</SelectItem>
              <SelectItem value="connections">Connections Only</SelectItem>
              <SelectItem value="public">Public (Visible to all in space)</SelectItem>
            </SelectContent>
          </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}; 