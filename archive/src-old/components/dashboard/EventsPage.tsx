import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Euro, ListChecks, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { HumoristeProfile } from '@/types/auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const { getAvailableEvents, applyToEvent, isLoading, error } = useData();
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Récupérer les événements disponibles pour l'humoriste actuel
  const availableEvents = user ? getAvailableEvents(user.id, (user.profile as HumoristeProfile).location?.city) : [];

  // Filtrer les événements selon la ville
  const filteredEvents = availableEvents.filter(event => {
    const cityMatch = selectedCity === 'all' || event.location.city?.toLowerCase() === selectedCity.toLowerCase();
    return cityMatch;
  });

  // Récupérer la liste unique des villes des événements disponibles
  const cities = Array.from(new Set(
    availableEvents
      .map(event => event.location.city)
      .filter((city): city is string => typeof city === 'string' && city.trim() !== '')
  ));

  // Debug logs pour voir les villes et la sélection actuelle
  console.log('Debug - Cities for SelectItems:', cities);
  console.log('Debug - Current selectedCity:', selectedCity);

  const handleApply = async (eventId: string) => {
    if (!user) return;
    try {
      await applyToEvent(eventId, user.id, 'Je souhaite postuler à cet événement.');
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
      alert('Une erreur est survenue lors de l\'envoi de votre candidature.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p>Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Événements disponibles</h1>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedCity}
            onValueChange={setSelectedCity}
          >
            <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Filtrer par ville" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Toutes les villes</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-white">
                  {city}
                </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Aucun événement disponible
            </h3>
            <p className="text-gray-500">
              {selectedCity && selectedCity !== 'all'
                ? `Aucun événement trouvé dans la ville de ${selectedCity}`
                : 'Aucun événement disponible pour le moment'}
            </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
            <Card key={event.id} className="p-6 bg-gray-800/50 border-gray-700">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                  <p className="text-gray-400">{event.description}</p>
                </div>

                  <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-500" /> {event.venue}, {event.location.city}</p>
                  {event.location.address && (
                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-500" /> Adresse: {event.location.address}</p>
                    )}
                    <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-500" /> {event.date ? new Date(event.date).toLocaleDateString('fr-FR') : 'Date non spécifiée'}</p>
                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-500" /> {event.startTime || 'Heure non spécifiée'} {event.endTime ? ` - ${event.endTime}` : ''}</p>
                    <p className="flex items-center"><Euro className="w-4 h-4 mr-2 text-gray-500" /> Cachet: {event.fee !== undefined ? `${event.fee}€` : 'Non spécifié'}</p>
                    {event.maxPerformers !== undefined && event.maxPerformers > 0 && (
                      <p className="flex items-center"><Users className="w-4 h-4 mr-2 text-gray-500" /> Places humoristes: {event.applications?.filter(app => app.status === 'accepted').length || 0} / {event.maxPerformers}</p>
                    )}
                    {event.eventType && (
                      <p className="flex items-center"><Tag className="w-4 h-4 mr-2 text-gray-500" /> Type: {event.eventType}</p>
                    )}
                    {event.requirements && (
                      <p className="flex items-center"><ListChecks className="w-4 h-4 mr-2 text-gray-500" /> Exigences: {event.requirements}</p>
                    )}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => handleApply(event.id)}
                    className="w-full bg-pink-500 hover:bg-pink-600"
                    disabled={event.applications?.some(app => app.humoristId === user?.id) || (event.maxPerformers !== undefined && (event.applications?.filter(app => app.status === 'accepted').length || 0) >= event.maxPerformers)}
                  >
                    {event.applications?.some(app => app.humoristId === user?.id)
                      ? 'Déjà candidaté'
                      : event.maxPerformers !== undefined && (event.applications?.filter(app => app.status === 'accepted').length || 0) >= event.maxPerformers
                        ? 'Événement complet'
                        : 'Postuler'
                    }
                  </Button>
                </div>
                </div>
              </Card>
            ))
          )}
      </div>
    </div>
  );
}; 