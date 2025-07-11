import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, Building, Users, ExternalLink } from 'lucide-react';
import { Company, Startup } from '@/types/organization';
import { TeamSize } from '@/types/enums';
import { User } from '@/types/auth';

// Create a more generic type for the header
export interface HeaderData {
  name: string;
  logo_url?: string | null;
  website?: string | null;
  team_size?: TeamSize | null;
  industry_focus?: string[] | null;
  social_media_links?: { [key: string]: string } | null;
  direct_members?: User[] | null;
}

export const CompanyHeader = ({ company }: { company: HeaderData }) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-6">
      <Avatar className="w-24 h-24 border-2">
        <AvatarImage src={company.logo_url || undefined} alt={company.name} />
        <AvatarFallback className="text-3xl">{getInitials(company.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-muted-foreground">
          {company.industry_focus && (
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{company.industry_focus.join(', ')}</span>
            </div>
          )}
          {company.team_size && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{company.team_size}</span>
            </div>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Website</span>
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {company.social_media_links &&
            Object.entries(company.social_media_links).map(([platform, link]) => (
              <a
                key={platform}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <Badge variant="outline">
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Badge>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
};