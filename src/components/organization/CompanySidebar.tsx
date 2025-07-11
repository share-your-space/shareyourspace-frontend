import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Users, Briefcase, User as UserIcon } from 'lucide-react';
import { Company, Startup } from '@/types/organization';
import Link from 'next/link';
import { UserRole } from '@/types/enums';
import { Badge } from '@/components/ui/badge';
import { HeaderData } from './CompanyHeader';

interface CompanySidebarProps {
  company: HeaderData;
}

export const CompanySidebar: React.FC<CompanySidebarProps> = ({ company }) => {
  const startupAdmin = 'direct_members' in company && company.direct_members?.find(member => member.role === UserRole.STARTUP_ADMIN);

  return (
    <Card>
      <CardHeader>
        <CardTitle>About {company.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                </Button>
            </a>
        )}
        <div className="text-sm">
            <div className="flex justify-between">
                <span className="text-gray-500 flex items-center"><Users className="h-4 w-4 mr-2"/> Team Size</span>
                <strong>{company.team_size || 'N/A'}</strong>
            </div>
             <div className="flex flex-col mt-2">
                <span className="text-gray-500 flex items-center mb-1"><Briefcase className="h-4 w-4 mr-2"/> Industry</span>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(company.industry_focus) ? (
                    company.industry_focus.map(industry => <Badge key={industry} variant="secondary">{industry}</Badge>)
                  ) : (
                    <Badge variant="secondary">{company.industry_focus || 'N/A'}</Badge>
                  )}
                </div>
            </div>
            {startupAdmin && (
              <div className="flex justify-between mt-2">
                <span className="text-gray-500 flex items-center"><UserIcon className="h-4 w-4 mr-2"/> Admin</span>
                <Link href={`/users/${startupAdmin.id}`} passHref>
                  <strong className="text-blue-500 hover:underline cursor-pointer">{startupAdmin.full_name}</strong>
                </Link>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};