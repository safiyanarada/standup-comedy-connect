import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, Euro, Users, Navigation, Loader, RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Coordinates } from '@/lib/geolocation';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent } = useData();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    address: '',
    city: '',
    coordinates: null as Coordinates | null,
    date: '',
    startTime: '',
    endTime: '',
    fee: '',
    maxPerformers: '',
    requirements: '',
    eventType: 'open-mic' as 'open-mic' | 'show' | 'private' | 'festival'
  });

  // Vérifier si les champs d'adresse sont complets
  const isAddressComplete = formData.venue.trim() && formData.address.trim() && formData.city.trim();

  // Déclencher automatiquement le geocoding quand l'adresse est complète
  useEffect(() => {
    if (isAddressComplete && !formData.coordinates && !isGettingLocation) {
      geocodeAddress();
    }
  }, [formData.venue, formData.address, formData.city]);

  const geocodeAddress = async () => {
    if (!isAddressComplete) return;

    setIsGettingLocation(true);
    setLocationError(null);

    try {
      // Construire l'adresse complète pour le geocoding
      const fullAddress = `${formData.venue}, ${formData.address}, ${formData.city}, France`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&accept-language=fr`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const coordinates: Coordinates = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };
        
        setFormData(prev => ({ ...prev, coordinates }));
        setIsGettingLocation(false);
      } else {
        // Si pas de résultat, essayer avec juste l'adresse et la ville
        const simpleAddress = `${formData.address}, ${formData.city}, France`;
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simpleAddress)}&limit=1&accept-language=fr`
        );
        
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData && fallbackData.length > 0) {
          const result = fallbackData[0];
          const coordinates: Coordinates = {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          };
          
          setFormData(prev => ({ ...prev, coordinates }));
          setIsGettingLocation(false);
        } else {
          throw new Error('Adresse introuvable');
        }
      }
    } catch (error) {
      setIsGettingLocation(false);
      setLocationError(`❌ Impossible de localiser l'adresse "${formData.address}, ${formData.city}". Vérifiez que l'adresse est correcte.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification que la géolocalisation est renseignée
    if (!formData.coordinates) {
      alert('⚠️ La géolocalisation GPS de l\'événement est obligatoire. Vérifiez que l\'adresse est correcte.');
      return;
    }
    
    const eventData = {
      ...formData,
      fee: Number(formData.fee),
      maxPerformers: Number(formData.maxPerformers),
      coordinates: formData.coordinates,
      status: 'published' as const
    };

    console.log('Création événement:', eventData); // Debug
    createEvent(eventData);
    
    // Message de succès
    alert('✅ Événement créé avec succès ! Il apparaîtra maintenant dans votre dashboard.');
    
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      venue: '',
      address: '',
      city: '',
      coordinates: null,
      date: '',
      startTime: '',
      endTime: '',
      fee: '',
      maxPerformers: '',
      requirements: '',
      eventType: 'open-mic'
    });
  };

  const eventTypes = [
    { value: 'open-mic', label: 'Open Mic', emoji: '🎤' },
    { value: 'show', label: 'Spectacle', emoji: '🎭' },
    { value: 'private', label: 'Événement privé', emoji: '🏢' },
    { value: 'festival', label: 'Festival', emoji: '🎪' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-gray-900 rounded-2xl border border-gray-700 m-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">🎪 Créer un événement</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Event Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Type d'événement
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {eventTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, eventType: type.value as any }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.eventType === type.value
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.emoji}</div>
                      <div className="font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Titre de l'événement *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="ex: Soirée Open Mic du Jeudi"
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez votre événement..."
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Début *
                        </label>
                        <Input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Fin *
                        </label>
                        <Input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Euro className="w-4 h-4 inline mr-1" />
                        Cachet (€) *
                      </label>
                      <Input
                        type="number"
                        value={formData.fee}
                        onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                        placeholder="ex: 50"
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Nb max d'humoristes *
                      </label>
                      <Input
                        type="number"
                        value={formData.maxPerformers}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxPerformers: e.target.value }))}
                        placeholder="ex: 8"
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exigences particulières
                    </label>
                    <Input
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="ex: Maximum 7 minutes par passage"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* Right Column - Venue & Location */}
                <div className="space-y-6">
                  {/* Venue Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                      📍 Lieu de l'événement
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom du lieu *
                      </label>
                      <Input
                        value={formData.venue}
                        onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                        placeholder="ex: Le Comedy Club, Théâtre de la Ville..."
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Adresse complète *
                      </label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="ex: 15 rue de la Gaîté"
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ville *
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="ex: Paris"
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Géolocalisation automatique */}
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                      <Navigation className="w-4 h-4 mr-2 text-purple-400" />
                      🎯 Géolocalisation automatique
                    </h4>

                    {!isAddressComplete && (
                      <div className="text-sm text-purple-200">
                        <p>📝 Remplissez d'abord les 3 champs ci-dessus pour localiser automatiquement votre événement.</p>
                      </div>
                    )}

                    {isAddressComplete && isGettingLocation && (
                      <Card className="p-3 bg-blue-500/10 border-blue-500/20">
                        <div className="flex items-center text-blue-300 text-sm">
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          <span>🔍 Recherche des coordonnées GPS de l'adresse...</span>
                        </div>
                      </Card>
                    )}

                    {locationError && (
                      <Card className="p-3 bg-red-500/10 border-red-500/20">
                        <div className="text-red-300 text-sm">
                          <p className="font-medium mb-2">{locationError}</p>
                          <p className="text-xs text-red-200 mb-3">
                            💡 Astuce : Vérifiez l'orthographe de l'adresse et de la ville.
                          </p>
                          <Button
                            type="button"
                            onClick={geocodeAddress}
                            className="bg-red-500 hover:bg-red-600"
                            size="sm"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Relocaliser
                          </Button>
                        </div>
                      </Card>
                    )}

                    {formData.coordinates && (
                      <Card className="p-3 bg-green-500/10 border-green-500/20">
                        <h5 className="text-sm font-medium text-green-300 mb-2">
                          ✅ Événement localisé avec succès !
                        </h5>
                        <div className="text-xs text-green-200 space-y-1">
                          <p><strong>Adresse :</strong> {formData.venue}, {formData.address}, {formData.city}</p>
                          <p><strong>Coordonnées GPS :</strong> {formData.coordinates.latitude.toFixed(6)}, {formData.coordinates.longitude.toFixed(6)}</p>
                          <p className="text-green-300 mt-2">
                            🎯 Les humoristes verront cet événement s'il se trouve dans leur zone de mobilité.
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.coordinates}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formData.coordinates ? (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      🎪 Créer l'événement
                    </>
                  ) : (
                    '📍 Localisation requise'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateEventModal;
