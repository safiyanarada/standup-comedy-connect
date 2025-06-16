import { Location } from './auth';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: Location;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  budget: {
    min: number;
    max: number;
  };
  organizerId: string;
  organizerName: string;
  createdAt: string;
  updatedAt?: string;
  applications: Application[];
  status: 'draft' | 'published' | 'cancelled' | 'full' | 'completed';
  requirements?: string;
  fee?: number;
  maxPerformers?: number;
  eventType?: 'open-mic' | 'show' | 'private' | 'festival';
}

export interface Application {
  id: string;
  eventId: string;
  humoristId: string;
  humoristName?: string;
  stageName?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'viewed';
  appliedAt: string;
  updatedAt?: string;
  message?: string;
} 