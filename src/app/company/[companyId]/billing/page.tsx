'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Download } from 'lucide-react';

// Types
interface Plan {
    name: string;
    price: string;
    features: string[];
    isCurrent: boolean;
}

interface Invoice {
    id: string;
    date: string;
    amount: string;
}

// Mock Data
const plans: Plan[] = [
    {
        name: 'Community',
        price: 'Free',
        features: ['Up to 10 members', 'Basic analytics', 'Community support'],
        isCurrent: false,
    },
    {
        name: 'Pro',
        price: '$49/month',
        features: ['Up to 50 members', 'Advanced analytics', 'Priority support', 'Custom branding'],
        isCurrent: true,
    },
    {
        name: 'Enterprise',
        price: 'Contact Us',
        features: ['Unlimited members', 'Dedicated account manager', 'Premium support & SLA', 'Advanced security & compliance'],
        isCurrent: false,
    },
];

const invoices: Invoice[] = [
    { id: 'INV-2024-003', date: 'July 1, 2024', amount: '$49.00' },
    { id: 'INV-2024-002', date: 'June 1, 2024', amount: '$49.00' },
    { id: 'INV-2024-001', date: 'May 1, 2024', amount: '$49.00' },
];

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
    <Card className={`flex flex-col ${plan.isCurrent ? 'border-primary' : ''}`}>
        <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription className="text-2xl font-bold">{plan.price}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
            <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-muted-foreground">{feature}</span>
                    </li>
                ))}
            </ul>
        </CardContent>
        <CardFooter>
            {plan.isCurrent ? (
                <Button variant="outline" className="w-full" disabled>Current Plan</Button>
            ) : (
                <Button className="w-full">{plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}</Button>
            )}
        </CardFooter>
    </Card>
);

const InvoiceRow: React.FC<{ invoice: Invoice }> = ({ invoice }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
        <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
                <p className="font-semibold">{invoice.id}</p>
                <p className="text-sm text-muted-foreground">Paid on {invoice.date}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <p className="font-mono text-sm">{invoice.amount}</p>
            <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
            </Button>
        </div>
    </div>
);

export default function CompanyBillingPage() {
    return (
        <div className="space-y-8">
            {/* Current Plan & Payment Method Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the Pro plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Your plan renews on August 1, 2024.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline">Cancel Subscription</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Your primary payment method.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Image src="/visa-logo.svg" alt="Visa" className="h-8" width={50} height={32} />
                            <div>
                                <p className="font-semibold">Visa ending in 1234</p>
                                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary">Update Payment Method</Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Upgrade Plan Section */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Upgrade Your Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => <PlanCard key={plan.name} plan={plan} />)}
                </div>
            </div>

            {/* Billing History Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>Download your past invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {invoices.map(invoice => <InvoiceRow key={invoice.id} invoice={invoice} />)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
