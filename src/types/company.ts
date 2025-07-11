export interface CompanySettings {
  companyName: string;
  contactEmail: string;
  website?: string;
  address?: string;
  // Add other settings fields as needed
}

export interface Company {
    id: number;
    name: string;
}
