import React from 'react';
import Image from 'next/image';
import { Company } from '@/types/organization';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building } from 'lucide-react';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

interface CompanyHeaderProps {
  company: Company;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  return (
    <div className="flex items-center space-x-6">
      <Avatar className="h-24 w-24 rounded-md border">
        <AvatarImage
          src={company.logo_url || PLACEHOLDER_IMAGE_URL}
          alt={`${company.name} logo`}
          className="rounded-md"
        />
        <AvatarFallback className="rounded-md">
          <Building className="h-12 w-12 text-gray-400" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="text-lg text-gray-500">{company.industry_focus}</p>
      </div>
    </div>
  );
}; 