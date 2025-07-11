'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BillingInfo, Plan, Invoice } from '@/types/billing';
import { format } from 'date-fns';

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
    <Card className={`flex flex-col ${plan.is_current ? 'border-primary' : ''}`}>
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
            {plan.is_current ? (
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
                <p className="text-sm text-muted-foreground">Paid on {format(new Date(invoice.date), 'MMMM d, yyyy')}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <p className="font-mono text-sm">${invoice.amount.toFixed(2)}</p>
            <Button variant="ghost" size="icon" asChild>
                <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                </a>
            </Button>
        </div>
    </div>
);

export default function CompanyBillingPage({ params }: { params: { companyId: string } }) {
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBillingInfo = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/corp-admin/billing`);
                if (!response.ok) {
                    throw new Error('Failed to fetch billing information');
                }
                const data: BillingInfo = await response.json();
                setBillingInfo(data);
            } catch (error) {
                console.error(error);
                toast.error('Could not load billing details.');
            } finally {
                setLoading(false);
            }
        };

        fetchBillingInfo();
    }, [params.companyId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!billingInfo) {
        return <div className="text-center">Could not load billing information.</div>;
    }

    const { current_plan, payment_method, invoices, plan_renewal_date, available_plans } = billingInfo;

    return (
        <div className="space-y-8">
            {/* Current Plan & Payment Method Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>You are currently on the {current_plan.name} plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Your plan renews on {format(new Date(plan_renewal_date), 'MMMM d, yyyy')}.
                        </p>
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
                        {payment_method ? (
                            <div className="flex items-center gap-3">
                                <Image src="/visa-logo.svg" alt={payment_method.card_type} className="h-8" width={50} height={32} />
                                <div>
                                    <p className="font-semibold">{payment_method.card_type} ending in {payment_method.last4}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Expires {payment_method.expiry_month}/{payment_method.expiry_year}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No payment method on file.</p>
                        )}
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
                    {available_plans.map(plan => <PlanCard key={plan.name} plan={plan} />)}
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
                        {invoices.length > 0 ? (
                            invoices.map(invoice => <InvoiceRow key={invoice.id} invoice={invoice} />)
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No invoices found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
