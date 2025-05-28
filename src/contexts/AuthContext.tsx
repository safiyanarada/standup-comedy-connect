
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<User>;
  isAuthenticated: boolean;
  isHumoriste: boolean;
  isOrganisateur: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data pour la démo
  const mockUser: User = {
    id: '1',
    email: 'demo@standup.com',
    firstName: 'Demo',
    lastName: 'User',
    userType: 'humoriste',
    profile: {
      stageName: 'Demo Comic',
      city: 'Paris',
      bio: 'Humoriste passionné de stand-up !',
      mobilityZone: 50,
      experienceLevel: 'intermediaire',
      socialLinks: {
        instagram: '@democomic',
        tiktok: '@democomic'
      },
      genres: ['observationnel', 'stand-up'],
      availability: {
        weekdays: true,
        weekends: true,
        evenings: true
      }
    },
    stats: {
      totalEvents: 25,
      totalRevenue: 3500,
      averageRating: 4.7,
      viralScore: 850,
      profileViews: 1250,
      lastActivity: new Date().toISOString()
    },
    onboardingCompleted: true,
    emailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString()
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('standup_token');
        if (token) {
          // Simulation d'une vérification de token
          await new Promise(resolve => setTimeout(resolve, 1000));
          setUser(mockUser);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        localStorage.removeItem('standup_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      // Simulation d'une connexion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (credentials.email === 'demo@standup.com' && credentials.password === 'Demo123!') {
        const token = 'demo_token_' + Date.now();
        localStorage.setItem('standup_token', token);
        setUser(mockUser);
      } else {
        throw new Error('Identifiants incorrects');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      setLoading(true);
      setError(null);

      // Simulation d'une inscription
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newUser: User = {
        ...mockUser,
        id: 'new_' + Date.now(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        onboardingCompleted: false,
        profile: data.userType === 'humoriste' ? {
          stageName: data.stageName,
          city: data.city,
          bio: '',
          mobilityZone: 30,
          experienceLevel: 'debutant',
          genres: [],
          availability: {
            weekdays: false,
            weekends: false,
            evenings: false
          }
        } : {
          companyName: data.companyName,
          city: data.city,
          description: '',
          venueTypes: [],
          eventFrequency: 'monthly'
        }
      };

      const token = 'new_token_' + Date.now();
      localStorage.setItem('standup_token', token);
      setUser(newUser);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('standup_token');
    setUser(null);
  };

  const updateProfile = async (profileData: any): Promise<User> => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      // Simulation d'une mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        profile: { ...user.profile, ...profileData },
        onboardingCompleted: true
      };
      
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isHumoriste: user?.userType === 'humoriste',
    isOrganisateur: user?.userType === 'organisateur',
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
