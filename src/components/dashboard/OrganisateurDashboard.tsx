
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Euro, 
  Star,
  Plus,
  Eye,
  Clock,
  MapPin,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DashboardSidebar from './DashboardSidebar';
import CreateEventModal from './CreateEventModal';
import EventApplicationsList from './EventApplicationsList';

const OrganisateurDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getEventsByOrganizer, getOrganizerStats, getUnreadNotifications } = useData();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  if (!user) return null;

  const myEvents = getEventsByOrganizer(user.id);
  const stats = getOrganizerStats(user.id);
  const unreadNotifications = getUnreadNotifications(user.id);

  const recentEvents = myEvents.slice(0, 5);

  const getStatusBadge = (status: string) => {
    const badges = {
      'draft': 'bg-gray-500 text-white',
      'published': 'bg-green-500 text-white',
      'full': 'bg-blue-500 text-white',
      'completed': 'bg-purple-500 text-white',
      'cancelled': 'bg-red-500 text-white'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-500 text-white';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'draft': 'Brouillon',
      'published': 'Publié',
      'full': 'Complet',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
        <DashboardSidebar userType="organisateur" />
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <span>← Retour au tableau de bord</span>
              </button>
            </div>
            <EventApplicationsList eventId={selectedEvent} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex">
      <DashboardSidebar userType="organisateur" />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Salut {user.firstName} ! 👋
              </h1>
              <p className="text-gray-400">
                Gérez vos événements et découvrez de nouveaux talents
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
              
              <Button
                onClick={() => setShowCreateEvent(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un événement
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Événements créés</p>
                    <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-400" />
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
                    <p className="text-gray-400 text-sm">Candidatures reçues</p>
                    <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-400" />
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
                    <p className="text-gray-400 text-sm">Événements terminés</p>
                    <p className="text-2xl font-bold text-white">{stats.completedEvents}</p>
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
              <Card className="p-6 bg-gradient-to-r from-pink-500/20 to-red-500/20 border-pink-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Temps de réponse moyen</p>
                    <p className="text-2xl font-bold text-white">{stats.averageResponseTime}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-pink-400" />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Events */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Mes événements récents</h2>
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Aucun événement créé
                </h3>
                <p className="text-gray-500 mb-4">
                  Créez votre premier événement pour commencer à recevoir des candidatures
                </p>
                <Button
                  onClick={() => setShowCreateEvent(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un événement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-white">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.applications.length} candidature{event.applications.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-400">
                        {event.fee}€
                      </span>
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de création d'événement */}
      {showCreateEvent && (
        <CreateEventModal
          isOpen={showCreateEvent}
          onClose={() => setShowCreateEvent(false)}
        />
      )}
    </div>
  );
};

export default OrganisateurDashboard;
