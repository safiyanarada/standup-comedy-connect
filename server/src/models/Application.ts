import mongoose, { Schema, Document, Types } from 'mongoose';
import { Application, PerformanceDetails } from '../types';

export interface ApplicationDocument extends Document {
  event: Types.ObjectId;
  comedian: Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  performanceDetails: PerformanceDetails;
}

const performanceDetailsSchema = new Schema<PerformanceDetails>({
  duration: { type: Number, required: true },
  description: { type: String, required: true },
  videoLink: { type: String }
});

const applicationSchema = new Schema<ApplicationDocument>({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  comedian: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  performanceDetails: {
    type: performanceDetailsSchema,
    required: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
applicationSchema.index({ event: 1, comedian: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ comedian: 1 });

export const ApplicationModel = mongoose.model<ApplicationDocument>('Application', applicationSchema); 