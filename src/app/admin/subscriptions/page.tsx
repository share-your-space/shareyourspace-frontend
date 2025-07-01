"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Assume fetchWithAuth: import { fetchWithAuth } from "@/lib/fetchWithAuth";

// Mock API calls
const fetchSubscriptionPlans = async () => {
  console.log("Fetching subscription plans");
  // return fetchWithAuth("/api/v1/admin/subscription-plans"); // Or a public plans endpoint
  return [
    { id: "plan_free_f", name: "Freelancer Basic", roleType: "FREELANCER", priceMonthly: 0, priceAnnual: 0, features: "Basic Profile, Limited Matches" },
    { id: "plan_prem_f", name: "Freelancer Pro", roleType: "FREELANCER", priceMonthly: 19, priceAnnual: 190, features: "Full Profile, Unlimited Matches, Chat" },
    { id: "plan_startup", name: "Startup Team", roleType: "STARTUP", priceMonthly: 49, priceAnnual: 490, features: "Team Profiles, Agent Access, Chat" },
    { id: "plan_corp", name: "Corporate Space", roleType: "CORPORATE", priceMonthly: 0, priceAnnual: 0, features: "Custom, Enterprise Features (handled manually)" }, // Corporate might be custom/manual
  ];
};

const createSubscriptionPlan = async (planData: any) => {
  console.log("Creating plan:", planData);
  // return fetchWithAuth("/api/v1/admin/subscription-plans", { method: "POST", body: JSON.stringify(planData) });
  return { success: true, data: { ...planData, id: "newPlan_" + Math.random() }};
};

const updateSubscriptionPlan = async (planId: string, planData: any) => {
  console.log(`Updating plan ${planId}: `, planData);
  // return fetchWithAuth(`/api/v1/admin/subscription-plans/${planId}`, { method: "PUT", body: JSON.stringify(planData) });
  return { success: true };
};

interface SubscriptionPlan {
  id: string;
  name: string;
  roleType: string;
  priceMonthly: number;
  priceAnnual: number;
  features: string; // Simple text for now, could be string[]
}

const roleTypes = ["FREELANCER", "STARTUP", "CORPORATE", "GENERAL"]; // General for non-role specific plans

export default function SubscriptionManagementPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    roleType: "GENERAL",
    priceMonthly: "0",
    priceAnnual: "0",
    features: ""
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const fetchedPlans = await fetchSubscriptionPlans();
    setPlans(fetchedPlans);
  };

  const handleOpenForm = (plan?: SubscriptionPlan) => {
    if (plan) {
      setCurrentPlan(plan);
      setFormValues({
        name: plan.name,
        roleType: plan.roleType,
        priceMonthly: String(plan.priceMonthly),
        priceAnnual: String(plan.priceAnnual),
        features: plan.features,
      });
    } else {
      setCurrentPlan(null);
      setFormValues({ name: "", roleType: "GENERAL", priceMonthly: "0", priceAnnual: "0", features: "" });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formValues,
      priceMonthly: parseFloat(formValues.priceMonthly),
      priceAnnual: parseFloat(formValues.priceAnnual),
      // Stripe Price IDs would be managed here or in Stripe directly
    };
    if (currentPlan?.id) {
      await updateSubscriptionPlan(currentPlan.id, dataToSubmit);
    } else {
      await createSubscriptionPlan(dataToSubmit);
    }
    loadPlans();
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Subscription Plan Management</h1>
        <Button onClick={() => handleOpenForm()}>Create New Plan</Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{currentPlan?.id ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" value={formValues.name} onChange={(e) => setFormValues({...formValues, name: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="roleType">Target Role</Label>
              <Select value={formValues.roleType} onValueChange={(value) => setFormValues({...formValues, roleType: value}) }>
                <SelectTrigger>
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  {roleTypes.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceMonthly">Monthly Price ($)</Label>
                <Input id="priceMonthly" type="number" value={formValues.priceMonthly} onChange={(e) => setFormValues({...formValues, priceMonthly: e.target.value})} required min="0" step="0.01"/>
              </div>
              <div>
                <Label htmlFor="priceAnnual">Annual Price ($)</Label>
                <Input id="priceAnnual" type="number" value={formValues.priceAnnual} onChange={(e) => setFormValues({...formValues, priceAnnual: e.target.value})} required min="0" step="0.01" />
              </div>
            </div>
            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input id="features" value={formValues.features} onChange={(e) => setFormValues({...formValues, features: e.target.value})} placeholder="e.g., Feature A, Feature B" required />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{currentPlan?.id ? "Save Changes" : "Create Plan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <p className="text-sm text-muted-foreground mb-4">Manage the subscription plans available on the platform. Note: Actual payment processing and Stripe Price ID linkage would be handled via Stripe dashboard and backend integration.</p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Target Role</TableHead>
            <TableHead>Monthly ($)</TableHead>
            <TableHead>Annual ($)</TableHead>
            <TableHead className="w-[30%]">Features</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>{plan.name}</TableCell>
              <TableCell>{plan.roleType}</TableCell>
              <TableCell>{plan.priceMonthly.toFixed(2)}</TableCell>
              <TableCell>{plan.priceAnnual.toFixed(2)}</TableCell>
              <TableCell className="text-xs">{plan.features}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleOpenForm(plan)}>Edit</Button>
                {/* Delete might be risky if plan is in use, consider soft delete or deactivation */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {plans.length === 0 && <p className="text-center py-4">No subscription plans found.</p>}
    </div>
  );
}
