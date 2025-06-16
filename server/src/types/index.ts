import { Types } from 'mongoose';

export interface Location {
  venue: string;
  address: string;
  city: string;
  country: string;
}

export interface EventRequirements {
  minExperience: number;
  maxPerformers: number;
  duration: number;
}

export interface Event {
  title: string;
  description: string;
  date: Date;
  location: Location;
  organizer: Types.ObjectId;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  requirements: EventRequirements;
  applications: Types.ObjectId[];
}

export interface PerformanceDetails {
  duration: number;
  description: string;
  videoLink?: string;
}

export interface Application {
  event: Types.ObjectId;
  comedian: Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  performanceDetails: PerformanceDetails;
} 