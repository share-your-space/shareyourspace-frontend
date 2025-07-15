import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrowsableSpace } from '@/types/space';
import Image from 'next/image';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface SpaceCardProps {
  space: BrowsableSpace;
  onExpressInterest: (spaceId: string) => void;
  canExpressInterest: boolean;
  isCurrentUserSpace: boolean;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({
  space,
  onExpressInterest,
  canExpressInterest,
  isCurrentUserSpace,
}) => {
  const isInterestButtonDisabled =
    isCurrentUserSpace ||
    space.interest_status === 'interested';

  const getInterestButtonText = () => {
    if (isCurrentUserSpace) return 'Your Space';
    switch (space.interest_status) {
      case 'interested':
        return 'Interest Expressed';
      default:
        return 'Express Interest';
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden relative">
      {isCurrentUserSpace && (
        <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground">
          Your Current Space
        </Badge>
      )}
      <CardHeader className="p-0 relative">
        <div className="aspect-square w-full relative">
          <Image
            src={space.image_url || PLACEHOLDER_IMAGE_URL}
            alt={`Image of ${space.name}`}
            fill
            className="object-cover"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white hover:text-white rounded-full"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <h3 className="font-bold text-lg truncate">{space.name}</h3>
        <p className="text-muted-foreground text-sm truncate">
          {space.headline}
        </p>
        <p className="text-sm mt-1">{space.address}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {space.total_workstations} workstations
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex justify-between items-center w-full">
          <Link href={`/spaces/${space.id}/profile`} passHref>
            <Button variant="outline">View Profile</Button>
          </Link>
          {canExpressInterest && (
            <Button
              onClick={() => onExpressInterest(space.id.toString())}
              disabled={isInterestButtonDisabled}
            >
              {getInterestButtonText()}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};