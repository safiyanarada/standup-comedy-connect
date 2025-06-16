import { Types } from 'mongoose';

export interface Performance {
  eventId: Types.ObjectId;
  date: Date;
  duration: number;
  videoLink?: string;
  feedback?: string;
}

export interface UserProfile {
  bio: string;
  experience: string;
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
  performances?: Performance[];
}

export interface User {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'COMEDIAN' | 'ORGANIZER' | 'ADMIN';
  profile: UserProfile;
  stats?: any;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  avatarUrl?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
} 