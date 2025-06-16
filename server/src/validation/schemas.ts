import { z } from 'zod';

// Schéma de validation pour l'authentification
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['COMEDIAN', 'ORGANIZER', 'ADMIN'])
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Schéma de validation pour les événements
export const locationSchema = z.object({
  venue: z.string().min(1, 'Venue is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required')
});

export const requirementsSchema = z.object({
  minExperience: z.number().min(0, 'Minimum experience must be 0 or greater'),
  maxPerformers: z.number().min(1, 'Maximum performers must be at least 1'),
  duration: z.number().min(1, 'Duration must be at least 1 minute')
});

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().transform(str => new Date(str)),
  location: locationSchema,
  requirements: requirementsSchema
});

export const updateEventSchema = createEventSchema.partial();

// Schéma de validation pour les candidatures
export const performanceDetailsSchema = z.object({
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  videoLink: z.string().url('Invalid video URL').optional()
});

export const createApplicationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  performanceDetails: performanceDetailsSchema
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])
}); 