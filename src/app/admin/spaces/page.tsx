"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming you have Select
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { adminGetAllSpaces, adminCreateSpace } from "@/lib/api/spaces"; // Import the actual API functions
import { Space, SpaceCreate } from "@/types/space"; // Import the correct types

// Placeholder for API interactions - replace with actual calls
const fetchSpaces = async () => {
  console.log("Fetching spaces");
  // return fetchWithAuth("/api/v1/admin/spaces");
  return [
    { id: "space1", name: "Pixida Munich Hub", locationDescription: "Munich City Center", corporateAdminId: "2", corporateAdminName: "Corporate Manager", totalWorkstations: 50, createdAt: new Date().toISOString() },
    { id: "space2", name: "Tech Incubator Berlin", locationDescription: "Berlin Tech Park", corporateAdminId: "corpAdminXYZ", corporateAdminName: "Incubator Admin", totalWorkstations: 100, createdAt: new Date().toISOString() },
  ];
};

const createSpace = async (spaceData: any) => {
  console.log("Creating space:", spaceData);
  // return fetchWithAuth("/api/v1/admin/spaces", { method: "POST", body: JSON.stringify(spaceData) });
  return { success: true, data: { ...spaceData, id: "newSpace"+Math.random(), createdAt: new Date().toISOString() } };
};

const updateSpace = async (spaceId: string, spaceData: any) => {
  console.log(`Updating space ${spaceId}:`, spaceData);
  // return fetchWithAuth(`/api/v1/admin/spaces/${spaceId}`, { method: "PUT", body: JSON.stringify(spaceData) });
  return { success: true };
};

const deleteSpace = async (spaceId: string) => {
  console.log(`Deleting space ${spaceId}`);
  // return fetchWithAuth(`/api/v1/admin/spaces/${spaceId}`, { method: "DELETE" });
  return { success: true };
};

const assignSpaceAdmin = async (spaceId: string, adminId: string) => {
  console.log(`Assigning admin ${adminId} to space ${spaceId}`);
  // return fetchWithAuth(`/api/v1/admin/spaces/${spaceId}/assign-admin`, { method: "PUT", body: JSON.stringify({ corporate_admin_id: adminId }) });
  return { success: true };
};

// Placeholder for corporate admin users - fetch this from your API
const fetchCorporateAdmins = async () => {
    console.log("Fetching corporate admins for dropdown");
    return [
        {id: "2", fullName: "Corporate Manager (corp@example.com)"},
        {id: "corpAdminXYZ", fullName: "Incubator Admin (incub@example.com)"},
        {id: "anotherAdmin", fullName: "Another Corp Admin (another@example.com)"},
    ];
};

interface Space {
  id: string;
  name: string;
  locationDescription: string;
  corporateAdminId?: string;
  corporateAdminName?: string;
  totalWorkstations: number;
  createdAt: string;
}

interface CorpAdminUser {
    id: string;
    fullName: string;
}

