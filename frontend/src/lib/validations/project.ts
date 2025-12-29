import { z } from 'zod';

export const projectSchema = z.object({
  code: z.string()
    .min(2, 'Project code must be at least 2 characters')
    .max(20, 'Project code must not exceed 20 characters')
    .regex(/^[A-Z0-9-_]+$/, 'Project code must contain only uppercase letters, numbers, hyphens, and underscores'),
  
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters'),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  
  location: z.string()
    .max(200, 'Location must not exceed 200 characters')
    .optional(),
  
  client: z.string()
    .max(100, 'Client name must not exceed 100 characters')
    .optional(),
  
  contractor: z.string()
    .max(100, 'Contractor name must not exceed 100 characters')
    .optional(),
  
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Please select a project status',
  }),
  
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  
  endDate: z.date({
    required_error: 'End date is required',
  }),
  
  totalBudget: z.number({
    required_error: 'Total budget is required',
    invalid_type_error: 'Total budget must be a number',
  })
    .positive('Total budget must be greater than 0')
    .max(999999999999, 'Total budget is too large'),
  
  currency: z.string()
    .min(3, 'Currency code must be 3 characters')
    .max(3, 'Currency code must be 3 characters')
    .default('USD'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Helper to generate project code
export const generateProjectCode = (prefix: string = 'PRJ') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

// Currency options
export const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
] as const;

// Status options
export const statusOptions = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;
