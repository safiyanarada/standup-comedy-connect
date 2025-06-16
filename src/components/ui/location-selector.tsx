import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  getCurrentPosition, 
  geocodeAddress, 
  LocationResult, 
  Coordinates 
} from '@/lib/geolocation';

interface LocationSelectorProps {
  onLocationSelected: (result: LocationResult) => void;
  currentLocation?: LocationResult;
  placeholder?: string;
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelected,
  currentLocation,
  placeholder = "Entrez votre ville ou adresse",
  disabled = false
}) => {
  const [address, setAddress] = useState('');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGPSLocation = async () => {
    setIsLoadingGPS(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await getCurrentPosition();
      onLocationSelected(result);
      setSuccess(`Position détectée : ${result.address.city}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de géolocalisation');
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const handleAddressGeocode = async () => {
    if (!address.trim()) return;

    setIsLoadingGeocode(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await geocodeAddress(address.trim());
      onLocationSelected(result);
      setSuccess(`Adresse trouvée : ${result.address.city}`);
      setAddress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adresse non trouvée');
    } finally {
      setIsLoadingGeocode(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressGeocode();
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Localisation</h3>
        </div>

        {/* Position actuelle */}
        {currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-200 text-sm">
              Position actuelle : {currentLocation.address.city}
              {currentLocation.coordinates && (
                <span className="text-green-300 ml-2">
                  ({currentLocation.coordinates.latitude.toFixed(4)}, {currentLocation.coordinates.longitude.toFixed(4)})
                </span>
              )}
            </span>
          </motion.div>
        )}

        {/* Géolocalisation GPS */}
        <div className="space-y-2">
          <Button
            onClick={handleGPSLocation}
            disabled={isLoadingGPS || disabled}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoadingGPS ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Géolocalisation en cours...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Utiliser ma position GPS
              </>
            )}
          </Button>
          <p className="text-xs text-gray-400 text-center">
            Permet de détecter automatiquement votre position
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="text-gray-400 text-sm">ou</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Saisie manuelle d'adresse */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder={placeholder}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoadingGeocode || disabled}
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={handleAddressGeocode}
              disabled={!address.trim() || isLoadingGeocode || disabled}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoadingGeocode ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Entrez votre ville, adresse ou code postal
          </p>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
          >
            <p className="text-green-200 text-sm">{success}</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default LocationSelector; 