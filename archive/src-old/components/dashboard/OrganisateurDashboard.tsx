import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Users, Calendar, Clock, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import MessagesPage from './MessagesPage';
import SearchHumoristsPage from './SearchHumoristsPage';

const OrganisateurDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getOrganizerStats, applications, events } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'applications' | 'search' | 'messages' | 'billing' | 'stats' | 'settings'>('overview');

  if (!user || user.userType !== 'organisateur') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <h1>Accès non autorisé</h1>
      </div>
    );
  }

  const organizerStats = getOrganizerStats(user.id);

  const organizerEvents = events.filter(event => event.organizerId === user.id);
  const pendingApplicationsCount = applications.filter(app => 
    organizerEvents.some(event => event.id === app.eventId) && app.status === 'pending'
  ).length;

  // Calculate stats for "Total Humoristes"
  const allApplicationsForOrganizerEvents = applications.filter(app =>
    organizerEvents.some(event => event.id === app.eventId)
  );

  const uniqueHumorists = new Set(allApplicationsForOrganizerEvents.map(app => app.humoristId));
  const totalHumorists = uniqueHumorists.size;

  const acceptedApplicationsCount = allApplicationsForOrganizerEvents.filter(app => app.status === 'accepted').length;
  const rejectedApplicationsCount = allApplicationsForOrganizerEvents.filter(app => app.status === 'rejected').length;

  const totalApplications = allApplicationsForOrganizerEvents.length;

  const acceptedPercentage = totalApplications > 0 
    ? ((acceptedApplicationsCount / totalApplications) * 100).toFixed(0) 
    : 0;
  const rejectedPercentage = totalApplications > 0 
    ? ((rejectedApplicationsCount / totalApplications) * 100).toFixed(0) 
    : 0;

  // Filter events for upcoming and completed
  const now = new Date();

  const upcomingEvents = organizerEvents.filter(event => {
    const eventDateTime = new Date(`${event.date}T${event.startTime}`);
    return eventDateTime > now;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  const completedEvents = organizerEvents.filter(event => {
    const eventDateTime = new Date(`${event.date}T${event.endTime}`);
    return eventDateTime <= now || event.status === 'completed';
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateB.getTime() - dateA.getTime(); // Sort descending for most recent completed
  });

  // Further filter upcoming events into 'not full' and 'full'
  const upcomingNotFullEvents = upcomingEvents.filter(event => {
    const acceptedCount = event.applications.filter(app => app.status === 'accepted').length;
    return event.status !== 'full' && (event.maxPerformers === undefined || acceptedCount < (event.maxPerformers || 0));
  });

  const upcomingFullEvents = upcomingEvents.filter(event => {
    const acceptedCount = event.applications.filter(app => app.status === 'accepted').length;
    return event.status === 'full' || (event.maxPerformers !== undefined && acceptedCount >= (event.maxPerformers || 0));
  });

  // Number of archived events (can be considered completed events)
  const archivedEventsCount = completedEvents.length;

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return <MessagesPage />;
      case 'search':
        return <SearchHumoristsPage />;
      case 'overview':
      default:
  return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Événements créés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Événements créés</p>
                <p className="text-2xl font-bold text-white">{organizerStats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
        </motion.div>

        {/* Candidatures en attente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Candidatures en attente</p>
                <p className="text-2xl font-bold text-white">{pendingApplicationsCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
        </motion.div>

        {/* Total Humoristes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-400 text-sm">Humoristes postulants</p>
                <p className="text-2xl font-bold text-white">{totalHumorists}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Acceptées:</span>
                <span className="text-green-400">{acceptedApplicationsCount} ({acceptedPercentage}%)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Refusées:</span>
                <span className="text-red-400">{rejectedApplicationsCount} ({rejectedPercentage}%)</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Prochains événements (non complets) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Prochains événements (non complets)</h3>
            {upcomingNotFullEvents.length > 0 ? (
              <ul className="space-y-3">
                {upcomingNotFullEvents.slice(0, 3).map(event => (
                  <li key={event.id} className="text-gray-400 text-sm">
                    <span className="font-medium text-white">{event.title}</span> - {new Date(event.date).toLocaleDateString('fr-FR')} à {event.location.city}
                  </li>
                ))}
                {upcomingNotFullEvents.length > 3 && (
                  <li className="text-gray-500 text-xs mt-2">+{upcomingNotFullEvents.length - 3} autres...</li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Aucun événement non complet à venir.</p>
            )}
          </Card>
        </motion.div>

        {/* Événements complets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-gray-800/50 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Événements complets</h3>
            {upcomingFullEvents.length > 0 || completedEvents.length > 0 ? (
              <ul className="space-y-3">
                {upcomingFullEvents.slice(0, 3).map(event => (
                  <li key={event.id} className="text-gray-400 text-sm">
                    <span className="font-medium text-white">{event.title}</span> - {new Date(event.date).toLocaleDateString('fr-FR')} ({event.applications.filter(app => app.status === 'accepted').length}/{event.maxPerformers || 'N/A'} humoristes)
                  </li>
                ))}
                {completedEvents.slice(0, 3).map(event => (
                  <li key={event.id} className="text-gray-400 text-sm">
                    <span className="font-medium text-white">{event.title}</span> - {new Date(event.date).toLocaleDateString('fr-FR')} (Terminé)
                  </li>
                ))}
                {(upcomingFullEvents.length + completedEvents.length) > 3 && (
                  <li className="text-gray-500 text-xs mt-2">+{(upcomingFullEvents.length + completedEvents.length) - 3} autres...</li>
                )}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Aucun événement complet ou passé.</p>
            )}
          </Card>
        </motion.div>

              {/* Événements archivés */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6 bg-gray-800/50 border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Événements archivés</p>
                      <p className="text-2xl font-bold text-white">{archivedEventsCount}</p>
                    </div>
                    <Archive className="w-8 h-8 text-indigo-400" />
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-8 pt-6">
      <h1 className="text-3xl font-bold text-white mb-6">Tableau de bord de l'organisateur</h1>
      
      {/* Navigation par onglets */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-700">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'overview' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'messages' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'search' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('search')}
          >
            Rechercher
          </button>
          {/* Ajoutez d'autres onglets ici si nécessaire */}
        </div>
      </div>

      {/* Contenu de l'onglet */}
      {renderContent()}
    </div>
  );
};

export default OrganisateurDashboard;
