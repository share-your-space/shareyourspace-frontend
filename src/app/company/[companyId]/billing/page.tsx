"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Download, Loader2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiClient } from "@/lib/api/base";
import { BillingInfo, Plan } from "@/types/billing";
import { Company } from "@/types/company";

interface PageProps {
  params: {
    companyId: string;
  };
}

const PlanCard = ({ plan }: { plan: Plan }) => (
  <Card className={cn("flex flex-col", { "border-primary": plan.is_current })}>
    <CardHeader>
      <CardTitle>{plan.name}</CardTitle>
      <p className="text-2xl font-bold">{plan.price}</p>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-2 text-sm text-muted-foreground">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className="w-full" disabled={plan.is_current}>
        {plan.is_current ? 'Current Plan' : 'Choose Plan'}
      </Button>
    </CardFooter>
  </Card>
);

const BillingPage: React.FC<PageProps> = ({ params }) => {
  const { companyId } = params;
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [billingData, companyData] = await Promise.all([
          apiClient.get<BillingInfo>(`/company/${companyId}/billing`),
          apiClient.get<Company>(`/company/${companyId}`),
        ]);
        setBillingInfo(billingData.data);
        setCompany(companyData.data);
      } catch (error) {
        console.error("Failed to fetch billing or company data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [companyId]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!billingInfo || !company) {
    return (
      <div className="text-center text-muted-foreground">
        Could not load billing information. Please try again later.
      </div>
    );
  }

  const { current_plan, usage, invoices, payment_method, available_plans, plan_renewal_date } = billingInfo;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the <strong>{current_plan.name}</strong> plan.
            {plan_renewal_date && (
              <span> Your plan renews on {format(new Date(plan_renewal_date), 'MMMM d, yyyy')}.</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-2">Plan Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {current_plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Current Usage</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(usage).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline">Upgrade Plan</Button>
        </CardFooter>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {payment_method ? (
              <div className="flex items-center space-x-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{payment_method.card_type} ending in {payment_method.last4}</p>
                  <p className="text-sm text-muted-foreground">
                    Expires {payment_method.expiry_month}/{payment_method.expiry_year}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No payment method on file.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline">
              {payment_method ? 'Update Card' : 'Add Card'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(usage).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span>{value}</span>
                  </div>
                  <Progress value={(value / 100) * 100} /> {/* Placeholder logic for progress */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that&apos;s right for your company.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          {available_plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
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
};

export default BillingPage;
