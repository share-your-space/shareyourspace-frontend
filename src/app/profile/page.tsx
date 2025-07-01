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
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import UserProfileDisplay from '@/components/profile/UserProfileDisplay';
import { UserDetail } from '@/types/auth';
import { TagInput } from '@/components/ui/TagInput';

const profileFormSchema = z.object({
  title: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  contact_info_visibility: z.enum(['private', 'connections', 'public']).optional().nullable(),
  skills_expertise: z.array(z.string()).optional().nullable(),
  industry_focus: z.array(z.string()).optional().nullable(),
  project_interests_goals: z.string().optional().nullable(),
  collaboration_preferences: z.array(z.string()).optional().nullable(),
  tools_technologies: z.array(z.string()).optional().nullable(),
  linkedin_profile_url: z.string().url().or(z.literal('')).optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

function ProfilePageContent() {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const storeUser = useAuthStore((state) => state.user);
  const setUserInStore = useAuthStore((state) => state.setUser);


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
      skills_expertise: [],
      industry_focus: [],
      project_interests_goals: '',
      collaboration_preferences: [],
      tools_technologies: [],
      linkedin_profile_url: '',
    },
  });

  const fetchAndSetDetailedProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<UserDetail>('/users/me');
      const detailedProfile = response.data;
      setUserDetail(detailedProfile);
      setUserInStore(detailedProfile);

      reset({
        title: detailedProfile.profile?.title || '',
        bio: detailedProfile.profile?.bio || '',
        contact_info_visibility: detailedProfile.profile?.contact_info_visibility || 'connections',
        skills_expertise: detailedProfile.profile?.skills_expertise || [],
        industry_focus: detailedProfile.profile?.industry_focus || [],
        project_interests_goals: detailedProfile.profile?.project_interests_goals || '',
        collaboration_preferences: detailedProfile.profile?.collaboration_preferences || [],
        tools_technologies: detailedProfile.profile?.tools_technologies || [],
        linkedin_profile_url: detailedProfile.profile?.linkedin_profile_url || '',
      });
      setPicturePreview(detailedProfile.profile?.profile_picture_signed_url || null);
    } catch (error: any) {
      console.error("Failed to fetch detailed profile:", error);
      toast.error(error.response?.data?.detail || "Failed to load detailed profile information.");
    } finally {
      setIsLoading(false);
    }
  }, [reset, setUserInStore]);

  useEffect(() => {
    fetchAndSetDetailedProfile();
  }, [fetchAndSetDetailedProfile]);

  const handleEditToggle = () => {
    if (!isEditing) {
      fetchAndSetDetailedProfile().then(() => {
        setIsEditing(true);
      });
      setPictureFile(null);
    } else {
      setIsEditing(false);
      if (userDetail?.profile) {
        reset({
          title: userDetail.profile.title || '',
          bio: userDetail.profile.bio || '',
          contact_info_visibility: userDetail.profile.contact_info_visibility || 'connections',
          skills_expertise: userDetail.profile.skills_expertise || [],
          industry_focus: userDetail.profile.industry_focus || [],
          project_interests_goals: userDetail.profile.project_interests_goals || '',
          collaboration_preferences: userDetail.profile.collaboration_preferences || [],
          tools_technologies: userDetail.profile.tools_technologies || [],
          linkedin_profile_url: userDetail.profile.linkedin_profile_url || '',
        });
        setPicturePreview(userDetail.profile.profile_picture_signed_url || null);
      }
    }
  };

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!storeUser) return;
    setIsSaving(true);

    const updatePayload = {
      ...data,
      linkedin_profile_url: data.linkedin_profile_url || null
    };

    try {
      let pictureUpdated = false;
      if (pictureFile) {
        const formData = new FormData();
        formData.append('file', pictureFile);
        await api.post('/users/me/profile/picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        pictureUpdated = true;
        setPictureFile(null);
        toast.success("Profile picture updated!");
      }

      const response = await api.put<UserDetail>('/users/me/profile', updatePayload);
      
      setIsEditing(false);
      
      if (pictureUpdated) {
        fetchAndSetDetailedProfile();
      } else {
        setUserDetail(response.data);
        setUserInStore(response.data);
      }

      if (!pictureUpdated) {
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      let errorMessage = "Failed to update profile.";
      if (error.response && error.response.status === 422 && error.response.data && error.response.data.detail) {
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

  if (isLoading || !userDetail) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const displayFullName = userDetail?.full_name || 'User';
  const displayAvatarFallback = displayFullName.substring(0, 2).toUpperCase();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {isEditing ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-4">
               <Avatar className="h-20 w-20">
                <AvatarImage src={picturePreview || undefined} alt={displayFullName} />
                <AvatarFallback>{displayAvatarFallback}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold">{displayFullName}</CardTitle>
                <CardDescription>Update your personal and professional information.</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleEditToggle} size="icon">
              <X className="h-5 w-5" />
              <span className="sr-only">Cancel Edit</span>
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <Input id="profilePicture" type="file" accept="image/*" onChange={handlePictureChange} disabled={isSaving} />
                {picturePreview && (
                  <div className="mt-2 w-32 h-32 rounded-full overflow-hidden border">
                    <img src={picturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Form fields */}
              <div className="space-y-2">
                <Label htmlFor="title">Title / Headline</Label>
                <Controller name="title" control={control} render={({ field }) => <Input id="title" placeholder="e.g., Senior Developer, CEO" {...field} value={field.value || ''} disabled={isSaving}/>} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Controller name="bio" control={control} render={({ field }) => <Textarea id="bio" placeholder="Tell us about yourself..." {...field} value={field.value || ''} rows={4} disabled={isSaving}/>} />
                {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info_visibility">Contact Info Visibility</Label>
                <Controller name="contact_info_visibility" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || 'connections'} disabled={isSaving}>
                    <SelectTrigger id="contact_info_visibility"><SelectValue placeholder="Select visibility" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
                {errors.contact_info_visibility && <p className="text-sm text-destructive">{errors.contact_info_visibility.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label>Skills & Expertise</Label>
                <Controller name="skills_expertise" control={control} render={({ field }) => <TagInput {...field} placeholder="Add a skill and press Enter..." />} />
                {errors.skills_expertise && <p className="text-sm text-destructive">{errors.skills_expertise.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Industry Focus</Label>
                <Controller name="industry_focus" control={control} render={({ field }) => <TagInput {...field} placeholder="Add an industry and press Enter..."/>} />
                {errors.industry_focus && <p className="text-sm text-destructive">{errors.industry_focus.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_interests_goals">Project Interests / Goals</Label>
                <Controller name="project_interests_goals" control={control} render={({ field }) => <Textarea id="project_interests_goals" placeholder="e.g., Looking for collaborations in AI..." {...field} value={field.value || ''} rows={3} disabled={isSaving}/>} />
                {errors.project_interests_goals && <p className="text-sm text-destructive">{errors.project_interests_goals.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Collaboration Preferences</Label>
                <Controller name="collaboration_preferences" control={control} render={({ field }) => <TagInput {...field} placeholder="Add a preference and press Enter..." />} />
                {errors.collaboration_preferences && <p className="text-sm text-destructive">{errors.collaboration_preferences.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tools & Technologies</Label>
                <Controller name="tools_technologies" control={control} render={({ field }) => <TagInput {...field} placeholder="Add a tool and press Enter..." />} />
                {errors.tools_technologies && <p className="text-sm text-destructive">{errors.tools_technologies.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_profile_url">LinkedIn Profile URL</Label>
                <Controller name="linkedin_profile_url" control={control} render={({ field }) => <Input id="linkedin_profile_url" type="url" placeholder="https://linkedin.com/in/yourprofile" {...field} value={field.value || ''} disabled={isSaving}/>} />
                {errors.linkedin_profile_url && <p className="text-sm text-destructive">{errors.linkedin_profile_url.message}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleEditToggle} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto">
          <UserProfileDisplay userDetail={userDetail} />
           <div className="flex justify-center mt-6">
              <Button onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthenticatedLayout>
      <ProfilePageContent />
    </AuthenticatedLayout>
  );
} 