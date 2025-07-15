import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SpaceImage } from '@/types/space';
import { Upload, X } from 'lucide-react';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

interface PhotoGalleryProps {
  images: SpaceImage[];
  isEditing: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: (imageId: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images,
  isEditing,
  onImageUpload,
  onImageDelete,
}) => {
  const mainImage = images?.[0];
  const otherImages = images?.slice(1, 5) || [];

  const displayImage = mainImage?.image_url || PLACEHOLDER_IMAGE_URL;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Main Image */}
        <div className="md:col-span-1 h-[400px] relative">
          <Image
            src={displayImage}
            alt="Main space"
            layout="fill"
            objectFit="cover"
            className="rounded-l-xl"
          />
          {isEditing && mainImage && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onImageDelete(mainImage.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Other Images Grid */}
        <div className="grid grid-cols-2 gap-2 h-[400px]">
          {otherImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative h-[196px] ${
                index > 1 ? 'rounded-br-xl' : ''
              }`}
            >
              <Image
                src={image.image_url}
                alt={`Space image ${index + 2}`}
                layout="fill"
                objectFit="cover"
                className={`${index === 1 ? 'rounded-tr-xl' : ''} ${
                  index === 3 ? 'rounded-br-xl' : ''
                }`}
              />
              {isEditing && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => onImageDelete(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {isEditing &&
            Array.from({ length: 4 - otherImages.length }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="bg-gray-200 h-[196px] w-full flex items-center justify-center rounded-sm"
              ></div>
            ))}
        </div>
      </div>
      {isEditing && (
        <label className="absolute bottom-4 right-4 bg-white py-2 px-4 rounded-lg shadow-md cursor-pointer flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span>Upload Image</span>
          <input
            type="file"
            className="hidden"
            onChange={onImageUpload}
            accept="image/*"
          />
        </label>
      )}
    </div>
  );
};