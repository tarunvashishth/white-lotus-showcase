import { z } from 'zod';

const text = (label, max) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

const int = (label) =>
  z.coerce.number({ error: `${label} must be a number` }).int(`${label} must be a whole number`);

export const propertySchema = z.object({
  name: text('Name', 150),
  location: text('Location', 150),
  price: int('Price').positive('Price must be a positive number'),
  size_sqft: int('Size').positive('Size must be a positive number'),
  bedrooms: int('Bedrooms').min(0, 'Bedrooms cannot be negative').max(30, 'Bedrooms must be 30 or fewer'),
  bathrooms: int('Bathrooms').min(0, 'Bathrooms cannot be negative').max(30).default(1),
  description: text('Short description', 300),
  long_description: z.string().trim().max(5000, 'Details must be at most 5000 characters').default(''),
  images: z.array(z.string().trim().url('Each image must be a valid URL')).max(10, 'At most 10 images').default([]),
});

export const inquirySchema = z.object({
  name: text('Name', 120),
  email: z.string({ error: 'Email is required' }).trim().min(1, 'Email is required').max(200).pipe(z.email('Enter a valid email address')),
  phone: z.string({ error: 'Phone is required' }).trim().min(1, 'Phone is required')
    .regex(/^[+()\-\s\d]{7,20}$/, 'Enter a valid phone number'),
  message: text('Message', 2000),
});

export const loginSchema = z.object({ password: z.string({ error: 'Password is required' }).min(1, 'Password is required') });

/** ZodError -> { field: firstMessage } for display next to form inputs. */
export function fieldErrors(err) {
  const out = {};
  for (const issue of err.issues) out[issue.path.join('.') || '_'] ??= issue.message;
  return out;
}
