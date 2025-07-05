"use client";

import React, { useEffect, useState } from 'react';
import { getRankedWaitlist, approveInterest } from '@/lib/api/corp-admin';
import { WaitlistedUser } from '@/types/space';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSpace } from '@/context/SpaceContext';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { UserRole } from '@/types/enums';

const BrowseWaitlistPage = () => {
  const [waitlist, setWaitlist] = useState<WaitlistedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('interest');
  const [typeFilter, setTypeFilter] = useState('all');
  const { selectedSpace } = useSpace();
  const router = useRouter();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const apiTypeFilter = typeFilter === 'all' ? undefined : typeFilter;
      const data = await getRankedWaitlist(debouncedSearchTerm, apiTypeFilter, sortBy);
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
  }, [debouncedSearchTerm, typeFilter, sortBy]);

  const handleApprove = async (interestId: number) => {
    if (!selectedSpace) {
      toast.error("Please select a space first.");
      return;
    }
    try {
      await approveInterest(selectedSpace.id, interestId);
      toast.success("Interest approved successfully!");
      fetchWaitlist(); // Refetch the list to remove the approved item
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to approve interest.";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleMessage = (userId: number) => {
    router.push(`/chat?userId=${userId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Browse Potential Tenants</h2>
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
              const startupAdmin = item.type === 'startup' ? item.direct_members?.find(member => member.role === UserRole.STARTUP_ADMIN) : null;
              const messageUserId = item.type === 'freelancer' ? item.id : startupAdmin?.id;

              return (
                <TableRow key={`${item.entity_type}-${item.id}`}>
                  <TableCell>{item.name || item.full_name}</TableCell>
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell>
                    {item.expressed_interest && (
                      <Badge>Interested</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/${item.entity_type}s/${item.id}`} passHref>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </Link>
                    {item.expressed_interest && item.interest_id && (
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(item.interest_id!)}
                        disabled={!selectedSpace}
                      >
                        Approve
                      </Button>
                    )}
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
    </div>
  );
};

export default BrowseWaitlistPage;
