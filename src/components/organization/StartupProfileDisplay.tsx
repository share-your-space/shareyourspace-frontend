import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define the expected structure of the Startup data
interface StartupData {
  id: number;
  name: string;
  logo_url?: string | null;
  industry_focus?: string | null;
  description?: string | null;
  mission?: string | null;
  website?: string | null;
  created_at: string; // Assuming ISO string format from backend
  updated_at?: string | null;
}

interface StartupProfileDisplayProps {
  startup: StartupData;
}

const StartupProfileDisplay: React.FC<StartupProfileDisplayProps> = ({ startup }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={startup.logo_url || undefined} alt={`${startup.name} logo`} />
            <AvatarFallback>{startup.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{startup.name}</CardTitle>
            {startup.industry_focus && (
              <CardDescription>Industry: {startup.industry_focus}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {startup.description && (
          <div>
            <h3 className="font-semibold mb-1">Description</h3>
            <p className="text-sm text-muted-foreground">{startup.description}</p>
          </div>
        )}
        {startup.mission && (
          <div>
            <h3 className="font-semibold mb-1">Mission</h3>
            <p className="text-sm text-muted-foreground">{startup.mission}</p>
          </div>
        )}
        {startup.website && (
          <div>
            <h3 className="font-semibold mb-1">Website</h3>
            <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
              {startup.website}
            </a>
          </div>
        )}
        {/* Add other fields as needed */}
      </CardContent>
    </Card>
  );
};

export default StartupProfileDisplay; 