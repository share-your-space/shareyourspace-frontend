'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Edit, Save, X, User } from 'lucide-react';
import { api } from '@/lib/api'; // Assuming api client is set up
import { useAuthStore } from '@/store/authStore'; // Assuming zustand store for auth token

// Define the shape of the profile data based on backend schema
interface UserProfile {
  id: number;
  user_id: number;
  title: string | null;
  bio: string | null;
  full_name: string | null; // From User model, included in response
  contact_info_visibility: 'private' | 'connections' | 'public' | null;
  skills_expertise: string[] | null;
  industry_focus: string[] | null;
  project_interests_goals: string | null;
  collaboration_preferences: string[] | null;
  tools_technologies: string[] | null;
  linkedin_profile_url: string | null;
  profile_picture_url: string | null; // Original blob name
  profile_picture_signed_url: string | null; // Temporary signed URL for display
}

// Schema for form validation using Zod
// Make all fields optional for update, matching UserProfileUpdate
const profileFormSchema = z.object({
  title: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  contact_info_visibility: z.enum(['private', 'connections', 'public']).optional().nullable(),
  // Use string for array fields, convert before sending
  skills_expertise: z.string().optional().nullable(),
  industry_focus: z.string().optional().nullable(),
  project_interests_goals: z.string().optional().nullable(),
  collaboration_preferences: z.string().optional().nullable(),
  tools_technologies: z.string().optional().nullable(),
  linkedin_profile_url: z.string().url().or(z.literal('')).optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

// Helper function to convert comma-separated string to array
const stringToArray = (str: string | null | undefined): string[] | null => {
  if (!str || str.trim() === '') return null;
  return str.split(',').map(item => item.trim()).filter(item => item !== '');
};

// Helper function to convert array to comma-separated string
const arrayToString = (arr: string[] | null | undefined): string => {
  return arr ? arr.join(', ') : '';
};


export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const { token } = useAuthStore(); // Get token for API calls

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      title: '',
      bio: '',
      contact_info_visibility: 'connections',
      skills_expertise: '',
      industry_focus: '',
      project_interests_goals: '',
      collaboration_preferences: '',
      tools_technologies: '',
      linkedin_profile_url: '',
    },
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
      if (!token) return;
      setIsLoading(true);
    try {
      const response = await api.get<UserProfile>('/users/me/profile');
      setProfile(response.data);
      // Reset form with fetched data when starting to edit
      reset({
        title: response.data.title || '',
        bio: response.data.bio || '',
        contact_info_visibility: response.data.contact_info_visibility || 'connections',
        skills_expertise: arrayToString(response.data.skills_expertise),
        industry_focus: arrayToString(response.data.industry_focus),
        project_interests_goals: response.data.project_interests_goals || '',
        collaboration_preferences: arrayToString(response.data.collaboration_preferences),
        tools_technologies: arrayToString(response.data.tools_technologies),
        linkedin_profile_url: response.data.linkedin_profile_url || '',
      });
      setPicturePreview(response.data.profile_picture_signed_url); // Set initial preview
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      toast.error(error.response?.data?.detail || "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
  }, [token, reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditToggle = () => {
    if (!isEditing && profile) {
      // Populate form with current profile data when entering edit mode
      reset({
        title: profile.title || '',
        bio: profile.bio || '',
        contact_info_visibility: profile.contact_info_visibility || 'connections',
        skills_expertise: arrayToString(profile.skills_expertise),
        industry_focus: arrayToString(profile.industry_focus),
        project_interests_goals: profile.project_interests_goals || '',
        collaboration_preferences: arrayToString(profile.collaboration_preferences),
        tools_technologies: arrayToString(profile.tools_technologies),
        linkedin_profile_url: profile.linkedin_profile_url || '',
      });
      setPicturePreview(profile.profile_picture_signed_url); // Reset preview
      setPictureFile(null); // Clear any staged file
    }
    setIsEditing(!isEditing);
  };

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPictureFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile text data submission
  const onSubmit = async (data: ProfileFormData) => {
    if (!token) return;
    setIsSaving(true);

    // Convert comma-separated strings back to arrays for the API
    const updatePayload = {
      ...data,
      // Ensure null is sent if string is empty, otherwise split and trim
      skills_expertise: data.skills_expertise ? stringToArray(data.skills_expertise) : null,
      industry_focus: data.industry_focus ? stringToArray(data.industry_focus) : null,
      collaboration_preferences: data.collaboration_preferences ? stringToArray(data.collaboration_preferences) : null,
      tools_technologies: data.tools_technologies ? stringToArray(data.tools_technologies) : null,
      // Ensure null is sent if URL field is empty/nullish, otherwise send the valid URL
      linkedin_profile_url: data.linkedin_profile_url || null 
    };

    // Log the exact payload being sent
    console.log("Sending profile update payload:", JSON.stringify(updatePayload, null, 2));

    try {
      // First, upload picture if changed
      let pictureUpdated = false;
      if (pictureFile) {
       const formData = new FormData();
        formData.append('file', pictureFile);
        await api.post('/users/me/profile/picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        pictureUpdated = true;
        setPictureFile(null); // Clear file after upload
        toast.success("Profile picture updated!");
      }

      // Then, update profile text data
      // Use the prepared updatePayload which has arrays and correct linkedin_profile_url
      const response = await api.put<UserProfile>('/users/me/profile', updatePayload);
      setProfile(response.data); // Update profile state with response
      reset({ // Reset form with latest data
        title: response.data.title || '',
        bio: response.data.bio || '',
        contact_info_visibility: response.data.contact_info_visibility || 'connections',
        skills_expertise: arrayToString(response.data.skills_expertise),
        industry_focus: arrayToString(response.data.industry_focus),
        project_interests_goals: response.data.project_interests_goals || '',
        collaboration_preferences: arrayToString(response.data.collaboration_preferences),
        tools_technologies: arrayToString(response.data.tools_technologies),
        linkedin_profile_url: response.data.linkedin_profile_url || '',
      });
      // Update preview only if picture wasn't just uploaded (response might have new signed URL)
      if (!pictureUpdated) {
        setPicturePreview(response.data.profile_picture_signed_url);
      } else {
        // If picture was updated, we need to refresh to get the new signed URL
        fetchProfile(); // Re-fetch to get the new signed URL for the uploaded pic
      }

      setIsEditing(false); // Exit edit mode
      if (!pictureUpdated) { // Avoid double toast if picture was already updated
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      // Improved error details for 422
      let errorMessage = "Failed to update profile.";
      if (error.response && error.response.status === 422 && error.response.data && error.response.data.detail) {
          // Pydantic validation errors are often in `detail` which can be an array
          if (Array.isArray(error.response.data.detail)) {
              errorMessage = error.response.data.detail.map((err: any) => `${err.loc?.length > 1 ? err.loc[1] : 'field'}: ${err.msg}`).join('; ');
          } else {
              errorMessage = `Validation Error: ${JSON.stringify(error.response.data.detail)}`;
          }
      } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
     } finally {
      setIsSaving(false);
     }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!profile) {
    return <div className="text-center py-10">Failed to load profile data. Please try again later.</div>;
  }

  // Helper to display profile data or placeholder
  const renderDetail = (label: string, value: string | string[] | null | undefined, isList = false) => (
    <div className="mb-4">
      <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>
      <p className="text-sm mt-1">
        {isList
          ? Array.isArray(value) ? value.join(', ') || 'N/A' : value || 'N/A' // Handle array or string from form
          : value || 'N/A'}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
            <CardDescription>View and manage your profile details.</CardDescription>
           </div>
          <Button variant="outline" size="icon" onClick={handleEditToggle} disabled={isSaving}>
            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            <span className="sr-only">{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Picture Section */}
              <div className="md:col-span-1 flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 border">
                  <AvatarImage src={picturePreview || undefined} alt={profile.full_name || 'User'} />
                  <AvatarFallback><User className="h-16 w-16" /></AvatarFallback>
        </Avatar>
                {isEditing && (
                    <div>
                        <Input
                            id="picture"
                            type="file"
                            accept="image/*"
                            onChange={handlePictureChange}
                            className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Upload a new profile picture.</p>
                    </div>
                )}
                {!isEditing && (
                   <h2 className="text-xl font-semibold text-center">{profile.full_name || 'Your Name'}</h2>
                )}
      </div>

              {/* Profile Details Section */}
              <div className="md:col-span-2 space-y-4">
                {!isEditing ? (
                  <>
                    {renderDetail("Title", profile.title)}
                    {renderDetail("Bio", profile.bio)}
                    {renderDetail("Contact Info Visibility", profile.contact_info_visibility)}
                    {renderDetail("Skills & Expertise", profile.skills_expertise, true)}
                    {renderDetail("Industry Focus", profile.industry_focus, true)}
                    {renderDetail("Project Interests/Goals", profile.project_interests_goals)}
                    {renderDetail("Collaboration Preferences", profile.collaboration_preferences, true)}
                    {renderDetail("Tools & Technologies", profile.tools_technologies, true)}
                    {renderDetail("LinkedIn Profile", profile.linkedin_profile_url)}
                  </>
                ) : (
                  <>
                    {/* Form Fields */}
        <div>
                      <Label htmlFor="title">Title</Label>
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => <Input id="title" placeholder="e.g., Software Engineer, UX Designer" {...field} value={field.value ?? ''} />}
                      />
        </div>
        <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Controller
                        name="bio"
                        control={control}
                        render={({ field }) => <Textarea id="bio" placeholder="Tell us about yourself..." {...field} value={field.value ?? ''}/>}
                      />
      </div>
      <div>
                        <Label htmlFor="contact_info_visibility">Contact Info Visibility</Label>
                         <Controller
                            name="contact_info_visibility"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value ?? 'connections'}>
                                <SelectTrigger id="contact_info_visibility">
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="private">Private</SelectItem>
                                    <SelectItem value="connections">Connections Only</SelectItem>
                                    <SelectItem value="public">Public</SelectItem>
                                </SelectContent>
                                </Select>
                            )}
                        />
      </div>
       <div>
          <Label htmlFor="skills_expertise">Skills & Expertise (comma-separated)</Label>
                        <Controller
                            name="skills_expertise"
                            control={control}
                            render={({ field }) => <Input id="skills_expertise" placeholder="e.g., Python, React, Project Management" {...field} value={field.value ?? ''}/>}
                        />
                         {errors.skills_expertise && <p className="text-xs text-red-500 mt-1">{errors.skills_expertise.message}</p>}
       </div>
       <div>
          <Label htmlFor="industry_focus">Industry Focus (comma-separated)</Label>
                        <Controller
                            name="industry_focus"
                            control={control}
                            render={({ field }) => <Input id="industry_focus" placeholder="e.g., Automotive, SaaS, Healthcare" {...field} value={field.value ?? ''}/>}
                        />
                        {errors.industry_focus && <p className="text-xs text-red-500 mt-1">{errors.industry_focus.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="project_interests_goals">Project Interests/Goals</Label>
                      <Controller
                        name="project_interests_goals"
                        control={control}
                        render={({ field }) => <Textarea id="project_interests_goals" placeholder="What are you working on or looking for?" {...field} value={field.value ?? ''}/>}
                      />
       </div>
       <div>
          <Label htmlFor="collaboration_preferences">Collaboration Preferences (comma-separated)</Label>
                        <Controller
                            name="collaboration_preferences"
                            control={control}
                            render={({ field }) => <Input id="collaboration_preferences" placeholder="e.g., Brainstorming, Focused work" {...field} value={field.value ?? ''}/>}
                        />
                        {errors.collaboration_preferences && <p className="text-xs text-red-500 mt-1">{errors.collaboration_preferences.message}</p>}
       </div>
        <div>
          <Label htmlFor="tools_technologies">Tools & Technologies (comma-separated)</Label>
                        <Controller
                            name="tools_technologies"
                            control={control}
                            render={({ field }) => <Input id="tools_technologies" placeholder="e.g., Figma, Docker, Google Cloud" {...field} value={field.value ?? ''}/>}
                        />
                        {errors.tools_technologies && <p className="text-xs text-red-500 mt-1">{errors.tools_technologies.message}</p>}
       </div>
      <div>
                      <Label htmlFor="linkedin_profile_url">LinkedIn Profile URL</Label>
                      <Controller
                        name="linkedin_profile_url"
                        control={control}
                        render={({ field }) => <Input id="linkedin_profile_url" type="url" placeholder="https://linkedin.com/in/..." {...field} value={field.value ?? ''}/>}
                      />
                       {errors.linkedin_profile_url && <p className="text-xs text-red-500 mt-1">{errors.linkedin_profile_url.message}</p>}
                    </div>
                  </>
                )}
      </div>
      </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 mt-6">
                <Button type="button" variant="outline" onClick={handleEditToggle} disabled={isSaving}>
          Cancel
        </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
        </Button>
      </div>
            )}
    </form>
        </CardContent>
      </Card>
    </div>
  );
} 