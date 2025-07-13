'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Building, Rocket, User, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from "sonner";
import { UserRole, TeamSize, StartupStage } from '@/types/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '@/types/company';
import { Startup } from '@/types/startup';


const OnboardingChoiceCard: React.FC<{title: string, description: string, onClick: () => void, icon: React.ReactNode}> = ({ title, description, onClick, icon }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 border rounded-lg hover:bg-accent hover:border-primary transition-all flex items-center"
  >
    <div className="mr-4 text-primary">{icon}</div>
    <div className="flex-grow">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <ArrowRight className="h-5 w-5 text-muted-foreground" />
  </button>
);

export default function StartOnboardingPage() {
  const router = useRouter();
  const [modalType, setModalType] = useState<'startup' | 'corporation' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, user } = useAuthStore();

  const handleFreelancerChoice = () => {
    setIsLoading(true);
    const toastId = toast.loading("Setting your role to Freelancer...");
    
    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          role: UserRole.FREELANCER,
          status: 'ACTIVE',
        });
      }
      toast.success("Profile updated! Welcome, Freelancer.", { id: toastId });
      router.push('/dashboard');
      setIsLoading(false);
    }, 500);
  };

  const handleOrgSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading(`Registering your ${modalType}...`);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    setTimeout(() => {
      if (!user) {
        toast.error("User not found. Please log in again.", { id: toastId });
        setIsLoading(false);
        return;
      }

      if (modalType === 'startup') {
        const newStartup: Startup = {
          id: Math.floor(Math.random() * 1000) + 1,
          name: data.name as string,
          description: data.description as string,
          website: data.website as string,
          industry_focus: data.industry_focus as string,
          team_size: data.team_size as TeamSize,
          mission: data.mission as string,
          stage: data.stage as StartupStage,
          pitch_deck_url: data.pitch_deck_url as string,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: user.id,
        };
        setUser({
          ...user,
          role: UserRole.STARTUP_ADMIN,
          status: 'ACTIVE',
          startup: newStartup,
          company: null,
        });
        toast.success(`Startup "${newStartup.name}" registered!`, { id: toastId });
      } else if (modalType === 'corporation') {
        const newCompany: Company = {
          id: Math.floor(Math.random() * 1000) + 1,
          name: data.name as string,
          description: data.description as string,
          website: data.website as string,
          industry_focus: data.industry_focus as string,
          team_size: data.team_size as TeamSize,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: user.id,
        };
        setUser({
          ...user,
          role: UserRole.CORP_ADMIN,
          status: 'ACTIVE',
          company: newCompany,
          startup: null,
        });
        toast.success(`Corporation "${newCompany.name}" registered!`, { id: toastId });
      }
      
      setIsLoading(false);
      setModalType(null);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to ShareYourSpace!</CardTitle>
          <CardDescription>Let&apos;s get you set up. What brings you here today?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OnboardingChoiceCard
            title="Register Your Corporation"
            description="Offer your physical office spaces to startups and freelancers."
            onClick={() => setModalType('corporation')}
            icon={<Building className="h-8 w-8" />}
          />
          <OnboardingChoiceCard
            title="Register Your Startup"
            description="Find a flexible workspace within a corporate environment."
            onClick={() => setModalType('startup')}
            icon={<Rocket className="h-8 w-8" />}
          />
           <OnboardingChoiceCard
            title="I'm a Freelancer"
            description="Discover inspiring workspaces and connect with innovators."
            onClick={handleFreelancerChoice}
            icon={<User className="h-8 w-8" />}
          />
          <OnboardingChoiceCard
            title="Join an Existing Organization"
            description="Already have a team on ShareYourSpace? Find them here."
            onClick={() => router.push('/onboarding/join-organization')}
            icon={<Users className="h-8 w-8" />}
          />
        </CardContent>
      </Card>

      <Dialog open={modalType !== null} onOpenChange={(value) => !value && setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Your {modalType === 'startup' ? 'Startup' : 'Corporation'}</DialogTitle>
            <DialogDescription>
              Provide some details about your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrgSubmit}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                        id="name" 
                        name="name" 
                        placeholder="Your Organization's Name" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="What does your organization do?" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="url" placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="industry_focus">Industry</Label>
                    <Input id="industry_focus" name="industry_focus" placeholder="e.g., FinTech, HealthTech" />
                </div>
                <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Select name="team_size" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(TeamSize).map((size) => (
                                <SelectItem key={size} value={size}>{size.replace('_', ' ')}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 {modalType === 'startup' && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="mission">Mission</Label>
                            <Textarea id="mission" name="mission" placeholder="What is your startup's mission?" />
                        </div>
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select name="stage" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select startup stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(StartupStage).map((stage) => (
                                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="pitch_deck_url">Pitch Deck URL</Label>
                            <Input id="pitch_deck_url" name="pitch_deck_url" type="url" placeholder="https://link-to-your-deck.com" />
                        </div>
                    </>
                )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}