'use client';

import { UserDetail } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Building, HardHat, Link as LinkIcon, Mail, MapPin, Settings, User as UserIcon, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

interface UserProfileDisplayProps {
  userDetail: UserDetail;
}

export default function UserProfileDisplay({ userDetail }: UserProfileDisplayProps) {
  const currentStoreUser = useAuthStore((state) => state.user);
  const canEditProfile = currentStoreUser?.id === userDetail.id;

  return (
    <Card className="shadow-xl">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 bg-slate-50 dark:bg-slate-800 p-6 rounded-t-lg">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-slate-700 shadow-lg">
          <AvatarImage src={userDetail.profile?.profile_picture_signed_url || undefined} alt={userDetail.full_name || ""} />
          <AvatarFallback className="text-4xl">
            {userDetail.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || (userDetail.email ? userDetail.email[0].toUpperCase() : '')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100">{userDetail.full_name}</CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-400">{userDetail.profile?.title || userDetail.role}</CardDescription>
          <div className="flex items-center space-x-2 mt-2">
            <Mail className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm text-slate-500 dark:text-slate-400">{userDetail.email}</span>
          </div>
           <Badge variant={userDetail.is_active ? "default" : "secondary"} className="mt-2">
            {userDetail.status} {userDetail.is_active ? "(Active)" : "(Inactive)"}
          </Badge>
        </div>
        {canEditProfile && (
          <Link href={`/dashboard/profile/edit`}> 
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" /> Edit My Profile
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {userDetail.profile?.bio && (
          <div>
            <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">About Me</h3>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{userDetail.profile.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userDetail.company && (
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardHeader><CardTitle className="flex items-center text-lg"><Building className="mr-2 h-5 w-5 text-blue-500"/>Company</CardTitle></CardHeader>
              <CardContent><p className="font-medium text-slate-700 dark:text-slate-200">{userDetail.company.name}</p></CardContent>
            </Card>
          )}
          {userDetail.startup && (
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardHeader><CardTitle className="flex items-center text-lg"><Users className="mr-2 h-5 w-5 text-green-500"/>Startup</CardTitle></CardHeader>
              <CardContent><p className="font-medium text-slate-700 dark:text-slate-200">{userDetail.startup.name}</p></CardContent>
            </Card>
          )}
        </div>
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userDetail.space && (
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardHeader><CardTitle className="flex items-center text-lg"><MapPin className="mr-2 h-5 w-5 text-purple-500"/>Current Space</CardTitle></CardHeader>
              <CardContent><p className="font-medium text-slate-700 dark:text-slate-200">{userDetail.space.name}</p></CardContent>
            </Card>
          )}
           {userDetail.current_workstation && (
            <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardHeader><CardTitle className="flex items-center text-lg"><HardHat className="mr-2 h-5 w-5 text-orange-500"/>Workstation</CardTitle></CardHeader>
              <CardContent>
                <p className="font-medium text-slate-700 dark:text-slate-200">{userDetail.current_workstation.workstation_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Assigned since: {formatDate(userDetail.current_workstation.assignment_start_date)}</p>
              </CardContent>
            </Card>
          )}
        </div>
        {userDetail.managed_space && (
           <Card className="bg-slate-50 dark:bg-slate-800/50">
              <CardHeader><CardTitle className="flex items-center text-lg"><Briefcase className="mr-2 h-5 w-5 text-indigo-500"/>Managed Space (Corp Admin)</CardTitle></CardHeader>
              <CardContent><p className="font-medium text-slate-700 dark:text-slate-200">{userDetail.managed_space.name}</p></CardContent>
            </Card>
        )}

        {userDetail.profile && (
          <div>
            <h3 className="text-xl font-semibold my-4 text-slate-700 dark:text-slate-200">Details</h3>
            <div className="space-y-3 text-slate-600 dark:text-slate-300">
              {userDetail.profile.skills_expertise && userDetail.profile.skills_expertise.length > 0 && (
                <div><strong>Skills:</strong> {userDetail.profile.skills_expertise.map(skill => <Badge key={skill} variant="secondary" className="mr-1 mb-1">{skill}</Badge>)}</div>
              )}
              {userDetail.profile.industry_focus && userDetail.profile.industry_focus.length > 0 && (
                <div><strong>Industries:</strong> {userDetail.profile.industry_focus.map(ind => <Badge key={ind} variant="default" className="mr-1 mb-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{ind}</Badge>)}</div>
              )}
              {userDetail.profile.tools_technologies && userDetail.profile.tools_technologies.length > 0 && (
                <div><strong>Tools & Tech:</strong> {userDetail.profile.tools_technologies.map(tool => <Badge key={tool} variant="outline" className="mr-1 mb-1">{tool}</Badge>)}</div>
              )}
              {userDetail.profile.project_interests_goals && (
                <div><strong>Interests/Goals:</strong> <p className="whitespace-pre-wrap">{userDetail.profile.project_interests_goals}</p></div>
              )}
               {userDetail.profile.collaboration_preferences && userDetail.profile.collaboration_preferences.length > 0 && (
                <div><strong>Collaboration:</strong> {userDetail.profile.collaboration_preferences.join(', ')}</div>
              )}
              {userDetail.profile.linkedin_profile_url && (
                <div className="flex items-center">
                  <LinkIcon className="mr-2 h-4 w-4 " />
                  <a href={userDetail.profile.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold my-4 text-slate-700 dark:text-slate-200">Account Information</h3>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p><strong>Role:</strong> <Badge variant="outline">{userDetail.role}</Badge></p>
            <p><strong>Member Since:</strong> {formatDate(userDetail.created_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 