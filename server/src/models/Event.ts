import mongoose, { Schema, Document } from 'mongoose';
import { Event, Location, EventRequirements } from '../types';

export interface EventDocument extends Event, Document {}

const locationSchema = new Schema<Location>({
  venue: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true }
});

const requirementsSchema = new Schema<EventRequirements>({
  minExperience: { type: Number, required: true },
  maxPerformers: { type: Number, required: true },
  duration: { type: Number, required: true }
});

const eventSchema = new Schema<EventDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: locationSchema,
    required: true
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
    default: 'DRAFT'
  },
  requirements: {
    type: requirementsSchema,
    required: true
  },
  applications: [{
    type: Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });

export const EventModel = mongoose.model<EventDocument>('Event', eventSchema); 