export interface Plan {
  name: string;
  price: string;
  features: string[];
  is_current: boolean;
}

export interface PaymentMethod {
  card_type: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
}

export interface Invoice {
  id: string;
  date: string; // ISO date string
  amount: number;
  pdf_url: string;
}

export interface BillingInfo {
  current_plan: Plan;
  payment_method: PaymentMethod | null;
  invoices: Invoice[];
  plan_renewal_date: string; // ISO date string
  available_plans: Plan[];
}