export default function SpaceManagementPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [corporateAdmins, setCorporateAdmins] = useState<CorpAdminUser[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<Partial<Space> | null>(null);
  const [companyIdForNewSpace, setCompanyIdForNewSpace] = useState<number | null>(null); // State to hold companyId
  const [formValues, setFormValues] = useState({ name: "", locationDescription: "", totalWorkstations: "0", corporateAdminId: "" });

  useEffect(() => {
    loadSpaces();
    loadCorporateAdmins();
  }, []);

  const loadSpaces = async () => {
    try {
        const fetchedSpaces = await adminGetAllSpaces();
        setSpaces(fetchedSpaces);
    } catch (error) {
        console.error("Failed to load spaces:", error);
        // Handle error display
    }
  };

  const loadCorporateAdmins = async () => {
    const admins = await fetchCorporateAdmins();
    setCorporateAdmins(admins);
  };

  const handleOpenForm = (space?: Space, companyId?: number) => {
    if (space) {
      setCurrentSpace(space);
      setFormValues({ 
        name: space.name, 
        locationDescription: space.location_description, 
        totalWorkstations: String(space.total_workstations),
        corporateAdminId: space.corporate_admin_id?.toString() || ""
      });
      setCompanyIdForNewSpace(space.company_id); // If editing, we still need the company context
    } else if (companyId) {
      setCurrentSpace(null);
      setFormValues({ name: "", locationDescription: "", totalWorkstations: "0", corporateAdminId: "" });
      setCompanyIdForNewSpace(companyId); // Set companyId for creation
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyIdForNewSpace && !currentSpace) {
        console.error("No company context for creating space.");
        return;
    }

    const dataToSubmit: SpaceCreate = {
        name: formValues.name,
        location_description: formValues.locationDescription,
        total_workstations: parseInt(formValues.totalWorkstations, 10),
        corporate_admin_id: formValues.corporateAdminId ? parseInt(formValues.corporateAdminId, 10) : null,
        company_id: companyIdForNewSpace!, // Asserting it's not null here
    };

    if (currentSpace?.id) {
      // await updateSpace(currentSpace.id, dataToSubmit); // updateSpace needs to be implemented with real API
    } else {
      await adminCreateSpace(dataToSubmit);
    }
    loadSpaces();
    setIsFormOpen(false);
  };

  const handleDelete = async (spaceId: string) => {
    if (confirm("Are you sure you want to delete this space? This action cannot be undone.")) {
        await deleteSpace(spaceId);
        loadSpaces();
    }
  };
  
  const handleAssignAdmin = async (spaceId: string, adminId: string) => {
    await assignSpaceAdmin(spaceId, adminId);
    loadSpaces(); // Refresh to show new admin name if applicable
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Space Management</h1>
        {/* This button needs a companyId to work. For now, it's disabled.
            In a real app, you'd likely select a company first. */}
        <Button onClick={() => handleOpenForm(undefined, 1)} disabled>Create New Space</Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentSpace?.id ? "Edit Space" : "Create New Space"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Space Name</Label>
              <Input id="name" value={formValues.name} onChange={(e) => setFormValues({...formValues, name: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="locationDescription">Location Description</Label>
              <Input id="locationDescription" value={formValues.locationDescription} onChange={(e) => setFormValues({...formValues, locationDescription: e.target.value})} required />
            </div>
            <div>
              <Label htmlFor="totalWorkstations">Total Workstations</Label>
              <Input id="totalWorkstations" type="number" value={formValues.totalWorkstations} onChange={(e) => setFormValues({...formValues, totalWorkstations: e.target.value})} required min="0" />
            </div>
            <div>
              <Label htmlFor="corporateAdminId">Assign Corporate Admin</Label>
              <Select value={formValues.corporateAdminId} onValueChange={(value) => setFormValues({...formValues, corporateAdminId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Admin (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {corporateAdmins.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>{admin.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{currentSpace?.id ? "Save Changes" : "Create Space"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Corp. Admin</TableHead>
            <TableHead>Workstations</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spaces.map((space) => (
            <TableRow key={space.id}>
              <TableCell>{space.name}</TableCell>
              <TableCell>{space.locationDescription}</TableCell>
              <TableCell>{space.corporateAdminName || "N/A"}</TableCell>
              <TableCell>{space.totalWorkstations}</TableCell>
              <TableCell>{new Date(space.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">Actions <ChevronDown className="ml-1 h-3 w-3"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleOpenForm(space)}>Edit Details</DropdownMenuItem>
                    <DropdownMenu> {/* Nested for Assign Admin */}
                        <DropdownMenuTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}>Assign New Admin</DropdownMenuItem></DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {corporateAdmins.map(admin => (
                                <DropdownMenuItem key={admin.id} onSelect={() => handleAssignAdmin(space.id, admin.id)} disabled={admin.id === space.corporateAdminId}>
                                    {admin.fullName}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenuItem onSelect={() => handleDelete(space.id)} className="text-red-600">Delete Space</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {spaces.length === 0 && <p className="text-center py-4">No spaces found.</p>}
    </div>
  );
} 