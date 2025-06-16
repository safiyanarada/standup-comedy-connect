import { Types } from 'mongoose';

export interface ILocation {
  city: string;
  postalCode: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface Performance {
  eventId: Types.ObjectId;
  date: Date;
  duration: number;
  videoLink?: string;
  feedback?: string;
}

export interface UserProfile {
  bio?: string;
  experience?: string;
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
  performances?: Performance[];
}

export interface IOrganisateurProfile {
  companyName?: string;
  location?: ILocation;
  description?: string;
  website?: string;
  venueTypes?: string[];
  averageBudget?: {
    min?: number;
    max?: number;
  };
  eventFrequency?: 'weekly' | 'monthly' | 'occasional';
}

export interface User {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'COMEDIAN' | 'ORGANIZER' | 'ADMIN';
  profile?: UserProfile;
  organizerProfile?: IOrganisateurProfile;
  stats?: any;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  avatarUrl?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
} 