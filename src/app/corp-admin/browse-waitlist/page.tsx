"use client";

import React, { useEffect, useState } from 'react';
import { getRankedWaitlist, addTenantToSpace } from '@/lib/api/corp-admin';
import { WaitlistedUser, WaitlistedStartup } from '@/types/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, PlusCircle } from 'lucide-react';
import { UserRole } from '@/types/enums';
import { initiateExternalChat } from '@/lib/api/chat';
import { AddTenantDialog } from '@/components/corp-admin/AddTenantDialog';
import { useSpace } from '@/context/SpaceContext';

type WaitlistItem = WaitlistedUser | WaitlistedStartup;

const BrowseWaitlistPage = () => {
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('interest');
  const [typeFilter, setTypeFilter] = useState('all');
  const router = useRouter();
  const { selectedSpace } = useSpace();
  
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<WaitlistItem | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const apiTypeFilter = typeFilter === 'all' ? undefined : typeFilter;
      const data = await getRankedWaitlist(debouncedSearchTerm, apiTypeFilter, sortBy, selectedSpace?.id);
      setWaitlist(data);
    } catch (error) {
      toast.error("Failed to load waitlist.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, [debouncedSearchTerm, typeFilter, sortBy, selectedSpace]);

  const handleOpenAddDialog = (tenant: WaitlistItem) => {
    setSelectedTenant(tenant);
    setIsAddTenantDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setSelectedTenant(null);
    setIsAddTenantDialogOpen(false);
  };

  const handleConfirmAddTenant = async (spaceId: number) => {
    if (!selectedTenant) return;

    try {
      const tenantData = {
        userId: selectedTenant.type === 'freelancer' ? selectedTenant.id : undefined,
        startupId: selectedTenant.type === 'startup' ? selectedTenant.id : undefined,
      };
      await addTenantToSpace(spaceId, tenantData);

      const successMessage = selectedTenant.expressed_interest
        ? `${selectedTenant.name || selectedTenant.full_name} added to space successfully!`
        : `Invitation sent to ${selectedTenant.name || selectedTenant.full_name}.`;
      toast.success(successMessage);

      fetchWaitlist(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to add tenant.";
      toast.error(errorMessage);
    } finally {
      handleCloseAddDialog();
    }
  };

  const handleMessage = async (userId: number) => {
    try {
      toast.info("Initiating chat...");
      const conversation = await initiateExternalChat(userId);
      router.push(`/chat?conversationId=${conversation.id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to initiate chat.";
      toast.error(errorMessage);
      console.error("Failed to initiate chat", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Browse Tenants</h2>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="freelancer">Freelancers</SelectItem>
              <SelectItem value="startup">Startups</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interest">Interest</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p>Loading waitlist...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waitlist.map((item) => {
              const isAdmin = (member: any) => member.role === UserRole.STARTUP_ADMIN;
              const startupAdmin = 'direct_members' in item ? item.direct_members?.find(isAdmin) : null;
              const messageUserId = item.type === 'freelancer' ? item.id : startupAdmin?.id;
              const entityType = item.type === 'freelancer' ? 'users' : 'startups';

              return (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell>{item.name || item.full_name}</TableCell>
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell>
                    {item.expressed_interest && (
                      <Badge>Interested</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/${entityType}/${item.id}`} passHref>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Link>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAddDialog(item)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add to Space
                    </Button>
                    {messageUserId && (
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMessage(messageUserId)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {selectedTenant && (
        <AddTenantDialog
          isOpen={isAddTenantDialogOpen}
          onClose={handleCloseAddDialog}
          onConfirm={handleConfirmAddTenant}
          tenantName={selectedTenant.name || selectedTenant.full_name || 'this tenant'}
          hasExpressedInterest={selectedTenant.expressed_interest}
        />
      )}
    </div>
  );
};

export default BrowseWaitlistPage;
