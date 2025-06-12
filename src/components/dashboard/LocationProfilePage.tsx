import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { User, Save, MapPin, Settings, Building } from 'lucide-react';
import LocationSelector from '@/components/ui/location-selector';
import { LocationResult } from '@/lib/geolocation';

const LocationProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    // Champs humoristes
    stageName: '',
    bio: '',
    city: '',
    coordinates: null as any,
    mobilityZone: 50,
    
    // Champs organisateurs
    companyName: '',
    description: '',
    website: '',
    venueAddress: '',
    venueCity: '',
    venuePostalCode: '',
    phone: '',
  });

  // Charger les données du profil au montage
  useEffect(() => {
    if (user && user.profile) {
      if (user.userType === 'humoriste') {
        setFormData({
          stageName: 'stageName' in user.profile ? user.profile.stageName || '' : '',
          bio: 'bio' in user.profile ? user.profile.bio || '' : '',
          city: user.profile.city || '',
          coordinates: user.profile.coordinates || null,
          mobilityZone: 'mobilityZone' in user.profile ? user.profile.mobilityZone : 50,
          companyName: '',
          description: '',
          website: '',
          venueAddress: '',
          venueCity: '',
          venuePostalCode: '',
          phone: '',
        });
      } else {
        setFormData({
          stageName: '',
          bio: '',
          city: '',
          coordinates: null,
          mobilityZone: 50,
          companyName: 'companyName' in user.profile ? user.profile.companyName || '' : '',
          description: 'description' in user.profile ? user.profile.description || '' : '',
          website: 'website' in user.profile ? user.profile.website || '' : '',
          venueAddress: 'venueAddress' in user.profile ? user.profile.venueAddress || '' : '',
          venueCity: user.profile.city || '',
          venuePostalCode: 'venuePostalCode' in user.profile ? user.profile.venuePostalCode || '' : '',
          phone: 'phone' in user.profile ? user.profile.phone || '' : '',
        });
      }
    }
  }, [user]);

  const handleLocationSelected = (result: LocationResult) => {
    setFormData(prev => ({
      ...prev,
      city: result.address.city,
      coordinates: result.coordinates
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const profileData = user?.userType === 'humoriste' ? {
        stageName: formData.stageName,
        bio: formData.bio,
        city: formData.city,
        coordinates: formData.coordinates,
        mobilityZone: formData.mobilityZone,
      } : {
        companyName: formData.companyName,
        description: formData.description,
        website: formData.website,
        city: formData.venueCity,
        venueAddress: formData.venueAddress,
        venuePostalCode: formData.venuePostalCode,
        phone: formData.phone,
      };

      await updateProfile(profileData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isHumoriste = user.userType === 'humoriste';
  const currentLocation = formData.coordinates ? {
    address: { city: formData.city },
    coordinates: formData.coordinates
  } : undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-pink-400" />
        <h1 className="text-3xl font-bold text-white">
          {isHumoriste ? 'Configuration de Localisation' : 'Informations de l\'Entreprise'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prénom
              </label>
              <Input
                value={user.firstName}
                disabled
                className="bg-gray-700 border-gray-600 text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom
              </label>
              <Input
                value={user.lastName}
                disabled
                className="bg-gray-700 border-gray-600 text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
            </div>
          </div>

          {isHumoriste ? (
            <>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de scène
                </label>
                <Input
                  value={formData.stageName}
                  onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                  placeholder="Votre nom d'artiste"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Parlez-nous de votre style d'humour..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Nom de l'entreprise
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Nom de votre venue/entreprise"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre venue et le type d'événements..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site web
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://votre-site.com"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="01 23 45 67 89"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        {isHumoriste ? (
          <>
            {/* Localisation pour humoristes */}
            <LocationSelector
              onLocationSelected={handleLocationSelected}
              currentLocation={currentLocation}
              placeholder="Recherchez votre ville..."
            />

            {/* Zone de mobilité */}
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Zone de mobilité</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Distance maximale : {formData.mobilityZone}km
                  </label>
                  <Slider
                    value={[formData.mobilityZone]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, mobilityZone: value[0] }))}
                    max={200}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5km</span>
                    <span>200km</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400">
                  Vous verrez uniquement les événements dans un rayon de {formData.mobilityZone}km 
                  autour de votre position.
                </p>
                
                {currentLocation && (
                  <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-200">
                      🎯 Position configurée : <span className="font-medium">{formData.city}</span>
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      GPS: {formData.coordinates.latitude.toFixed(4)}, {formData.coordinates.longitude.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </>
        ) : (
          /* Adresse de la venue pour organisateurs */
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Adresse de votre venue principale</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">
                Renseignez l'adresse de votre venue principale. Vous pourrez spécifier des adresses 
                différentes lors de la création de chaque événement.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse de la salle
                </label>
                <Input
                  value={formData.venueAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                  placeholder="ex: 15 rue de la Gaîté"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ville
                  </label>
                  <Input
                    value={formData.venueCity}
                    onChange={(e) => setFormData(prev => ({ ...prev, venueCity: e.target.value }))}
                    placeholder="ex: Paris"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code postal
                  </label>
                  <Input
                    value={formData.venuePostalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, venuePostalCode: e.target.value }))}
                    placeholder="ex: 75014"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-200">
                  💡 <strong>Info :</strong> La géolocalisation GPS précise sera demandée lors de la 
                  création de chaque événement pour permettre aux humoristes de calculer la distance exacte.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end space-x-4">
          {success && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center text-green-400"
            >
              <Save className="w-4 h-4 mr-2" />
              Profil mis à jour !
            </motion.div>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LocationProfilePage; 