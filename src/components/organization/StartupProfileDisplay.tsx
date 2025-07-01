import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Zap, Building, Users, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Startup } from '@/types/organization';
import Link from 'next/link';

interface StartupProfileDisplayProps {
  startup: Startup;
}

const StartupProfileDisplay = ({ startup }: StartupProfileDisplayProps) => {
  return (
    <Card className="shadow-xl">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 bg-slate-50 dark:bg-slate-800 p-6 rounded-t-lg">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-slate-700 shadow-lg rounded-md">
                <AvatarImage src={startup.logo_url || undefined} alt={startup.name || "Startup Logo"} className="rounded-md" />
                <AvatarFallback className="text-4xl rounded-md">
                    {startup.name ? startup.name.charAt(0).toUpperCase() : <Zap />}
                </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100">{startup.name}</CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-400">{startup.industry_focus || 'Industry not specified'}</CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                    {startup.website && (
                        <>
                            <LinkIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                                Website
                            </a>
                        </>
                    )}
                    {startup.pitch_deck_url && (
                        <>
                           <span className="mx-1">·</span>
                           <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <a href={startup.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                                Pitch Deck
                            </a>
                        </>
                    )}
                </div>
                 <Badge variant={startup.status === 'ACTIVE' ? "default" : "secondary"} className="mt-2">
                    {startup.status}
                </Badge>
            </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
            {startup.mission && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200 flex items-center"><Zap className="mr-2 h-5 w-5 text-yellow-500" />Our Mission</h3>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{startup.mission}</p>
                </div>
            )}
            {startup.description && (
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-blue-500" />About Us</h3>
                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{startup.description}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-50 dark:bg-slate-800/50">
                    <CardHeader><CardTitle className="flex items-center text-lg"><Users className="mr-2 h-5 w-5 text-green-500"/>Team Size</CardTitle></CardHeader>
                    <CardContent><p className="font-medium text-slate-700 dark:text-slate-200">{startup.team_size || 'N/A'}</p></CardContent>
                </Card>
                {startup.admin && (
                     <Card className="bg-slate-50 dark:bg-slate-800/50">
                        <CardHeader><CardTitle className="flex items-center text-lg"><Building className="mr-2 h-5 w-5 text-indigo-500"/>Administrator</CardTitle></CardHeader>
                        <CardContent>
                            <Link href={`/users/${startup.admin.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                                {startup.admin.full_name}
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
            
            {startup.social_media_links && Object.keys(startup.social_media_links).length > 0 && (
                 <div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">Follow Us</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                        {Object.entries(startup.social_media_links).map(([platform, url]) => (
                             <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline dark:text-blue-400">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
};

export default StartupProfileDisplay; 