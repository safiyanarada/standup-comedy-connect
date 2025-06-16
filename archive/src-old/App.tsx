import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { DataProvider } from '@/contexts/DataContext';
import LoginPage from '@/components/auth/LoginPage';
import SignupPage from '@/components/auth/SignupPage';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MyEventsPage } from '@/components/dashboard/MyEventsPage';
import { EventsPage } from '@/components/dashboard/EventsPage';
import MyApplicationsPage from '@/components/dashboard/MyApplicationsPage';
import { ApplicationsPage } from '@/components/dashboard/ApplicationsPage';
import ProfilePage from '@/components/dashboard/ProfilePage';
import HumoristeDashboard from '@/components/dashboard/HumoristeDashboard';
import OrganisateurDashboard from '@/components/dashboard/OrganisateurDashboard';

console.log('MyApplicationsPage:', MyApplicationsPage);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const OrganizerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.userType === 'organisateur' ? <>{children}</> : <Navigate to="/dashboard" />;
};

const HumoristRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.userType === 'humoriste' ? <>{children}</> : <Navigate to="/dashboard" />;
};

const DashboardContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.userType === 'humoriste' ? <HumoristeDashboard /> : <OrganisateurDashboard />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <EventsProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <DashboardContent />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/my-events"
                element={
                  <OrganizerRoute>
                    <DashboardLayout>
                      <MyEventsPage />
                    </DashboardLayout>
                  </OrganizerRoute>
                }
              />
              <Route
                path="/dashboard/events"
                element={
                  <HumoristRoute>
                    <DashboardLayout>
                      <EventsPage />
                    </DashboardLayout>
                  </HumoristRoute>
                }
              />
              <Route
                path="/dashboard/applications"
                element={
                  <OrganizerRoute>
                    <DashboardLayout>
                      <ApplicationsPage />
                    </DashboardLayout>
                  </OrganizerRoute>
                }
              />
              <Route
                path="/dashboard/my-applications"
                element={
                  <HumoristRoute>
                    <DashboardLayout>
                      <MyApplicationsPage />
                    </DashboardLayout>
                  </HumoristRoute>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </DataProvider>
        </EventsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
