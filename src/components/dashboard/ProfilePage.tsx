
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Star, Calendar, Edit, Save, Camera, Instagram, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { HumoristeProfile, OrganisateurProfile } from '@/types/auth';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user?.profile || {});
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  // Type guards
  const isHumoriste = user.userType === 'humoriste';
  const isOrganisateur = user.userType === 'organisateur';
  const humoristeProfile = isHumoriste ? user.profile as HumoristeProfile : null;
  const organisateurProfile = isOrganisateur ? user.profile as OrganisateurProfile : null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const genres = [
    'observationnel', 'stand-up', 'impro', 'sketch', 'parodie', 
    'politique', 'famille', 'absurde', 'noir', 'musical'
  ];

  const cities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 
    'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'
  ];

  const venueTypes = [
    'theatre', 'bar', 'cafe', 'salle-spectacle', 'plein-air', 'festival'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Mon Profil</h1>
          <p className="text-gray-400">Gère tes informations et préférences</p>
        </div>
        
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isLoading}
          className={isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-pink-500 hover:bg-pink-600'}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="xl:col-span-2 space-y-6">
          {/* Informations de base */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informations personnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prénom</label>
                {isEditing ? (
                  <Input
                    value={user.firstName}
                    className="bg-gray-700 border-gray-600 text-white"
                    disabled
                  />
                ) : (
                  <p className="text-white">{user.firstName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                {isEditing ? (
                  <Input
                    value={user.lastName}
                    className="bg-gray-700 border-gray-600 text-white"
                    disabled
                  />
                ) : (
                  <p className="text-white">{user.lastName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <p className="text-gray-400">{user.email}</p>
              </div>
              
              {isHumoriste && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom de scène</label>
                  {isEditing ? (
                    <Input
                      value={(formData as HumoristeProfile).stageName || ''}
                      onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Ton nom d'artiste"
                    />
                  ) : (
                    <p className="text-white">{humoristeProfile?.stageName || 'Non défini'}</p>
                  )}
                </div>
              )}

              {isOrganisateur && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l'entreprise</label>
                  {isEditing ? (
                    <Input
                      value={(formData as OrganisateurProfile).companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Nom de votre entreprise"
                    />
                  ) : (
                    <p className="text-white">{organisateurProfile?.companyName || 'Non défini'}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Profil spécifique */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              {isHumoriste ? 'Profil artistique' : 'Profil organisateur'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isHumoriste ? 'Bio' : 'Description'}
                </label>
                {isEditing ? (
                  <Textarea
                    value={isHumoriste ? (formData as HumoristeProfile).bio || '' : (formData as OrganisateurProfile).description || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [isHumoriste ? 'bio' : 'description']: e.target.value 
                    })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder={isHumoriste ? "Raconte-nous ton univers..." : "Décris ton entreprise..."}
                    rows={4}
                  />
                ) : (
                  <p className="text-white">
                    {isHumoriste 
                      ? humoristeProfile?.bio || 'Aucune bio définie'
                      : organisateurProfile?.description || 'Aucune description définie'
                    }
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
                  {isEditing ? (
                    <Select 
                      value={formData.city || ''} 
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Sélectionne ta ville" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-white">{user.profile.city}</p>
                  )}
                </div>
                
                {isHumoriste && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Zone de mobilité (km)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={(formData as HumoristeProfile).mobilityZone || 30}
                        onChange={(e) => setFormData({ ...formData, mobilityZone: Number(e.target.value) })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    ) : (
                      <p className="text-white">{humoristeProfile?.mobilityZone} km</p>
                    )}
                  </div>
                )}

                {isOrganisateur && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Site web</label>
                    {isEditing ? (
                      <Input
                        value={(formData as OrganisateurProfile).website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="https://votre-site.com"
                      />
                    ) : (
                      <p className="text-white">{organisateurProfile?.website || 'Non défini'}</p>
                    )}
                  </div>
                )}
              </div>
              
              {isHumoriste && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Niveau d'expérience</label>
                    {isEditing ? (
                      <Select 
                        value={(formData as HumoristeProfile).experienceLevel || ''} 
                        onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="debutant">Débutant</SelectItem>
                          <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-white capitalize">{humoristeProfile?.experienceLevel}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Genres pratiqués</label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {genres.map(genre => (
                          <label key={genre} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={(formData as HumoristeProfile).genres?.includes(genre) || false}
                              onChange={(e) => {
                                const currentGenres = (formData as HumoristeProfile).genres || [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, genres: [...currentGenres, genre] });
                                } else {
                                  setFormData({ ...formData, genres: currentGenres.filter(g => g !== genre) });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-gray-300 capitalize">{genre}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {humoristeProfile?.genres?.map(genre => (
                          <Badge key={genre} variant="secondary" className="bg-pink-500/20 text-pink-400">
                            {genre}
                          </Badge>
                        )) || <span className="text-gray-400">Aucun genre défini</span>}
                      </div>
                    )}
                  </div>
                </>
              )}

              {isOrganisateur && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Types de lieux</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {venueTypes.map(venue => (
                        <label key={venue} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={(formData as OrganisateurProfile).venueTypes?.includes(venue) || false}
                            onChange={(e) => {
                              const currentVenues = (formData as OrganisateurProfile).venueTypes || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, venueTypes: [...currentVenues, venue] });
                              } else {
                                setFormData({ ...formData, venueTypes: currentVenues.filter(v => v !== venue) });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-gray-300 capitalize">{venue}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {organisateurProfile?.venueTypes?.map(venue => (
                        <Badge key={venue} variant="secondary" className="bg-blue-500/20 text-blue-400">
                          {venue}
                        </Badge>
                      )) || <span className="text-gray-400">Aucun type défini</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Disponibilités (humoristes uniquement) */}
          {isHumoriste && (
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Disponibilités
              </h2>
              
              <div className="space-y-4">
                {[
                  { key: 'weekdays', label: 'Semaine (Lun-Ven)' },
                  { key: 'weekends', label: 'Week-ends' },
                  { key: 'evenings', label: 'Soirées' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-white">{label}</span>
                    {isEditing ? (
                      <Switch
                        checked={((formData as HumoristeProfile).availability?.[key as keyof HumoristeProfile['availability']]) || false}
                        onCheckedChange={(checked) => 
                          setFormData({
                            ...formData,
                            availability: { ...(formData as HumoristeProfile).availability, [key]: checked }
                          })
                        }
                      />
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        humoristeProfile?.availability?.[key as keyof HumoristeProfile['availability']]
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {humoristeProfile?.availability?.[key as keyof HumoristeProfile['availability']] ? 'Disponible' : 'Non disponible'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo de profil */}
          <Card className="p-6 bg-gray-800/50 border-gray-700 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-gray-700 text-white text-2xl">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full hover:bg-pink-600 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white">
              {isHumoriste 
                ? humoristeProfile?.stageName || `${user.firstName} ${user.lastName}`
                : organisateurProfile?.companyName || `${user.firstName} ${user.lastName}`
              }
            </h3>
            <p className="text-gray-400 capitalize">
              {isHumoriste ? humoristeProfile?.experienceLevel : 'Organisateur'}
            </p>
            
            {isHumoriste && humoristeProfile?.socialLinks && (
              <div className="flex justify-center space-x-3 mt-4">
                {humoristeProfile.socialLinks.instagram && (
                  <a href="#" className="text-pink-400 hover:text-pink-300">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {humoristeProfile.socialLinks.tiktok && (
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    <MessageSquare className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </Card>

          {/* Réseaux sociaux (humoristes uniquement) */}
          {isHumoriste && (
            <Card className="p-6 bg-gray-800/50 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Réseaux sociaux</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                  {isEditing ? (
                    <Input
                      value={(formData as HumoristeProfile).socialLinks?.instagram || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...(formData as HumoristeProfile).socialLinks, instagram: e.target.value }
                      })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="@username"
                    />
                  ) : (
                    <p className="text-gray-400">{humoristeProfile?.socialLinks?.instagram || 'Non défini'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">TikTok</label>
                  {isEditing ? (
                    <Input
                      value={(formData as HumoristeProfile).socialLinks?.tiktok || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...(formData as HumoristeProfile).socialLinks, tiktok: e.target.value }
                      })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="@username"
                    />
                  ) : (
                    <p className="text-gray-400">{humoristeProfile?.socialLinks?.tiktok || 'Non défini'}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Statistiques rapides */}
          <Card className="p-6 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Stats rapides</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {isHumoriste ? 'Spectacles' : 'Événements créés'}
                </span>
                <span className="text-white font-semibold">{user.stats?.totalEvents || 0}</span>
              </div>
              {isHumoriste && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Score viral</span>
                    <span className="text-yellow-400 font-semibold">{user.stats?.viralScore || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Note moyenne</span>
                    <span className="text-green-400 font-semibold">{user.stats?.averageRating || 0}/5</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Vues profil</span>
                <span className="text-blue-400 font-semibold">{user.stats?.profileViews || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
