import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { UserProfile } from '@/types/userProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  onCoverPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProfilePictureUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isEditing,
  onCoverPhotoUpload,
  onProfilePictureUpload,
}) => {
  const getInitials = (name: string | null | undefined) => {
    return name ? name.split(' ').map(n => n[0]).join('') : 'U';
  };

  return (
    <div className="relative h-48 md:h-64 bg-gray-200 rounded-lg">
      {profile.cover_photo_signed_url && (
        <Image
          src={profile.cover_photo_signed_url}
          alt="Cover photo"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      )}
      {isEditing && (
        <label className="absolute top-4 right-4 bg-white/80 p-2 rounded-full cursor-pointer hover:bg-white">
          <Upload className="h-5 w-5 text-gray-700" />
          <input type="file" className="hidden" onChange={onCoverPhotoUpload} />
        </label>
      )}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src={profile.profile_picture_signed_url || ''} alt={profile.full_name || 'User'} />
            <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
          </Avatar>
          {isEditing && (
             <label className="absolute bottom-0 right-0 bg-white/80 p-2 rounded-full cursor-pointer hover:bg-white">
               <Upload className="h-4 w-4 text-gray-700" />
               <input type="file" className="hidden" onChange={onProfilePictureUpload} />
             </label>
          )}
        </div>
      </div>
    </div>
  );
}; 