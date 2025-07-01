"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
// import { DatePicker } from "@/components/ui/date-picker"; // Assuming you have a DatePicker component

// Assume fetchWithAuth: import { fetchWithAuth } from "@/lib/fetchWithAuth";

// Mock API calls
const fetchPromoCodes = async () => {
  console.log("Fetching promo codes");
  // return fetchWithAuth("/api/v1/admin/promo-codes");
  return [
    { id: "promo1", code: "PILOTPARTNER24", description: "Pixida Pilot Access", discountType: "bypass_paywall", isActive: true, validUntil: new Date(Date.now() + 30 * 86400000 * 6).toISOString(), uses: 5, maxUses: 10 }, // Valid for 6 months
    { id: "promo2", code: "WELCOME10", description: "10% off first month", discountType: "percent_off", discountValue: 10, isActive: true, validUntil: null, uses: 150, maxUses: 1000 },
    { id: "promo3", code: "EXPIREDCODE", description: "Old campaign", discountType: "fixed_amount", discountValue: 5, isActive: false, validUntil: new Date(Date.now() - 86400000).toISOString(), uses: 20, maxUses: 20 }, // Expired yesterday
  ];
};

const createPromoCode = async (codeData: any) => {
  console.log("Creating promo code:", codeData);
  // return fetchWithAuth("/api/v1/admin/promo-codes", { method: "POST", body: JSON.stringify(codeData) });
  return { success: true, data: { ...codeData, id: "newPromo_" + Math.random(), uses: 0 }};
};

const updatePromoCode = async (codeId: string, codeData: any) => {
  console.log(`Updating promo code ${codeId}: `, codeData);
  // return fetchWithAuth(`/api/v1/admin/promo-codes/${codeId}`, { method: "PUT", body: JSON.stringify(codeData) });
  return { success: true };
};

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: "bypass_paywall" | "percent_off" | "fixed_amount";
  discountValue?: number; // Only for percent_off or fixed_amount
  isActive: boolean;
  validUntil: string | null;
  uses?: number; // Optional, if tracked
  maxUses?: number; // Optional
}

const discountTypes: PromoCode["discountType"][] = ["bypass_paywall", "percent_off", "fixed_amount"];

export default function PromoCodeManagementPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState<Partial<PromoCode> | null>(null);
  const [formValues, setFormValues] = useState<Partial<Omit<PromoCode, 'id' | 'uses'>> & { validUntilDate?: Date | null }>({\
    code: "",
    description: "",
    discountType: "percent_off",
    discountValue: 0,
    isActive: true,
    validUntilDate: null,
    maxUses: undefined,
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    const codes = await fetchPromoCodes();
    setPromoCodes(codes);
  };

  const handleOpenForm = (promoCode?: PromoCode) => {
    if (promoCode) {
      setCurrentCode(promoCode);
      setFormValues({
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue || 0,
        isActive: promoCode.isActive,
        validUntilDate: promoCode.validUntil ? new Date(promoCode.validUntil) : null,
        maxUses: promoCode.maxUses,
      });
    } else {
      setCurrentCode(null);
      setFormValues({ code: "", description: "", discountType: "percent_off", discountValue: 0, isActive: true, validUntilDate: null, maxUses: undefined });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { validUntilDate, ...restValues } = formValues;
    const dataToSubmit: Partial<PromoCode> = {
        ...restValues,
        validUntil: validUntilDate ? validUntilDate.toISOString() : null,
        discountValue: formValues.discountType !== "bypass_paywall" ? Number(formValues.discountValue) : undefined,
    };

    if (currentCode?.id) {
      await updatePromoCode(currentCode.id, dataToSubmit);
    } else {
      await createPromoCode(dataToSubmit);
    }
    loadPromoCodes();
    setIsFormOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Promo Code Management</h1>
        <Button onClick={() => handleOpenForm()}>Create New Promo Code</Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{currentCode?.id ? "Edit Promo Code" : "Create New Promo Code"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Code (e.g., SUMMER20)</Label>
              <Input id="code" value={formValues.code} onChange={(e) => setFormValues({...formValues, code: e.target.value.toUpperCase()})} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={formValues.description} onChange={(e) => setFormValues({...formValues, description: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={formValues.discountType} onValueChange={(value) => setFormValues({...formValues, discountType: value as PromoCode["discountType"]}) } >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountTypes.map(type => <SelectItem key={type} value={type}>{type.replace("_", " ").toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {formValues.discountType !== "bypass_paywall" && (
                <div>
                  <Label htmlFor="discountValue">Value ({formValues.discountType === "percent_off" ? "%" : "$"})</Label>
                  <Input id="discountValue" type="number" value={formValues.discountValue} onChange={(e) => setFormValues({...formValues, discountValue: Number(e.target.value)})} min="0" />
                </div>
              )}
            </div>
            <div>
                <Label htmlFor="maxUses">Max Uses (optional)</Label>
                <Input id="maxUses" type="number" value={formValues.maxUses || ""} onChange={(e) => setFormValues({...formValues, maxUses: e.target.value ? Number(e.target.value) : undefined})} placeholder="Leave blank for unlimited" min="0" />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until (optional)</Label>
              {/* Replace with your actual DatePicker component */}
              {/* <DatePicker date={formValues.validUntilDate || undefined} onDateChange={(date) => setFormValues({...formValues, validUntilDate: date})} /> */}
              <Input type="date" value={formValues.validUntilDate ? formValues.validUntilDate.toISOString().split('T')[0] : ""} onChange={(e) => setFormValues({...formValues, validUntilDate: e.target.value ? new Date(e.target.value) : null})} />
              <p className="text-xs text-muted-foreground pt-1">Leave blank for no expiry date.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" checked={formValues.isActive} onCheckedChange={(checked) => setFormValues({...formValues, isActive: Boolean(checked)})} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{currentCode?.id ? "Save Changes" : "Create Code"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Uses / Max</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoCodes.map((pc) => (
            <TableRow key={pc.id} className={!pc.isActive || (pc.validUntil && new Date(pc.validUntil) < new Date()) ? "opacity-50" : ""}>
              <TableCell className="font-medium">{pc.code}</TableCell>
              <TableCell>{pc.description}</TableCell>
              <TableCell>{pc.discountType.replace("_", " ")}</TableCell>
              <TableCell>{pc.discountType !== "bypass_paywall" ? (pc.discountType === "percent_off" ? `${pc.discountValue}%` : `$${pc.discountValue?.toFixed(2)}`) : "N/A"}</TableCell>
              <TableCell>{pc.isActive ? "Yes" : "No"}</TableCell>
              <TableCell>{pc.validUntil ? new Date(pc.validUntil).toLocaleDateString() : "Never"}</TableCell>
              <TableCell>{pc.uses !== undefined ? `${pc.uses} / ${pc.maxUses || '∞'}` : 'N/A'}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleOpenForm(pc)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {promoCodes.length === 0 && <p className="text-center py-4">No promo codes found.</p>}
    </div>
  );
} 