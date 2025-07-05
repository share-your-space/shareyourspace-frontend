'use client';

import { UserDetail } from '@/types/auth';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings, Link as LinkIcon, Briefcase, Building, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSidebar } from './ProfileSidebar';
import { Separator } from '../ui/separator';

interface UserProfileDisplayProps {
  userDetail: UserDetail;
}

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h3 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">{title}</h3>
    <div className="text-slate-600 dark:text-slate-300">{children}</div>
  </div>
);

const TagList = ({ items }: { items?: string[] | null }) => (
  <div className="flex flex-wrap gap-2">
    {items?.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}
  </div>
);

export default function UserProfileDisplay({ userDetail }: UserProfileDisplayProps) {
  const currentStoreUser = useAuthStore((state) => state.user);
  const canEditProfile = currentStoreUser?.id === userDetail.id;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ProfileHeader 
        profile={userDetail.profile!}
        isEditing={false}
        onProfilePictureUpload={() => {}}
        onCoverPhotoUpload={() => {}}
      />
      
      <div className="pt-12">
        <div className="flex justify-between items-center">
          <div className="text-center flex-grow">
            <h1 className="text-3xl font-bold">{userDetail.full_name}</h1>
            <p className="text-md text-gray-500">{userDetail.profile?.title}</p>
          </div>
          {canEditProfile && (
             <Link href={`/dashboard/profile/edit`}> 
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {userDetail.profile?.bio && (
            <DetailSection title="About Me">
              <p className="whitespace-pre-wrap prose">{userDetail.profile.bio}</p>
            </DetailSection>
          )}

          {userDetail.company && (
             <DetailSection title="Affiliation">
                <div className="flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-blue-500" /> 
                    <span>Works at <strong>{userDetail.company.name}</strong></span>
                </div>
            </DetailSection>
          )}

          {userDetail.startup && (
             <DetailSection title="Affiliation">
                <div className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-green-500" /> 
                    <span>Founder at <strong>{userDetail.startup.name}</strong></span>
                </div>
            </DetailSection>
          )}
          
          <DetailSection title="Skills & Expertise">
            <TagList items={userDetail.profile?.skills_expertise} />
          </DetailSection>

           <DetailSection title="Industry Focus">
            <TagList items={userDetail.profile?.industry_focus} />
          </DetailSection>
          
          {userDetail.profile?.linkedin_profile_url && (
            <DetailSection title="Links">
              <a href={userDetail.profile.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                <LinkIcon className="h-4 w-4" />
                LinkedIn Profile
              </a>
            </DetailSection>
          )}

        </div>

        <div className="md:col-span-1 space-y-4">
          <ProfileSidebar />
        </div>
      </div>
    </div>
  );
} 