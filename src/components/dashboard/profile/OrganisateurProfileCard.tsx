
import React from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OrganisateurProfile } from '@/types/auth';

interface OrganisateurProfileCardProps {
  profile: OrganisateurProfile;
  isEditing: boolean;
  formData: OrganisateurProfile;
  onFormDataChange: (data: Partial<OrganisateurProfile>) => void;
}

const OrganisateurProfileCard: React.FC<OrganisateurProfileCardProps> = ({
  profile,
  isEditing,
  formData,
  onFormDataChange
}) => {
  const venueTypes = [
    'theatre', 'bar', 'cafe', 'salle-spectacle', 'plein-air', 'festival'
  ];

  const handleVenueTypeChange = (venue: string, checked: boolean) => {
    const currentVenues = formData.venueTypes || [];
    const newVenues = checked 
      ? [...currentVenues, venue]
      : currentVenues.filter(v => v !== venue);
    onFormDataChange({ venueTypes: newVenues });
  };

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Star className="w-5 h-5 mr-2" />
        Profil organisateur
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          {isEditing ? (
            <Textarea
              value={formData.description || ''}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Décris ton entreprise..."
              rows={4}
            />
          ) : (
            <p className="text-white">{profile.description || 'Aucune description définie'}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Site web</label>
          {isEditing ? (
            <Input
              value={formData.website || ''}
              onChange={(e) => onFormDataChange({ website: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="https://votre-site.com"
            />
          ) : (
            <p className="text-white">{profile.website || 'Non défini'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Types de lieux</label>
          {isEditing ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {venueTypes.map(venue => (
                <label key={venue} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.venueTypes?.includes(venue) || false}
                    onChange={(e) => handleVenueTypeChange(venue, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-300 capitalize">{venue}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.venueTypes?.map(venue => (
                <Badge key={venue} variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {venue}
                </Badge>
              )) || <span className="text-gray-400">Aucun type défini</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OrganisateurProfileCard;
