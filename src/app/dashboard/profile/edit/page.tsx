"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { UserProfile, UserProfileUpdateRequest } from '@/types/userProfile';
import { ContactVisibility } from '@/types/enums';
import { getMyProfile, updateMyProfile, uploadMyProfilePicture, uploadCoverPhoto } from '@/lib/api/users';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UploadCloud, Edit } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Separator } from '@/components/ui/separator';
import { EditableSection } from '@/components/corp-admin/space-profile/EditableSection';
import { TagInput } from '@/components/ui/TagInput';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';

const profileFormSchema = z.object({
  title: z.string().max(100, "Title too long").optional().nullable(),
  bio: z.string().max(2000, "Bio too long").optional().nullable(),
  contact_info_visibility: z.nativeEnum(ContactVisibility).optional().nullable(),
  skills_expertise: z.array(z.string().min(1, "Skill cannot be empty").max(50, "Skill too long")).optional().nullable(),
  industry_focus: z.array(z.string().min(1, "Industry cannot be empty").max(50, "Industry too long")).optional().nullable(),
  project_interests_goals: z.string().max(1000, "Interests/goals too long").optional().nullable(),
  collaboration_preferences: z.array(z.string().min(1, "Preference cannot be empty").max(50, "Preference too long")).optional().nullable(),
  tools_technologies: z.array(z.string().min(1, "Tool/tech cannot be empty").max(50, "Tool too long")).optional().nullable(),
  linkedin_profile_url: z.string().url("Invalid URL").or(z.literal('')).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const EditProfilePage = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authIsLoading = useAuthStore((state) => state.isLoading);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const { control, reset, getValues } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      title: '',
      bio: '',
      skills_expertise: [],
      industry_focus: [],
      tools_technologies: [],
      linkedin_profile_url: '',
    }
  });

  const fetchProfile = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const fetchedProfile = await getMyProfile();
      setProfile(fetchedProfile);
      reset({
        title: fetchedProfile.title || '',
        bio: fetchedProfile.bio || '',
        contact_info_visibility: fetchedProfile.contact_info_visibility || undefined,
        skills_expertise: fetchedProfile.skills_expertise || [],
        industry_focus: fetchedProfile.industry_focus || [],
        project_interests_goals: fetchedProfile.project_interests_goals || '',
        collaboration_preferences: fetchedProfile.collaboration_preferences || [],
        tools_technologies: fetchedProfile.tools_technologies || [],
        linkedin_profile_url: fetchedProfile.linkedin_profile_url || '',
      });
      if (fetchedProfile.profile_picture_signed_url) {
        setPreviewImageUrl(fetchedProfile.profile_picture_signed_url);
      }
    } catch (error) {
      toast.error("Failed to load your profile data.");
      router.push('/dashboard');
    } finally {
      setIsPageLoading(false);
    }
  }, [reset, router]);

  useEffect(() => {
    if (!authIsLoading && user) {
      fetchProfile();
    } else if (!authIsLoading && !user) {
      router.push('/login');
    }
  }, [user, authIsLoading, fetchProfile, router]);
  
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const updatedProfile = await uploadMyProfilePicture(e.target.files[0]);
        setProfile(updatedProfile);
        setPreviewImageUrl(updatedProfile.profile_picture_signed_url);
        setProfilePictureFile(null);
        toast.success("Profile picture updated!");
      } catch (error) {
        toast.error("Failed to upload profile picture.");
      }
    }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const updatedProfile = await uploadCoverPhoto(e.target.files[0]);
        setProfile(updatedProfile);
        toast.success("Cover photo updated!");
      } catch (error) {
        toast.error("Failed to upload cover photo.");
      }
    }
  };

  const handleSave = async (fields: (keyof ProfileFormValues)[]) => {
    if (!user) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      const dataToSave: Partial<UserProfileUpdateRequest> = {};
      fields.forEach(field => {
        dataToSave[field] = getValues(field);
      });
      const updatedProfile = await updateMyProfile(dataToSave);
      setProfile(updatedProfile);
      toast.success("Profile Updated");
      router.push(`/users/${user.id}`);
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.message || "Failed to update profile.";
      toast.error(msg);
    }
  };

  if (isPageLoading || authIsLoading) {
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Loading profile editor...</p></div>;
  }
  
  if (!user || !profile) {
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Could not load profile.</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <ProfileHeader 
        profile={profile}
        isEditing={isEditing}
        onProfilePictureUpload={handleProfilePictureUpload}
        onCoverPhotoUpload={handleCoverPhotoUpload}
      />
      
      <div className="pt-12">
        <div className="flex justify-between items-center">
          <div className="text-center flex-grow">
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-md text-gray-500">{profile.title}</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>
      
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <EditableSection title="About" isEditing={isEditing} onSave={() => handleSave(['bio'])} editContent={
            <Controller name="bio" control={control} render={({ field }) => <Textarea {...field} rows={5} placeholder="Tell us about yourself..." />} />
          }>
            <p className="text-gray-600 prose">{profile.bio || 'Tell us about yourself...'}</p>
          </EditableSection>
          
          <EditableSection title="Skills & Expertise" isEditing={isEditing} onSave={() => handleSave(['skills_expertise'])} editContent={
            <Controller name="skills_expertise" control={control} render={({ field }) => <TagInput {...field} placeholder="Add a skill..." />} />
          }>
            <div className="flex flex-wrap gap-2">
              {profile.skills_expertise?.map(skill => <div key={skill} className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-medium">{skill}</div>)}
            </div>
          </EditableSection>

          <EditableSection title="Industry Focus" isEditing={isEditing} onSave={() => handleSave(['industry_focus'])} editContent={
            <Controller name="industry_focus" control={control} render={({ field }) => <TagInput {...field} placeholder="Add an industry..." />} />
          }>
            <div className="flex flex-wrap gap-2">
              {profile.industry_focus?.map(industry => <div key={industry} className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-medium">{industry}</div>)}
            </div>
          </EditableSection>

          <EditableSection title="Tools & Technologies" isEditing={isEditing} onSave={() => handleSave(['tools_technologies'])} editContent={
            <Controller name="tools_technologies" control={control} render={({ field }) => <TagInput {...field} placeholder="Add a tool..." />} />
          }>
            <div className="flex flex-wrap gap-2">
              {profile.tools_technologies?.map(tool => <div key={tool} className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-medium">{tool}</div>)}
            </div>
          </EditableSection>
          
          <EditableSection title="LinkedIn" isEditing={isEditing} onSave={() => handleSave(['linkedin_profile_url'])} editContent={
             <Controller name="linkedin_profile_url" control={control} render={({ field }) => <Input {...field} placeholder="https://linkedin.com/in/yourprofile" />} />
          }>
            <a href={profile.linkedin_profile_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{profile.linkedin_profile_url}</a>
          </EditableSection>

        </div>

        <div className="md:col-span-1 space-y-4">
          <ProfileSidebar />
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage; 