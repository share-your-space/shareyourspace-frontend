'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Workstation, WorkstationStatus, WorkstationType } from '@/types/workstation';
import { toast } from 'sonner';

const mockWorkstations: Workstation[] = [
	{
		id: 'w-1',
		name: 'Desk 101',
		type: WorkstationType.HOT_DESK,
		status: WorkstationStatus.AVAILABLE,
		space_id: 'space-1',
		space: { id: 'space-1', name: 'Downtown Hub' },
		current_booking: null,
	},
	{
		id: 'w-2',
		name: 'Desk 102',
		type: WorkstationType.HOT_DESK,
		status: WorkstationStatus.OCCUPIED,
		space_id: 'space-1',
		space: { id: 'space-1', name: 'Downtown Hub' },
		current_booking: { id: 'booking-1', user: { id: 'user-101', full_name: 'Alice Johnson', email: 'alice@example.com' } },
	},
	{
		id: 'w-3',
		name: 'Private Office A',
		type: WorkstationType.PRIVATE_OFFICE,
		status: WorkstationStatus.MAINTENANCE,
		space_id: 'space-1',
		space: { id: 'space-1', name: 'Downtown Hub' },
		current_booking: null,
	},
	{
		id: 'w-4',
		name: 'Dedicated Desk 12',
		type: WorkstationType.PRIVATE_DESK,
		status: WorkstationStatus.OCCUPIED,
		space_id: 'space-2',
		space: { id: 'space-2', name: 'Tech Park Oasis' },
		current_booking: { id: 'booking-2', user: { id: 'user-102', full_name: 'Bob Williams', email: 'bob@startup.io' } },
	},
	{
		id: 'w-5',
		name: 'Desk 201',
		type: WorkstationType.HOT_DESK,
		status: WorkstationStatus.AVAILABLE,
		space_id: 'space-2',
		space: { id: 'space-2', name: 'Tech Park Oasis' },
		current_booking: null,
	},
];

const getStatusVariant = (status: WorkstationStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
	switch (status) {
		case WorkstationStatus.AVAILABLE:
			return 'default';
		case WorkstationStatus.OCCUPIED:
			return 'secondary';
		case WorkstationStatus.MAINTENANCE:
			return 'destructive';
		default:
			return 'outline';
	}
};

const handleAddWorkstation = () => {
	toast.info('This would open a modal to add a new workstation.');
};

const handleEditWorkstation = (id: string) => {
	toast.info(`Editing workstation ${id}. This would open an edit form.`);
};

export default function WorkstationsPage() {
	const workstations = mockWorkstations;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle className="flex items-center">
							<Users2 className="mr-3 h-6 w-6" />
							Workstation Management
						</CardTitle>
						<CardDescription>Oversee all workstations across all your spaces.</CardDescription>
					</div>
					<Button className="mt-4 sm:mt-0" onClick={handleAddWorkstation}>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Workstation
					</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Space</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Current Occupant</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{workstations.map((workstation) => (
								<TableRow key={workstation.id}>
									<TableCell className="font-mono text-xs">
										WS-{workstation.id.toString().padStart(4, '0')}
									</TableCell>
									<TableCell className="font-medium">{workstation.name}</TableCell>
									<TableCell>{workstation.space?.name || 'N/A'}</TableCell>
									<TableCell className="capitalize">
										{workstation.type.replace(/_/g, ' ').toLowerCase()}
									</TableCell>
									<TableCell>
										<Badge variant={getStatusVariant(workstation.status)} className="capitalize">
											{workstation.status.toLowerCase()}
										</Badge>
									</TableCell>
									<TableCell>{workstation.current_booking?.user.full_name || '—'}</TableCell>
									<TableCell className="text-right">
										<Button variant="outline" size="sm" onClick={() => handleEditWorkstation(workstation.id)}>
											Edit
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
