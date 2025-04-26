import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define the expected structure of the Company data
interface CompanyData {
  id: number;
  name: string;
  logo_url?: string | null;
  industry_focus?: string | null;
  description?: string | null;
  website?: string | null;
  created_at: string; // Assuming ISO string format from backend
  updated_at?: string | null;
}

interface CompanyProfileDisplayProps {
  company: CompanyData;
}

const CompanyProfileDisplay: React.FC<CompanyProfileDisplayProps> = ({ company }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={company.logo_url || undefined} alt={`${company.name} logo`} />
            <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{company.name}</CardTitle>
            {company.industry_focus && (
              <CardDescription>Industry: {company.industry_focus}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {company.description && (
          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-sm text-muted-foreground">{company.description}</p>
          </div>
        )}
        {company.website && (
          <div>
            <h3 className="font-semibold mb-1">Website</h3>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
              {company.website}
            </a>
          </div>
        )}
        {/* Add other fields as needed */}
      </CardContent>
    </Card>
  );
};

export default CompanyProfileDisplay; 