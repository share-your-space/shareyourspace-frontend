"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSpace } from '@/context/SpaceContext';
import { 
  listSpaceWorkstations, 
  listAllUsersInSpace, 
  deleteWorkstation,
  unassignWorkstation
} from '@/lib/api/corp-admin';
import { WorkstationDetail } from '@/types/space';
import { User } from '@/types/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AssignWorkstationDialog } from '@/components/corp-admin/AssignWorkstationDialog';
import { ChangeWorkstationStatusDialog } from '@/components/corp-admin/ChangeWorkstationStatusDialog';
import { CreateWorkstationDialog } from '@/components/corp-admin/CreateWorkstationDialog';
import { EditWorkstationDialog } from '@/components/corp-admin/EditWorkstationDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserPlus, Pencil, Trash2, UserMinus, ToggleRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';


const WorkstationsPage = () => {
  const { selectedSpace } = useSpace();
  const [workstations, setWorkstations] = useState<WorkstationDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWs, setSelectedWs] = useState<WorkstationDetail | null>(null);
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isUnassignDialogOpen, setUnassignDialogOpen] = useState(false);

  // State for search and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('natural'); // Default to natural sort
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchData = useCallback(async () => {
    if (selectedSpace) {
      setLoading(true);
      try {
        const [wsResponse, usersResponse] = await Promise.all([
          listSpaceWorkstations(selectedSpace.id, debouncedSearchTerm, sortBy),
          listAllUsersInSpace(selectedSpace.id)
        ]);
        setWorkstations(wsResponse.workstations);
        const assignedUserIds = wsResponse.workstations
            .map(ws => ws.occupant?.id)
            .filter(Boolean);
        setUsers(usersResponse.users.filter(user => !assignedUserIds.includes(user.id)));
      } catch (error) {
        console.error("Failed to fetch page data:", error);
        toast.error("Failed to load workstation data.");
      } finally {
        setLoading(false);
      }
    }
  }, [selectedSpace, debouncedSearchTerm, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAssignDialog = (workstation: WorkstationDetail) => {
    setSelectedWs(workstation);
    setAssignDialogOpen(true);
  };

  const handleOpenStatusDialog = (workstation: WorkstationDetail) => {
    setSelectedWs(workstation);
    setStatusDialogOpen(true);
  };

  const handleOpenEditDialog = (workstation: WorkstationDetail) => {
    setSelectedWs(workstation);
    setEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (workstation: WorkstationDetail) => {
    setSelectedWs(workstation);
    setDeleteDialogOpen(true);
  };

  const handleOpenUnassignDialog = (workstation: WorkstationDetail) => {
    setSelectedWs(workstation);
    setUnassignDialogOpen(true);
  };

  const handleDeleteWorkstation = async () => {
    if (!selectedSpace || !selectedWs) return;
    try {
      await deleteWorkstation(selectedSpace.id, selectedWs.id);
      toast.success("Workstation deleted successfully.");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to delete workstation:", error);
      toast.error("Failed to delete workstation.");
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleUnassignWorkstation = async () => {
    if (!selectedSpace || !selectedWs) return;
    try {
      await unassignWorkstation(selectedSpace.id, selectedWs.id);
      toast.success("User unassigned successfully.");
      fetchData();
    } catch (error) {
      console.error("Failed to unassign user:", error);
      toast.error("Failed to unassign user.");
    } finally {
      setUnassignDialogOpen(false);
    }
  };

  if (!selectedSpace) return <p>Please select a space to manage its workstations.</p>;

  return (
    <TooltipProvider>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Workstations</h2>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Default</SelectItem>
                <SelectItem value="alphabetic">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Create Workstation
            </Button>
          </div>
        </div>
        
        {loading ? (
          <p>Loading workstations...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Occupant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workstations.map((ws) => (
                <TableRow key={ws.id}>
                  <TableCell>{ws.name}</TableCell>
                  <TableCell>
                    <Badge variant={ws.occupant ? 'secondary' : 'default'}>{ws.status}</Badge>
                  </TableCell>
                  <TableCell>{ws.occupant?.full_name || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(ws)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Name</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!!ws.occupant} onClick={() => handleOpenAssignDialog(ws)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Assign User</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!ws.occupant} onClick={() => handleOpenUnassignDialog(ws)}>
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Unassign User</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenStatusDialog(ws)}>
                          <ToggleRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Change Status</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(ws)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Workstation</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Dialogs */}
        <AssignWorkstationDialog isOpen={isAssignDialogOpen} onOpenChange={setAssignDialogOpen} workstation={selectedWs} users={users} spaceId={selectedSpace.id} onAssignmentSuccess={() => { setAssignDialogOpen(false); fetchData(); }} />
        <ChangeWorkstationStatusDialog isOpen={isStatusDialogOpen} onOpenChange={setStatusDialogOpen} workstation={selectedWs} spaceId={selectedSpace.id} onStatusChangeSuccess={() => { setStatusDialogOpen(false); fetchData(); }} />
        <CreateWorkstationDialog isOpen={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} spaceId={selectedSpace.id} onCreateSuccess={() => { setCreateDialogOpen(false); fetchData(); }} />
        <EditWorkstationDialog isOpen={isEditDialogOpen} onOpenChange={setEditDialogOpen} workstation={selectedWs} spaceId={selectedSpace.id} onEditSuccess={() => { setEditDialogOpen(false); fetchData(); }} />
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the workstation.
                {selectedWs?.occupant && ' The current occupant will be unassigned.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteWorkstation}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isUnassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unassign User?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to unassign {selectedWs?.occupant?.full_name} from {selectedWs?.name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnassignWorkstation}>Unassign</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default WorkstationsPage;
