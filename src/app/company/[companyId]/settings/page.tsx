"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { CompanySettings } from "@/types/company";
import { Loader2, Trash2 } from "lucide-react";

const mockSettings: CompanySettings = {
  companyName: "Innovate Corp",
  contactEmail: "contact@innovatecorp.com",
  website: "https://innovatecorp.com",
  address: "123 Innovation Drive, Tech City, 12345",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(mockSettings);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSaving(false);
    toast.success("Settings updated successfully!");
  };

  const handleDeleteCompany = () => {
    toast.warning("This is a destructive action. A confirmation modal would appear here.", {
      description: "Company deletion functionality is disabled in this demo.",
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>Manage your company&apos;s information and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleInputChange}
                  placeholder="Your Company LLC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={handleInputChange}
                  placeholder="contact@yourcompany.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={settings.website || ""}
                onChange={handleInputChange}
                placeholder="https://yourcompany.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={settings.address || ""}
                onChange={handleInputChange}
                placeholder="123 Main St, Anytown, USA"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Delete this company</p>
              <p className="text-sm text-muted-foreground">
                All data associated with this company will be permanently deleted.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteCompany}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Company
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
