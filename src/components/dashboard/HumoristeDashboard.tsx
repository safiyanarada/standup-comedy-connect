import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Calendar, 
  Trophy, 
  TrendingUp,
  MapPin,
  Clock,
  Euro,
  Star,
  Eye,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardSidebar from './DashboardSidebar';
import EventsNearMe from './EventsNearMe';
import ApplicationsStatus from './ApplicationsStatus';

const HumoristeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getHumoristeStats, getAvailableEvents, getApplicationsByHumorist, getUnreadNotifications } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'applications'>('overview');

  if (!user) return null;

  const stats = getHumoristeStats(user.id);
  const availableEvents = getAvailableEvents(user.id, user.profile.city);
  const myApplications = getApplicationsByHumorist(user.id);
  const unreadNotifications = getUnreadNotifications(user.id);
  
  // Calcul du score viral (basé sur les stats)
  const viralScore = Math.min(1000, (stats.acceptedApplications * 100) + (stats.completedShows * 150) + (stats.averageRating * 50));
  const viralProgress = (viralScore / 1000) * 100;

  const pendingApplications = myApplications.filter(app => app.status === 'pending').length;
  const acceptedApplications = myApplications.filter(app => app.status === 'accepted').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'opportunities':
        return <EventsNearMe />;
      case 'applications':
        return <ApplicationsStatus />;
      default:
        return (
          <div className="space-y-8">
            {/* Score Viral Section */}
            <Card className="p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Zap className="w-6 h-6 text-yellow-400 mr-2" />
                    Score Viral
                  </h2>
                  <p className="text-gray-400 text-sm">Ta popularité dans la communauté</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-yellow-400">{viralScore}</div>
                  <div className="text-sm text-gray-400">/ 1000</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-yellow-400 to-pink-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${viralProgress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-gray-400">
                +{Math.floor(viralScore * 0.1)} points ce mois
              </p>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Spectacles ce mois</p>
                      <p className="text-2xl font-bold text-white">{acceptedApplications}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Revenus estimés</p>
                      <p className="text-2xl font-bold text-white">{acceptedApplications * 75}€</p>
                    </div>
                    <Euro className="w-8 h-8 text-green-400" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Note moyenne</p>
                      <p className="text-2xl font-bold text-white">{stats.averageRating}/5</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taux d'acceptation</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.totalApplications > 0 ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100) : 0}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Opportunités recommandées */}
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Opportunités près de toi</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('opportunities')}
                >
                  Voir tout
                </Button>
              </div>

              {availableEvents.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Aucun événement disponible
                  </h3>
                  <p className="text-gray-500">
                    Nouveaux événements bientôt disponibles dans ta zone
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableEvents.slice(0, 3).map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.startTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">{event.fee}€</div>
                          <div className="text-xs text-gray-400">{event.eventType}</div>
                        </div>
                        <Button size="sm" className="bg-pink-500 hover:bg-pink-600">
                          Candidater
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            {/* Candidatures en cours */}
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Mes candidatures récentes</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('applications')}
                >
                  Voir tout
                </Button>
              </div>

              {myApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Aucune candidature
                  </h3>
                  <p className="text-gray-500">
                    Commence par candidater à des événements !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.slice(0, 3).map((application, index) => {
                    const event = availableEvents.find(e => e.id === application.eventId) || 
                                 { title: 'Événement', venue: 'Lieu', date: application.appliedAt };
                    
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'accepted': return 'text-green-400 bg-green-500/20';
                        case 'rejected': return 'text-red-400 bg-red-500/20';
                        case 'viewed': return 'text-blue-400 bg-blue-500/20';
                        default: return 'text-yellow-400 bg-yellow-500/20';
                      }
                    };

                    const getStatusText = (status: string) => {
                      switch (status) {
                        case 'accepted': return 'Acceptée';
                        case 'rejected': return 'Refusée';
                        case 'viewed': return 'Vue';
                        default: return 'En attente';
                      }
                    };

                    return (
                      <motion.div
                        key={application.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-white">{event.title}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <DashboardSidebar userType="humoriste" />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Salut {user.userType === 'humoriste' && 'stageName' in user.profile && user.profile.stageName || user.firstName} ! 🎤
              </h1>
              <p className="text-gray-400">
                Prêt à faire vibrer les foules ?
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {unreadNotifications.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-400" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                </div>
              )}
              
              {pendingApplications > 0 && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-2">
                  <span className="text-yellow-400 text-sm font-medium">
                    {pendingApplications} candidature{pendingApplications !== 1 ? 's' : ''} en attente
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
              { id: 'opportunities', label: 'Opportunités', icon: MapPin },
              { id: 'applications', label: 'Mes candidatures', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
                  activeTab === id
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HumoristeDashboard;
