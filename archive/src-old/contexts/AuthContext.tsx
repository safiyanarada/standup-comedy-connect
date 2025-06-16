import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupData, HumoristeProfile } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  users: User[];
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
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('standup_users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('standup_token'));

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('standup_token');
        const savedUser = localStorage.getItem('standup_current_user');
        
        if (storedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const userExists = users.some(u => u.id === parsedUser.id);
          if (userExists) {
            setUser(parsedUser);
            setToken(storedToken);
            console.log("User loaded from localStorage:", parsedUser);
          } else {
            localStorage.removeItem('standup_token');
            localStorage.removeItem('standup_current_user');
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        localStorage.removeItem('standup_token');
        localStorage.removeItem('standup_current_user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [users]);

  useEffect(() => {
    localStorage.setItem('standup_users', JSON.stringify(users));
  }, [users]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const foundUser = users.find(u => u.email === credentials.email);
      
      if (!foundUser) {
        throw new Error('Utilisateur non trouvé');
      }

      if (foundUser.password !== credentials.password) {
        throw new Error('Mot de passe incorrect');
      }

      const newToken = 'token_' + Date.now();
      localStorage.setItem('standup_token', newToken);
      localStorage.setItem('standup_current_user', JSON.stringify(foundUser));
      setUser(foundUser);
      setToken(newToken);
      console.log("User after successful login:", foundUser);

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

      if (users.some(u => u.email === data.email)) {
        throw new Error('Cet email est déjà utilisé');
      }

      const newUser: User = {
        id: 'user_' + Date.now(),
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        onboardingCompleted: false,
        emailVerified: false,
        stats: {
          totalEvents: 0,
          totalRevenue: 0,
          averageRating: 0,
          viralScore: 0,
          profileViews: 0,
          lastActivity: new Date().toISOString()
        },
        profile: data.userType === 'humoriste' ? {
          stageName: data.stageName,
          location: data.location,
          bio: '',
          mobilityZone: { radius: 30 },
          experienceLevel: 'debutant',
          genres: [],
          availability: {
            weekdays: false,
            weekends: false,
            evenings: false
          },
          phone: data.phone
        } : {
          companyName: data.companyName,
          location: data.location,
          description: '',
          venueTypes: [],
          eventFrequency: 'monthly'
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      setUsers(prev => [...prev, newUser]);
      
      const newToken = 'token_' + Date.now();
      localStorage.setItem('standup_token', newToken);
      localStorage.setItem('standup_current_user', JSON.stringify(newUser));
      setUser(newUser);
      setToken(newToken);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('standup_token');
    localStorage.removeItem('standup_current_user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (profileData: any): Promise<User> => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');
      
      const updatedProfile = { ...user.profile };

      if (user.userType === 'humoriste') {
        const humoristeProfile = updatedProfile as HumoristeProfile;
        if (profileData.mobilityZone !== undefined) {
          if (typeof profileData.mobilityZone === 'number') {
            humoristeProfile.mobilityZone = { radius: Math.max(1, profileData.mobilityZone) };
          } else if (typeof profileData.mobilityZone === 'object' && profileData.mobilityZone !== null && typeof profileData.mobilityZone.radius === 'number') {
            humoristeProfile.mobilityZone = { ...humoristeProfile.mobilityZone, radius: Math.max(1, profileData.mobilityZone.radius) };
          } else {
            humoristeProfile.mobilityZone = { radius: 30 };
          }
        } else if (!humoristeProfile.mobilityZone?.radius) {
          humoristeProfile.mobilityZone = { radius: 30 };
        }
      }

      const { mobilityZone, ...restProfileData } = profileData;

      Object.assign(updatedProfile, restProfileData);

      const updatedUser: User = {
        ...user,
        profile: updatedProfile,
      };

      setUsers(prevUsers => prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      localStorage.setItem('standup_current_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
      throw err;
    }
  };

  const isAuthenticated = !!user && !!token;
  const isHumoriste = isAuthenticated && user?.userType === 'humoriste';
  const isOrganisateur = isAuthenticated && user?.userType === 'organisateur';

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    users,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated,
    isHumoriste,
    isOrganisateur,
    clearError,
    token,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
