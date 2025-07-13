"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Download, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BillingInfo, Plan } from "@/types/billing";

const mockBillingInfo: BillingInfo = {
  current_plan: {
    name: 'Growth',
    price: '$99/month',
    features: [
      'Up to 500 members',
      'Unlimited connections',
      'Advanced analytics',
      'Priority support',
    ],
    is_current: true,
  },
  payment_method: {
    card_type: 'Visa',
    last4: '4242',
    expiry_month: 12,
    expiry_year: 2025,
  },
  invoices: [
    { id: 'inv_1', date: new Date('2023-10-01').toISOString(), amount: 99.0, pdf_url: '#' },
    { id: 'inv_2', date: new Date('2023-09-01').toISOString(), amount: 99.0, pdf_url: '#' },
    { id: 'inv_3', date: new Date('2023-08-01').toISOString(), amount: 99.0, pdf_url: '#' },
  ],
  usage: {
    members: 128,
    max_members: 500,
    connections: 432,
    max_connections: -1, // unlimited
  },
  available_plans: [
    {
      name: 'Starter',
      price: '$29/month',
      features: ['Up to 50 members', 'Basic analytics', 'Email support'],
      is_current: false,
    },
    {
      name: 'Growth',
      price: '$99/month',
      features: ['Up to 500 members', 'Unlimited connections', 'Advanced analytics', 'Priority support'],
      is_current: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited members', 'Dedicated account manager', 'Custom integrations'],
      is_current: false,
    },
  ],
  plan_renewal_date: new Date('2024-08-01').toISOString(),
};


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

const BillingPage = () => {
  const billingInfo = mockBillingInfo;

  const { current_plan, usage, invoices, payment_method, available_plans, plan_renewal_date } = billingInfo;

  const usagePercentage = usage.max_members > 0 ? (usage.members / usage.max_members) * 100 : 0;

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
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-2">Plan Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {current_plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Members</span>
                    <span className="text-sm text-muted-foreground">{usage.members} / {usage.max_members}</span>
                  </div>
                  <Progress value={usagePercentage} />
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Connections</span>
                    <span className="text-sm text-muted-foreground">{usage.connections} / {usage.max_connections === -1 ? 'Unlimited' : usage.max_connections}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and download your past invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={invoice.pdf_url} download>
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
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Your primary payment method.</CardDescription>
            </CardHeader>
            <CardContent>
              {payment_method ? (
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
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
              <Button variant="outline">Update Payment Method</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose a plan that fits your company&apos;s needs.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {available_plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;
