import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Euro, Clock, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CreateEventModal from './CreateEventModal';

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { getEventsByOrganizer } = useData();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  if (!user) return null;

  const events = getEventsByOrganizer(user.id);

  const getStatusBadge = (status: string) => {
    const badges = {
      'draft': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'published': 'bg-green-500/20 text-green-400 border-green-500/30',
      'full': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'completed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestion des événements</h1>
          <p className="text-gray-400">
            {events.length} événement{events.length !== 1 ? 's' : ''} créé{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateEvent(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un événement
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="p-12 text-center bg-gray-800/50 border-gray-700">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            Aucun événement créé
          </h3>
          <p className="text-gray-500 mb-4">
            Créez votre premier événement pour commencer à recevoir des candidatures
          </p>
          <Button
            onClick={() => setShowCreateEvent(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un événement
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">{event.fee}€</div>
                    <div className="text-xs text-gray-400">cachet</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.venue}, {event.city}</span>
                    {event.coordinates && (
                      <span className="text-xs text-green-400 ml-1">
                        ✓ GPS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.applications.length}/{event.maxPerformers} candidatures</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                </div>
                
                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Candidatures reçues</span>
                    <span className="text-green-400 font-medium">{event.applications.length}</span>
                  </div>
                  {event.applications.length > 0 && (
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Acceptées</span>
                      <span className="text-blue-400 font-medium">
                        {event.applications.filter(app => app.status === 'accepted').length}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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

export default EventsPage; 