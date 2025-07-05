"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSpace } from '@/context/SpaceContext';
import { getSpaceProfileForEdit, updateSpaceProfile, uploadSpaceImage, deleteSpaceImage, deleteSpace } from '@/lib/api/corp-admin';
import { toast } from 'sonner';
import { SpaceProfile } from '@/types/space';
import { useRouter } from 'next/navigation';

// New Components
import { PhotoGallery } from '@/components/corp-admin/space-profile/PhotoGallery';
import { SpaceHeader } from '@/components/corp-admin/space-profile/SpaceHeader';
import { EditableSection } from '@/components/corp-admin/space-profile/EditableSection';
import { StickySidebar } from '@/components/corp-admin/space-profile/StickySidebar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/TagInput';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DeleteSpaceDialog } from '@/components/corp-admin/space-profile/DeleteSpaceDialog';

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  headline: z.string().min(1, "Headline is required"),
  description: z.string().min(1, "Description is required"),
  amenities: z.array(z.string()).optional(),
  houseRules: z.string().optional(),
  vibe: z.string().optional(),
  keyHighlights: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const SpaceProfilePage = () => {
  const { selectedSpace, refetchSpaces } = useSpace();
  const [profile, setProfile] = useState<SpaceProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, reset, getValues } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const fetchProfile = useCallback(async () => {
    if (selectedSpace) {
      try {
        const fetchedProfile = await getSpaceProfileForEdit(selectedSpace.id);
        setProfile(fetchedProfile);
        reset({
          name: fetchedProfile.name || '',
          address: fetchedProfile.address || '',
          headline: fetchedProfile.headline || '',
          description: fetchedProfile.description || '',
          amenities: fetchedProfile.amenities || [],
          houseRules: fetchedProfile.house_rules || '',
          vibe: fetchedProfile.vibe || '',
          keyHighlights: fetchedProfile.key_highlights || [],
        });
      } catch (error) {
        toast.error("Failed to fetch space profile.");
        console.error(error);
      }
    }
  }, [selectedSpace, reset]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  const handleSave = async (field: keyof ProfileFormValues) => {
    if (!selectedSpace) return;
    try {
      const value = getValues(field);
      const payload = { [field]: value };
      
      const updatedProfile = await updateSpaceProfile(selectedSpace.id, payload);
      setProfile(updatedProfile);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated!`);
    } catch (error) {
      toast.error(`Failed to update ${field}.`);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && selectedSpace) {
      const file = event.target.files[0];
      try {
        const newImage = await uploadSpaceImage(selectedSpace.id, file);
        if (profile) {
          const updatedImages = [...profile.images, newImage];
          setProfile({ ...profile, images: updatedImages });
        }
        toast.success("Image uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload image.");
      }
    }
  };

  const handleImageDelete = async (imageId: number) => {
    if (selectedSpace) {
      try {
        await deleteSpaceImage(selectedSpace.id, imageId);
        setProfile(prev => prev ? { ...prev, images: prev.images.filter(img => img.id !== imageId) } : null);
        toast.success("Image deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete image.");
      }
    }
  };

  const handleDeleteSpace = async () => {
    if (!selectedSpace) return;
    setIsDeleting(true);
    try {
      await deleteSpace(selectedSpace.id);
      toast.success(`Space "${selectedSpace.name}" has been deleted.`);
      // Refetch spaces for the context
      await refetchSpaces();
      // Redirect to the main dashboard
      router.push('/corp-admin');
    } catch (error) {
      toast.error("Failed to delete space.", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  if (!profile) {
    return <p>Loading space profile or please select a space...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <PhotoGallery 
        images={profile.images} 
        isEditing={isEditing}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
      />
      <div className="mt-8">
        <SpaceHeader profile={profile} isEditing={isEditing} onEditToggle={() => setIsEditing(!isEditing)} />
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <EditableSection 
            title="About this space" 
            isEditing={isEditing} 
            onSave={() => handleSave('description')}
            editContent={
              <div className="space-y-4">
                <Controller name="description" control={control} render={({ field }) => <Textarea {...field} placeholder="Tell everyone about your space..." rows={6} />} />
                <Controller name="vibe" control={control} render={({ field }) => <Input {...field} placeholder="What's the vibe? (e.g., Collaborative, Focused)" />} />
              </div>
            }
          >
            <p>{profile.description}</p>
            <div className="mt-4">
                <h3 className="font-semibold">The Vibe</h3>
                <p>{profile.vibe}</p>
            </div>
          </EditableSection>
          
          <EditableSection 
            title="Amenities" 
            isEditing={isEditing} 
            onSave={() => handleSave('amenities')}
            editContent={<Controller name="amenities" control={control} render={({ field }) => <TagInput {...field} placeholder="Add an amenity" />} />}
          >
             <ul className="grid grid-cols-2 gap-2">
                {profile.amenities?.map(item => <li key={item}>{item}</li>)}
            </ul>
          </EditableSection>

          <EditableSection 
            title="House Rules" 
            isEditing={isEditing} 
            onSave={() => handleSave('houseRules')}
            editContent={<Controller name="houseRules" control={control} render={({ field }) => <Textarea {...field} placeholder="What are the rules?" rows={4} />} />}
          >
            <p>{profile.house_rules}</p>
          </EditableSection>
        </div>
        
        <div className="md:col-span-1">
          <StickySidebar />
        </div>
      </div>

      <Separator className="my-12" />

      <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/5">
        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-destructive/80 mt-1">
          Deleting a space is a permanent action. All tenants will be moved to the waitlist, and all associated data will be removed.
        </p>
        <Button variant="destructive" className="mt-4" onClick={() => setDeleteDialogOpen(true)} disabled={isDeleting}>
          Delete this space
        </Button>
      </div>

      <DeleteSpaceDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteSpace}
        spaceName={profile.name}
        isPending={isDeleting}
      />
    </div>
  );
};

export default SpaceProfilePage;
