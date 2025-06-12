// Types pour la géolocalisation
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  postalCode?: string;
  country?: string;
  coordinates?: Coordinates;
}

export interface LocationResult {
  address: Address;
  coordinates: Coordinates;
  accuracy?: number;
}

// Calcul de distance avec la formule haversine (distance réelle entre deux points GPS)
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Géolocalisation HTML5 du navigateur
export function getCurrentPosition(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        try {
          // Géocodage inverse pour obtenir l'adresse
          const address = await reverseGeocode(coordinates);
          resolve({
            coordinates,
            address,
            accuracy: position.coords.accuracy
          });
        } catch (error) {
          // Si le géocodage inverse échoue, on retourne quand même les coordonnées
          resolve({
            coordinates,
            address: { city: 'Position actuelle' },
            accuracy: position.coords.accuracy
          });
        }
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Géolocalisation refusée par l\'utilisateur';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position indisponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Délai de géolocalisation dépassé';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache de 5 minutes
      }
    );
  });
}

// Géocodage : convertir une adresse en coordonnées GPS
export async function geocodeAddress(address: string): Promise<LocationResult> {
  const encodedAddress = encodeURIComponent(`${address}, France`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=fr`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StandUpConnect/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du géocodage');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Adresse non trouvée');
    }

    const result = data[0];
    const coordinates: Coordinates = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };

    const addressParts = result.display_name.split(', ');
    const parsedAddress: Address = {
      city: extractCity(result),
      street: addressParts[0],
      postalCode: extractPostalCode(result),
      country: 'France',
      coordinates
    };

    return {
      coordinates,
      address: parsedAddress
    };
  } catch (error) {
    throw new Error(`Impossible de géocoder l'adresse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Géocodage inverse : convertir des coordonnées en adresse
export async function reverseGeocode(coordinates: Coordinates): Promise<Address> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=18&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StandUpConnect/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du géocodage inverse');
    }

    const data = await response.json();
    
    const address: Address = {
      city: extractCity(data),
      street: data.address?.road || data.address?.pedestrian || '',
      postalCode: data.address?.postcode || '',
      country: data.address?.country || 'France',
      coordinates
    };

    return address;
  } catch (error) {
    throw new Error(`Impossible de convertir les coordonnées en adresse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Extraire la ville depuis les données Nominatim
function extractCity(data: any): string {
  return data.address?.city || 
         data.address?.town || 
         data.address?.village || 
         data.address?.municipality || 
         data.address?.county ||
         'Ville inconnue';
}

// Extraire le code postal
function extractPostalCode(data: any): string {
  return data.address?.postcode || '';
}

// Coordonnées des principales villes françaises (fallback si l'API échoue)
export const FRENCH_CITIES_COORDS: { [city: string]: Coordinates } = {
  'Paris': { latitude: 48.8566, longitude: 2.3522 },
  'Lyon': { latitude: 45.764, longitude: 4.8357 },
  'Marseille': { latitude: 43.2965, longitude: 5.3698 },
  'Toulouse': { latitude: 43.6047, longitude: 1.4442 },
  'Nice': { latitude: 43.7102, longitude: 7.2620 },
  'Nantes': { latitude: 47.2184, longitude: -1.5536 },
  'Strasbourg': { latitude: 48.5734, longitude: 7.7521 },
  'Montpellier': { latitude: 43.6110, longitude: 3.8767 },
  'Bordeaux': { latitude: 44.8378, longitude: -0.5792 },
  'Lille': { latitude: 50.6292, longitude: 3.0573 }
};

// Obtenir les coordonnées d'une ville (avec fallback)
export function getCityCoordinates(city: string): Coordinates | null {
  // Chercher d'abord dans notre base de données locale
  const normalizedCity = city.trim();
  
  // Recherche exacte
  if (FRENCH_CITIES_COORDS[normalizedCity]) {
    return FRENCH_CITIES_COORDS[normalizedCity];
  }
  
  // Recherche approximative (insensible à la casse)
  const foundCity = Object.keys(FRENCH_CITIES_COORDS).find(
    cityKey => cityKey.toLowerCase() === normalizedCity.toLowerCase()
  );
  
  if (foundCity) {
    return FRENCH_CITIES_COORDS[foundCity];
  }
  
  return null;
}

// Calculer la distance entre une position et une ville
export function calculateDistanceToCity(userCoords: Coordinates, cityName: string): number | null {
  const cityCoords = getCityCoordinates(cityName);
  if (!cityCoords) return null;
  
  return calculateDistanceKm(userCoords, cityCoords);
} 