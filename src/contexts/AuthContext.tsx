import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupData, HumoristeProfile, OrganisateurProfile } from '@/types/auth';
import { getCityCoordinates } from '@/lib/geolocation';

interface AuthContextType {
  user: User | null;
  users: User[]; // Add users array
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

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@standup.com',
    firstName: 'Demo',
    lastName: 'User',
    userType: 'humoriste',
    profile: {
      stageName: 'Demo Comic',
      city: 'Paris',
      coordinates: getCityCoordinates('Paris'),
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
  },
  {
    id: '2',
    email: 'org@standup.com',
    firstName: 'Sophie',
    lastName: 'Martin',
    userType: 'organisateur',
    profile: {
      companyName: 'Comedy Club Paris',
      city: 'Paris',
      coordinates: getCityCoordinates('Paris'),
      description: 'Le meilleur club de comédie de Paris. Nous organisons des soirées stand-up 3 fois par semaine.',
      website: 'https://comedyclubparis.fr',
      venueTypes: ['club', 'theatre'],
      averageBudget: {
        min: 50,
        max: 200
      },
      eventFrequency: 'weekly'
    },
    stats: {
      totalEvents: 45,
      totalRevenue: 8500,
      averageRating: 4.8,
      viralScore: 920,
      profileViews: 2100,
      lastActivity: new Date().toISOString()
    },
    onboardingCompleted: true,
    emailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('standup_token');
        const userId = localStorage.getItem('standup_user_id');
        if (token && userId) {
          // Simulation d'une vérification de token
          await new Promise(resolve => setTimeout(resolve, 1000));
          const savedUser = mockUsers.find(u => u.id === userId);
          if (savedUser) {
            setUser(savedUser);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        localStorage.removeItem('standup_token');
        localStorage.removeItem('standup_user_id');
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
      
      // Vérifier les identifiants pour les comptes de test
      let userToLogin = null;
      
      if (credentials.email === 'demo@standup.com' && credentials.password === 'Demo123!') {
        userToLogin = mockUsers.find(u => u.email === 'demo@standup.com');
      } else if (credentials.email === 'org@standup.com' && credentials.password === 'Org123!') {
        userToLogin = mockUsers.find(u => u.email === 'org@standup.com');
      } else {
        throw new Error('Identifiants incorrects');
      }

      if (userToLogin) {
        const token = 'token_' + Date.now();
        localStorage.setItem('standup_token', token);
        localStorage.setItem('standup_user_id', userToLogin.id);
        setUser(userToLogin);
      } else {
        throw new Error('Utilisateur non trouvé');
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
        ...mockUsers[0],
        id: 'new_' + Date.now(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        onboardingCompleted: false,
        profile: data.userType === 'humoriste' ? {
          stageName: data.stageName,
          city: data.city,
          coordinates: getCityCoordinates(data.city),
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
          coordinates: getCityCoordinates(data.city),
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
    localStorage.removeItem('standup_user_id');
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
    users, // Add users to the context value
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
