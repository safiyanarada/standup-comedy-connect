
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Clock as ClockIcon, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const { getApplicationsByHumorist, getEventById } = useData();

  if (!user) return null;

  const myApplications = getApplicationsByHumorist(user.id);
  
  const pendingApplications = myApplications.filter(app => app.status === 'pending');
  const acceptedApplications = myApplications.filter(app => app.status === 'accepted');
  const rejectedApplications = myApplications.filter(app => app.status === 'rejected');
  const viewedApplications = myApplications.filter(app => app.status === 'viewed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'viewed':
        return <Eye className="w-5 h-5 text-blue-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'viewed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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

  const renderApplicationCard = (application: any, index: number) => {
    const event = getEventById(application.eventId);
    if (!event) return null;

    return (
      <motion.div
        key={application.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="p-6 bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{event.organizerName}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <Badge className={`${getStatusColor(application.status)} border`}>
                {getStatusText(application.status)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
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
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-400">
                <span className="font-medium">Cachet:</span> 
                <span className="text-green-400 font-bold ml-2">{event.fee}€</span>
              </div>
              <div className="text-sm text-gray-400">
                <span className="font-medium">Candidature envoyée:</span>
                <div className="text-gray-300">{new Date(application.appliedAt).toLocaleDateString('fr-FR')}</div>
              </div>
              {application.respondedAt && (
                <div className="text-sm text-gray-400">
                  <span className="font-medium">Réponse reçue:</span>
                  <div className="text-gray-300">{new Date(application.respondedAt).toLocaleDateString('fr-FR')}</div>
                </div>
              )}
            </div>
          </div>

          {application.message && (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Mon message:</h4>
              <p className="text-gray-400 text-sm">{application.message}</p>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Mes candidatures</h1>
        <p className="text-gray-400">Suivi de toutes tes candidatures aux événements</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="all" className="data-[state=active]:bg-pink-500">
            Toutes ({myApplications.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500">
            En attente ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="viewed" className="data-[state=active]:bg-blue-500">
            Vues ({viewedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-green-500">
            Acceptées ({acceptedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500">
            Refusées ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {myApplications.length === 0 ? (
            <Card className="p-12 text-center bg-gray-800/50 border-gray-700">
              <ClockIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Aucune candidature</h3>
              <p className="text-gray-500">Commence par candidater à des événements !</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myApplications.map((application, index) => renderApplicationCard(application, index))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          <div className="space-y-4">
            {pendingApplications.map((application, index) => renderApplicationCard(application, index))}
          </div>
        </TabsContent>

        <TabsContent value="viewed" className="space-y-4 mt-6">
          <div className="space-y-4">
            {viewedApplications.map((application, index) => renderApplicationCard(application, index))}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          <div className="space-y-4">
            {acceptedApplications.map((application, index) => renderApplicationCard(application, index))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          <div className="space-y-4">
            {rejectedApplications.map((application, index) => renderApplicationCard(application, index))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyApplicationsPage;
