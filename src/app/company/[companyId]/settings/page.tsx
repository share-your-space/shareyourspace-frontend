"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CompanySettings } from "@/types/company";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: "",
    contactEmail: "",
    website: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!companyId) return;
      try {
        setLoading(true);
        const response = await api.get(`/company/${companyId}/settings`);
        const data = response.data;
        setSettings({
          companyName: data.name,
          contactEmail: data.contact_email,
          website: data.website || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error("Failed to fetch company settings", error);
        toast.error("Failed to load company settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [companyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: settings.companyName,
        contact_email: settings.contactEmail,
        website: settings.website,
        address: settings.address,
      };
      await api.put(`/company/${companyId}/settings`, payload);
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings", error);
      toast.error("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
