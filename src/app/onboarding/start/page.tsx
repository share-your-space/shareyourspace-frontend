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
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from "sonner";
import { UserRole, TeamSize, StartupStage } from '@/types/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
  const [startupName, setStartupName] = useState('');
  const { loginWithNewToken, token } = useAuthStore();

  const handleFreelancerChoice = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Setting your role to Freelancer...");
    try {
        const response = await api.post('/onboarding/role',
            { role: UserRole.FREELANCER },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        loginWithNewToken(response.data.access_token);
        toast.success("Profile created! Welcome.", { id: toastId });
        router.push('/dashboard');
    } catch (error: any) {
        toast.error(error.response?.data?.detail || "Failed to setup profile.", { id: toastId });
    } finally {
        setIsLoading(false);
    }
  };

  const handleOrgSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading(`Registering your ${modalType}...`);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    let payload;
    if (modalType === 'startup') {
        payload = {
            role: UserRole.STARTUP_ADMIN,
            startup_data: {
                ...data,
                name: startupName,
            },
        };
    } else {
        payload = {
            role: UserRole.CORP_ADMIN,
            company_data: data,
    };
    }

    try {
        const response = await api.post('/onboarding/role', payload, {
             headers: { Authorization: `Bearer ${token}` }
        });
        loginWithNewToken(response.data.access_token);
        toast.success(`${modalType === 'startup' ? 'Startup' : 'Corporation'} registered!`, { id: toastId });
        router.push('/dashboard');
    } catch (error: any) {
        const detail = error.response?.data?.detail;
        if (Array.isArray(detail)) {
            // Handle Pydantic validation errors
            const errorMessage = detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ');
            toast.error(`Registration failed: ${errorMessage}`, { id: toastId });
        } else {
            // Handle other errors
            toast.error(detail || `Failed to register ${modalType}.`, { id: toastId });
        }
    } finally {
        setIsLoading(false);
        setModalType(null);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to ShareYourSpace!</CardTitle>
            <CardDescription>Let's get you set up. What brings you here today?</CardDescription>
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
      </div>

      <Dialog open={modalType !== null} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Your {modalType === 'startup' ? 'Startup' : 'Corporation'}</DialogTitle>
            <DialogDescription>
              Provide some details about your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOrgSubmit}>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                        id="name" 
                        name="name" 
                        placeholder="Your Organization's Name" 
                        required 
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="What does your organization do?" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="industry_focus">Industry</Label>
                    <Input id="industry_focus" name="industry_focus" placeholder="e.g., FinTech, HealthTech" />
                </div>
                <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Select name="team_size">
                        <SelectTrigger>
                            <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(TeamSize).map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
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
                            <Select name="stage">
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
                            <Input id="pitch_deck_url" name="pitch_deck_url" placeholder="https://link-to-your-deck.com" />
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
    </AuthenticatedLayout>
  );
}