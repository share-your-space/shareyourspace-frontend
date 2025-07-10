import * as z from 'zod';

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  industry_focus: z.array(z.string()).optional(),
  description: z.string().optional(),
  looking_for: z.array(z.string()).optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
