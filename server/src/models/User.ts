import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserProfile, Performance } from '../types/user';

// 1. Interfaces pour les types de données

interface ILocation {
  city: string;
  postalCode: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface IUserStats {
  totalEvents: number;
  totalRevenue: number;
  averageRating: number;
  viralScore: number;
  profileViews: number;
  lastActivity: Date;
}

interface IHumoristeProfile {
  stageName?: string;
  location: ILocation;
  bio?: string;
  mobilityZone: {
    radius: number;
    preferredCities?: string[];
  };
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
  phone?: string;
}

interface IOrganisateurProfile {
  companyName?: string;
  location: ILocation;
  description?: string;
  website?: string;
  venueTypes: string[];
  averageBudget?: {
    min: number;
    max: number;
  };
  eventFrequency?: 'weekly' | 'monthly' | 'occasional';
}

interface UserDocument extends User, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Schémas Mongoose

const LocationSchema = new Schema<ILocation>({
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  address: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

const UserStatsSchema = new Schema<IUserStats>({
  totalEvents: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  viralScore: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
});

const HumoristeProfileSchema = new Schema<IHumoristeProfile>({
  stageName: { type: String },
  location: { type: LocationSchema, required: true },
  bio: { type: String },
  mobilityZone: {
    radius: { type: Number, default: 30 },
    preferredCities: [{ type: String }],
  },
  experienceLevel: { type: String, enum: ['debutant', 'intermediaire', 'expert'], default: 'debutant' },
  socialLinks: {
    instagram: { type: String },
    tiktok: { type: String },
  },
  genres: [{ type: String }],
  availability: {
    weekdays: { type: Boolean, default: false },
    weekends: { type: Boolean, default: false },
    evenings: { type: Boolean, default: false },
  },
  phone: { type: String },
});

const OrganisateurProfileSchema = new Schema<IOrganisateurProfile>({
  companyName: { type: String },
  location: { type: LocationSchema, required: true },
  description: { type: String },
  website: { type: String },
  venueTypes: [{ type: String }],
  averageBudget: {
    min: { type: Number },
    max: { type: Number },
  },
  eventFrequency: { type: String, enum: ['weekly', 'monthly', 'occasional'] },
});

const performanceSchema = new Schema<Performance>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  videoLink: { type: String },
  feedback: { type: String }
});

const userProfileSchema = new Schema<UserProfile>({
  bio: { type: String, required: true },
  experience: { type: String, required: true },
  socialLinks: {
    youtube: { type: String },
    instagram: { type: String },
    twitter: { type: String }
  },
  performances: [performanceSchema]
});

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['COMEDIAN', 'ORGANIZER', 'ADMIN'],
    required: true
  },
  profile: {
    type: userProfileSchema,
    required: true
  },
  stats: { type: UserStatsSchema, default: {} },
  onboardingCompleted: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  avatarUrl: { type: String },
  createdAt: { type: Schema.Types.Date, default: Date.now },
  lastLoginAt: { type: Schema.Types.Date, default: Date.now },
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Middleware pour gérer les profils en fonction du userType avant la sauvegarde
userSchema.pre('save', function(next) {
  if (this.isModified('role') || this.isNew) {
    if (this.role === 'COMEDIAN' && !this.profile) {
      this.profile = { bio: '', experience: '' }; // Initialize with default values
    }
    // Add similar logic for 'ORGANIZER' if needed
  }
  next();
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema); 