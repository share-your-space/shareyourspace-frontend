import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Edit } from 'lucide-react';
import { SpaceProfile } from '@/types/space';

interface SpaceHeaderProps {
  profile: SpaceProfile;
  isEditing: boolean;
  onEditToggle: () => void;
  showEditButton?: boolean;
}

export const SpaceHeader: React.FC<SpaceHeaderProps> = ({
  profile,
  isEditing,
  onEditToggle,
  showEditButton = true,
}) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">{profile.name}</h1>
        <div className="flex items-center text-gray-500 mt-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{profile.address}</span>
        </div>
      </div>
      {showEditButton && (
      <Button variant="outline" onClick={onEditToggle}>
        <Edit className="h-4 w-4 mr-2" />
        {isEditing ? 'Cancel' : 'Edit Profile'}
      </Button>
      )}
    </div>
  );
}; 