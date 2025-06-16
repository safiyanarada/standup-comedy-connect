import { Coordinates } from '@/lib/geolocation';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'humoriste' | 'organisateur';
  profile: HumoristeProfile | OrganisateurProfile;
  stats: UserStats;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface HumoristeProfile {
  stageName?: string;
  city: string;
  coordinates?: Coordinates;
  bio?: string;
  mobilityZone: number;
  experienceLevel: 'debutant' | 'intermediaire' | 'expert';
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
  };
  genres?: string[];
  availability?: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
  };
}

export interface OrganisateurProfile {
  companyName?: string;
  city: string;
  coordinates?: Coordinates;
  description?: string;
  website?: string;
  phone?: string;
  venueAddress?: string;
  venuePostalCode?: string;
  venueTypes: string[];
  averageBudget?: {
    min: number;
    max: number;
  };
  eventFrequency?: 'weekly' | 'monthly' | 'occasional';
}

export interface UserStats {
  totalEvents: number;
  totalRevenue: number;
  averageRating: number;
  viralScore: number;
  profileViews: number;
  lastActivity: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'humoriste' | 'organisateur';
  city: string;
  coordinates?: Coordinates;
  stageName?: string;
  companyName?: string;
}
