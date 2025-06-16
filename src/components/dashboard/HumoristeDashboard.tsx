import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  MessageSquare,
  Zap, 
  BarChart3,
  User,
  Search,
  Send,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import DashboardSidebar from './DashboardSidebar';
import OpportunitiesPage from './OpportunitiesPage';
import MyApplicationsPage from './MyApplicationsPage';
import MessagesPage from './MessagesPage';
import ViralScorePage from './ViralScorePage';
import StatsPage from './StatsPage';
import ProfilePage from './ProfilePage';
import LocationProfilePage from './LocationProfilePage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MessageNotificationBadge from './MessageNotificationBadge';

const HumoristeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getHumoristeStats, getAvailableEvents, getApplicationsByHumorist, getUnreadNotifications } = useData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'applications' | 'messages' | 'location' | 'profile'>('dashboard');

  if (!user) return null;

  const stats = getHumoristeStats(user.id);
  const availableEvents = getAvailableEvents(user.id);
  const applications = getApplicationsByHumorist(user.id);
  const unreadNotifications = getUnreadNotifications(user.id);

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <OpportunitiesPage />;
      case 'applications':
        return <MyApplicationsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'location':
        return <LocationProfilePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-200 text-sm font-medium">Score Viral</p>
                      <p className="text-3xl font-bold text-white">{user.stats?.viralScore || 0}</p>
                    </div>
                    <Zap className="w-8 h-8 text-pink-400" />
                  </div>
                  <p className="text-pink-300/80 text-xs mt-2">
                    +{Math.floor(Math.random() * 50)} cette semaine
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Candidatures</p>
                      <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
                    </div>
                    <Send className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-blue-300/80 text-xs mt-2">
                    {stats.acceptedApplications} acceptées
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm font-medium">Opportunités</p>
                      <p className="text-3xl font-bold text-white">{availableEvents.length}</p>
                    </div>
                    <Search className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-green-300/80 text-xs mt-2">
                    Dans votre zone
                  </p>
                </motion.div>
              </div>

              {/* Recent Opportunities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Opportunités récentes</h3>
                <div className="space-y-4">
                  {availableEvents.slice(0, 3).map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{event.title}</h4>
                        <p className="text-sm text-gray-400">{event.venue} • {event.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-400">{event.fee}€</p>
                        <p className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <DashboardSidebar userType="humoriste" />
            </div>
          </div>
        );
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'applications', label: 'Candidatures', icon: Star },
    { id: 'messages', label: 'Messages', icon: MessageSquare, hasNotification: true },
    { id: 'location', label: 'Localisation', icon: MapPin },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Salut {user.firstName} ! 👋
          </h1>
          <p className="text-gray-400">
            Prêt pour ton prochain show ?
          </p>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-700 mt-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 ${
                    activeTab === tab.id 
                      ? 'bg-pink-500 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab.hasNotification ? (
                    <MessageNotificationBadge />
                  ) : (
                    <tab.icon className="w-4 h-4" />
                  )}
                  <span>{tab.label}</span>
                </Button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default HumoristeDashboard;
