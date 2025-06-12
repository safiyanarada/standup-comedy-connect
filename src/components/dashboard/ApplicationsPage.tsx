import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, MapPin, Navigation, CheckCircle, XCircle, Clock, Filter, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { calculateDistanceKm, getCityCoordinates } from '@/lib/geolocation';

const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const { getEventsByOrganizer, getUserById, respondToApplication, updateApplicationStatus } = useData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  if (!user) return null;

  const events = getEventsByOrganizer(user.id);
  const allApplications = events.flatMap(event => 
    event.applications.map(app => ({
      ...app,
      eventTitle: event.title,
      eventDate: event.date,
      eventCity: event.city,
      eventCoordinates: event.coordinates
    }))
  );

  // Marquer comme vue automatiquement
  useEffect(() => {
    const pendingApplications = allApplications.filter(app => app.status === 'pending');
    pendingApplications.forEach(app => {
      // Marquer comme vue après 1 seconde de visualisation
      setTimeout(() => {
        if (app.status === 'pending') {
          updateApplicationStatus(app.id, 'viewed' as 'accepted' | 'rejected');
        }
      }, 1000);
    });
  }, [allApplications, updateApplicationStatus]);

  // Statistiques rapides
  const stats = {
    total: allApplications.length,
    pending: allApplications.filter(app => app.status === 'pending').length,
    accepted: allApplications.filter(app => app.status === 'accepted').length,
    rejected: allApplications.filter(app => app.status === 'rejected').length,
    recent: allApplications.filter(app => {
      const daysDiff = (Date.now() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length
  };

  // Calculer la distance entre l'événement et l'humoriste
  const calculateApplicationDistance = (application: any): number | null => {
    const humoriste = getUserById(application.humoristId);
    
    if (!humoriste || !application.eventCoordinates) return null;
    
    // Si l'humoriste a des coordonnées GPS
    if (humoriste.profile?.coordinates) {
      return calculateDistanceKm(humoriste.profile.coordinates, application.eventCoordinates);
    }
    
    // Sinon, calcul basé sur les villes
    if (humoriste.profile?.city && application.eventCity) {
      const humoristeCoords = getCityCoordinates(humoriste.profile.city);
      const eventCoords = getCityCoordinates(application.eventCity);
      if (humoristeCoords && eventCoords) {
        return calculateDistanceKm(humoristeCoords, eventCoords);
      }
    }
    
    return null;
  };

  // Filtrer les candidatures
  const filteredApplications = allApplications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || app.eventId === eventFilter;
    return matchesStatus && matchesEvent;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'viewed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'accepted': 'bg-green-500/20 text-green-400 border-green-500/30',
      'rejected': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pending': 'En attente',
      'viewed': 'Vue',
      'accepted': 'Acceptée',
      'rejected': 'Refusée'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleAccept = (applicationId: string) => {
    respondToApplication(applicationId, 'accepted');
  };

  const handleReject = (applicationId: string) => {
    respondToApplication(applicationId, 'rejected');
  };

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-6 h-6 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-xs font-medium">En attente</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs font-medium">Acceptées</p>
              <p className="text-2xl font-bold text-white">{stats.accepted}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-200 text-xs font-medium">Refusées</p>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
            </div>
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-xs font-medium">Cette semaine</p>
              <p className="text-2xl font-bold text-white">{stats.recent}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Candidatures reçues</h1>
          <p className="text-gray-400">
            {filteredApplications.length} candidature{filteredApplications.length !== 1 ? 's' : ''} 
            {statusFilter !== 'all' && ` • ${getStatusText(statusFilter)}`}
          </p>
        </div>
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="viewed">Vues</SelectItem>
              <SelectItem value="accepted">Acceptées</SelectItem>
              <SelectItem value="rejected">Refusées</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full lg:w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Événement" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Tous les événements</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des candidatures */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center bg-gray-800/50 border-gray-700">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            Aucune candidature trouvée
          </h3>
          <p className="text-gray-500">
            Vous recevrez des candidatures dès que vos événements seront publiés
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application, index) => {
            const humoriste = getUserById(application.humoristId);
            const distance = calculateApplicationDistance(application);
            
            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Informations humoriste */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {application.stageName || application.humoristName}
                          </h3>
                          {application.stageName && (
                            <p className="text-sm text-gray-400">{application.humoristName}</p>
                          )}
                        </div>
                        <Badge className={`px-3 py-1 text-xs font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Pour : {application.eventTitle}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Candidaté le {new Date(application.appliedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {humoriste?.profile?.city && (
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>Basé à {humoriste.profile.city}</span>
                            {humoriste.profile.coordinates && (
                              <span className="text-xs text-green-400 ml-1">✓ GPS</span>
                            )}
                          </div>
                        )}
                        {distance !== null && (
                          <div className="flex items-center text-sm text-cyan-400">
                            <Navigation className="w-4 h-4 mr-2" />
                            <span>{distance.toFixed(1)}km de votre événement</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Message de candidature :</h4>
                        <p className="text-sm text-gray-400">{application.message}</p>
                      </div>
                      
                      {/* Infos humoriste */}
                      {humoriste?.profile && (
                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-300 mb-2">Profil humoriste :</h4>
                          {humoriste.userType === 'humoriste' && 'experienceLevel' in humoriste.profile && (
                            <div className="text-xs text-blue-200 space-y-1">
                              <p>Niveau : {humoriste.profile.experienceLevel}</p>
                              {humoriste.profile.mobilityZone && (
                                <p>Zone de mobilité : {humoriste.profile.mobilityZone}km</p>
                              )}
                              {humoriste.profile.genres && (
                                <p>Genres : {humoriste.profile.genres.join(', ')}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    {application.status === 'pending' && (
                      <div className="flex lg:flex-col gap-2 lg:w-32">
                        <Button
                          onClick={() => handleAccept(application.id)}
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accepter
                        </Button>
                        <Button
                          onClick={() => handleReject(application.id)}
                          variant="outline"
                          className="flex-1 lg:flex-none border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage; 