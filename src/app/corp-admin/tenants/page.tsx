"use client";

import React, { useEffect, useState } from 'react';
import { useSpace } from '@/context/SpaceContext';
import { listSpaceTenants } from '@/lib/api/corp-admin';
import { TenantInfo } from '@/types/space';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Users, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';

const TenantsPage = () => {
  const { selectedSpace } = useSpace();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (selectedSpace) {
      setLoading(true);
      listSpaceTenants(selectedSpace.id, debouncedSearchTerm, sortBy)
        .then(response => {
          setTenants(response.tenants);
        })
        .catch(error => {
          console.error("Failed to fetch tenants:", error);
          toast.error("Failed to load tenants.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedSpace, debouncedSearchTerm, sortBy]);

  if (!selectedSpace) {
    return <p>Please select a space to view its tenants.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tenants in {selectedSpace.name}</h2>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p>Loading tenants...</p>
      ) : (
        <>
          {tenants.length === 0 && <p>No tenants found for the current filter.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant, index) => (
              <Card key={index}>
                <CardHeader>
                  {tenant.type === 'startup' && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-6 w-6" />
                      <CardTitle>{tenant.details.name}</CardTitle>
                    </div>
                  )}
                  {tenant.type === 'freelancer' && (
                    <div className="flex items-center space-x-2">
                      <User className="h-6 w-6" />
                      <CardTitle>{tenant.details.full_name}</CardTitle>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {tenant.type === 'startup' && (
                    <p>A startup with {tenant.member_count} member(s) in this space.</p>
                  )}
                  {tenant.type === 'freelancer' && (
                    <p>A freelancer working in this space.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TenantsPage;
