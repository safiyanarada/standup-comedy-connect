import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  calculateDistanceKm, 
  getCityCoordinates, 
  calculateDistanceToCity, 
  Coordinates 
} from '@/lib/geolocation';

// Types pour les événements
export interface Event {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  coordinates?: Coordinates; // Nouvelles coordonnées GPS
  date: string;
  startTime: string;
  endTime: string;
  fee: number;
  maxPerformers: number;
  status: 'draft' | 'published' | 'full' | 'completed' | 'cancelled';
  requirements: string;
  eventType: 'open-mic' | 'show' | 'private' | 'festival';
  applications: Application[];
  createdAt: string;
}

// Types pour les candidatures
export interface Application {
  id: string;
  eventId: string;
  humoristId: string;
  humoristName: string;
  stageName?: string;
  message: string;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected';
  appliedAt: string;
  respondedAt?: string;
}

// Types pour les messages
export interface Message {
  id: string;
  fromId: string;
  toId: string;
  eventId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Types pour les notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'new_event' | 'application_received' | 'application_response' | 'message' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string; // Event ID ou Application ID
}

interface DataContextType {
  // Events
  events: Event[];
  createEvent: (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'applications' | 'createdAt'>) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  getEventsByOrganizer: (organizerId: string) => Event[];
  getAvailableEvents: (humoristId: string, city?: string) => Event[];
  getEventById: (eventId: string) => Event | undefined;
  
  // Applications
  applications: Application[];
  applyToEvent: (eventId: string, message: string) => void;
  respondToApplication: (applicationId: string, status: 'accepted' | 'rejected') => void;
  updateApplicationStatus: (applicationId: string, status: 'accepted' | 'rejected') => void;
  getApplicationsByEvent: (eventId: string) => Application[];
  getApplicationsByHumorist: (humoristId: string) => Application[];
  
  // Messages
  messages: Message[];
  sendMessage: (toId: string, content: string, eventId?: string) => void;
  markMessageAsRead: (messageId: string) => void;
  getConversation: (userId1: string, userId2: string, eventId?: string) => Message[];
  
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  getUnreadNotifications: (userId: string) => Notification[];
  
  // Users
  getUserById: (userId: string) => any;
  
  // Stats
  getOrganizerStats: (organizerId: string) => {
    totalEvents: number;
    totalApplications: number;
    averageResponseTime: number;
    completedEvents: number;
    companyName?: string;
  };
  getHumoristeStats: (humoristId: string) => {
    totalApplications: number;
    acceptedApplications: number;
    completedShows: number;
    averageRating: number;
  };

  // Fonction de debug utile
  debugInfo: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

// Mock users data for getUserById
const mockUsers = [
  {
    id: '1',
    email: 'demo@standup.com',
    firstName: 'Demo',
    lastName: 'User',
    userType: 'humoriste',
    profile: {
      stageName: 'Demo Comic',
      city: 'Paris',
      coordinates: getCityCoordinates('Paris'), // Coordonnées GPS de Paris
      bio: 'Humoriste passionné de stand-up !',
      mobilityZone: 50,
      experienceLevel: 'intermediaire',
      socialLinks: {
        instagram: '@democomic',
        tiktok: '@democomic'
      },
      genres: ['observationnel', 'stand-up'],
      availability: {
        weekdays: true,
        weekends: true,
        evenings: true
      }
    }
  },
  {
    id: '2', // ID organisateur correspondant à AuthContext
    email: 'org@standup.com',
    firstName: 'Sophie',
    lastName: 'Martin',
    userType: 'organisateur',
    profile: {
      companyName: 'Comedy Club Paris',
      city: 'Paris',
      coordinates: getCityCoordinates('Paris'),
      description: 'Le meilleur club de comédie de Paris. Nous organisons des soirées stand-up 3 fois par semaine.',
      website: 'https://comedyclubparis.fr',
      phone: '01 42 85 23 37',
      venueAddress: '42 Boulevard de Bonne-Nouvelle',
      venuePostalCode: '75010',
      venueTypes: ['club', 'theatre'],
      averageBudget: {
        min: 50,
        max: 200
      },
      eventFrequency: 'weekly'
    }
  },
  // Nouveaux humoristes mockés pour les candidatures
  {
    id: 'humor2',
    email: 'julie@standup.com',
    firstName: 'Julie',
    lastName: 'Blague',
    userType: 'humoriste',
    profile: {
      stageName: 'Julie B.',
      city: 'Paris',
      coordinates: getCityCoordinates('Paris'),
      bio: 'Humoriste débutante avec une passion pour l\'auto-dérision !',
      mobilityZone: 30,
      experienceLevel: 'debutant',
      socialLinks: {
        instagram: '@julieb_comedy'
      },
      genres: ['observationnel', 'auto-derision'],
      availability: {
        weekdays: false,
        weekends: true,
        evenings: true
      }
    }
  },
  {
    id: 'humor3',
    email: 'pierre@standup.com',
    firstName: 'Pierre',
    lastName: 'Rigolade',
    userType: 'humoriste',
    profile: {
      stageName: 'Pierre R.',
      city: 'Paris',
      coordinates: getCityCoordinates('Paris'),
      bio: 'Spécialiste de l\'humour familial et des spectacles de Noël !',
      mobilityZone: 100,
      experienceLevel: 'confirme',
      socialLinks: {
        instagram: '@pierre_rigolade',
        website: 'https://pierre-rigolade.fr'
      },
      genres: ['familial', 'observationnel', 'situationnel'],
      availability: {
        weekdays: true,
        weekends: true,
        evenings: true
      }
    }
  },
  {
    id: 'humor4',
    email: 'sophie@standup.com',
    firstName: 'Sophie',
    lastName: 'Délire',
    userType: 'humoriste',
    profile: {
      stageName: 'Sophie D.',
      city: 'Paris',
      coordinates: getCityCoordinates('Paris'),
      bio: 'Humour provocateur mais respectueux, spécialiste des sujets de société !',
      mobilityZone: 75,
      experienceLevel: 'confirme',
      socialLinks: {
        instagram: '@sophie_delire',
        tiktok: '@sophiedelire'
      },
      genres: ['provocateur', 'societal', 'politique'],
      availability: {
        weekdays: true,
        weekends: true,
        evenings: true
      }
    }
  },
  {
    id: 'org1',
    email: 'org@standup.com',
    firstName: 'Comedy',
    lastName: 'Club',
    userType: 'organisateur',
    profile: {
      companyName: 'Comedy Club Paris',
      city: 'Paris',
      description: 'Le meilleur club de comédie de Paris',
      website: 'https://comedy-club-paris.fr',
      phone: '01 42 85 23 37',
      venueAddress: '42 Boulevard de Bonne-Nouvelle',
      venuePostalCode: '75010',
      venueTypes: ['theatre', 'bar'],
      eventFrequency: 'weekly',
      averageBudget: {
        min: 50,
        max: 200
      }
    }
  },
  {
    id: 'org2',
    email: 'cafe@comedie.com',
    firstName: 'Café',
    lastName: 'Comédie',
    userType: 'organisateur',
    profile: {
      companyName: 'Café de la Comédie',
      city: 'Paris',
      description: 'Café-théâtre convivial au cœur de Paris',
      website: 'https://cafe-comedie.fr',
      phone: '01 43 57 89 90',
      venueAddress: '41 Boulevard du Temple',
      venuePostalCode: '75011',
      venueTypes: ['cafe'],
      eventFrequency: 'monthly',
      averageBudget: {
        min: 30,
        max: 100
      }
    }
  },
  {
    id: 'org3',
    email: 'lyon@comedy.com',
    firstName: 'Stand-up',
    lastName: 'Lyon',
    userType: 'organisateur',
    profile: {
      companyName: 'Stand-up Lyon',
      city: 'Lyon',
      description: 'La référence du stand-up à Lyon depuis 2015',
      website: 'https://standup-lyon.fr',
      phone: '04 78 92 45 13',
      venueAddress: '12 Rue Gaspard André',
      venuePostalCode: '69002',
      venueTypes: ['theatre', 'club'],
      eventFrequency: 'weekly',
      averageBudget: {
        min: 60,
        max: 180
      }
    }
  },
  {
    id: 'org4',
    email: 'marseille@humour.com',
    firstName: 'Humour',
    lastName: 'Marseille',
    userType: 'organisateur',
    profile: {
      companyName: 'Festival Humour Marseille',
      city: 'Marseille',
      description: 'Organisateur du plus grand festival d\'humour du Sud',
      website: 'https://humour-marseille.fr',
      phone: '04 91 33 85 92',
      venueAddress: 'Avenue du Prado',
      venuePostalCode: '13008',
      venueTypes: ['festival', 'theatre'],
      eventFrequency: 'occasional',
      averageBudget: {
        min: 100,
        max: 500
      }
    }
  }
];

// Données mockées pour la démo avec coordonnées GPS
const mockEvents: Event[] = [
  {
    id: '1',
    organizerId: 'org1',
    organizerName: 'Comedy Club Paris',
    title: 'Soirée Open Mic du Jeudi',
    description: 'Venez tester vos nouveaux textes dans une ambiance détendue !',
    venue: 'Le Petit Théâtre',
    address: '15 rue de la Gaîté',
    city: 'Paris',
    coordinates: getCityCoordinates('Paris'),
    date: '2024-12-05',
    startTime: '20:00',
    endTime: '22:30',
    fee: 50,
    maxPerformers: 8,
    status: 'published',
    requirements: 'Maximum 7 minutes par passage',
    eventType: 'open-mic',
    applications: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    organizerId: '2', // ID de l'organisateur test qui correspond à org@standup.com
    organizerName: 'Café de la Comédie',
    title: 'Spectacle de Noël',
    description: 'Spectacle spécial pour les fêtes de fin d\'année',
    venue: 'Café de la Comédie',
    address: '32 boulevard Saint-Germain',
    city: 'Paris',
    coordinates: getCityCoordinates('Paris'),
    date: '2024-12-20',
    startTime: '19:30',
    endTime: '21:30',
    fee: 150,
    maxPerformers: 5,
    status: 'published',
    requirements: 'Spectacle familial, pas de contenu explicite',
    eventType: 'show',
    applications: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '2bis',
    organizerId: '2', // ID de l'organisateur test
    organizerName: 'Café de la Comédie',
    title: 'Soirée Stand-up du Vendredi',
    description: 'Soirée stand-up avec 6 humoristes confirmés',
    venue: 'Café de la Comédie',
    address: '32 boulevard Saint-Germain',
    city: 'Paris',
    coordinates: getCityCoordinates('Paris'),
    date: '2024-12-13',
    startTime: '20:30',
    endTime: '22:00',
    fee: 80,
    maxPerformers: 6,
    status: 'published',
    requirements: '10 minutes par humoriste',
    eventType: 'show',
    applications: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '2ter',
    organizerId: '2', // ID de l'organisateur test
    organizerName: 'Café de la Comédie',
    title: 'Open Mic du Mercredi',
    description: 'Scène ouverte tous les mercredis pour découvrir de nouveaux talents',
    venue: 'Café de la Comédie',
    address: '32 boulevard Saint-Germain',
    city: 'Paris',
    coordinates: getCityCoordinates('Paris'),
    date: '2024-12-11',
    startTime: '19:00',
    endTime: '21:00',
    fee: 40,
    maxPerformers: 10,
    status: 'published',
    requirements: '5 minutes par passage, tous niveaux acceptés',
    eventType: 'open-mic',
    applications: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    organizerId: 'org3',
    organizerName: 'Stand-up Lyon',
    title: 'Stand-up Lyon - Soirée découverte',
    description: 'Une soirée pour découvrir les nouveaux talents lyonnais !',
    venue: 'Le Rire Lyonnais',
    address: '45 rue de la République',
    city: 'Lyon',
    coordinates: getCityCoordinates('Lyon'),
    date: '2024-12-10',
    startTime: '20:30',
    endTime: '22:30',
    fee: 75,
    maxPerformers: 6,
    status: 'published',
    requirements: '8 minutes maximum, tous styles acceptés',
    eventType: 'open-mic',
    applications: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    organizerId: 'org4',
    organizerName: 'Festival Marseille Comedy',
    title: 'Festival d\'humour Marseillais',
    description: 'Grande soirée du festival avec les meilleurs humoristes du Sud !',
    venue: 'Palais de la Culture',
    address: 'Avenue du Prado',
    city: 'Marseille',
    coordinates: getCityCoordinates('Marseille'),
    date: '2024-12-15',
    startTime: '19:00',
    endTime: '23:00',
    fee: 200,
    maxPerformers: 8,
    status: 'published',
    requirements: 'Humoristes expérimentés, 12 minutes par passage',
    eventType: 'festival',
    applications: [],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    organizerId: 'org5',
    organizerName: 'Bar Comedy Toulouse',
    title: 'Open Mic Toulousain',
    description: 'Ambiance décontractée dans le bar le plus sympa de Toulouse !',
    venue: 'Le Bar à Rire',
    address: 'Place du Capitole',
    city: 'Toulouse',
    coordinates: getCityCoordinates('Toulouse'),
    date: '2024-12-12',
    startTime: '21:00',
    endTime: '23:30',
    fee: 60,
    maxPerformers: 10,
    status: 'published',
    requirements: '6 minutes par humoriste, ambiance bar',
    eventType: 'open-mic',
    applications: [],
    createdAt: new Date().toISOString()
  }
];

const mockApplications: Application[] = [
  // Vide au départ - les candidatures seront ajoutées quand les humoristes candidatent
];

// Ajouter des messages mockés pour la démo
const MOCK_MESSAGES: Message[] = [
  // Conversations pour Demo User (humoriste) avec organisateurs
  {
    id: '1',
    fromId: '1', // Demo User (humoriste)
    toId: 'org1', // Comedy Club Paris (organisateur)
    content: 'Bonjour ! Je suis très intéressé par vos soirées open mic. Pouvez-vous me donner plus de détails ?',
    timestamp: '2024-01-15T18:30:00Z',
    read: true,
    eventId: '1'
  },
  {
    id: '2',
    fromId: 'org1', // Comedy Club Paris (organisateur)
    toId: '1', // Demo User (humoriste)
    content: 'Bonjour Demo ! Ravi de votre intérêt. C\'est une soirée avec 8 humoristes, 7 min chacun. Cachet de 50€. Ça vous intéresse ?',
    timestamp: '2024-01-15T19:15:00Z',
    read: true,
    eventId: '1'
  },
  {
    id: '3',
    fromId: '1', // Demo User (humoriste)
    toId: 'org1', // Comedy Club Paris (organisateur)
    content: 'Parfait ! Je postule officiellement. Voici mon numéro : 06 12 34 56 78. À bientôt !',
    timestamp: '2024-01-15T19:45:00Z',
    read: false,
    eventId: '1'
  },
  // Conversation avec Café de la Comédie
  {
    id: '4',
    fromId: 'org2', // Café de la Comédie (organisateur)
    toId: '1', // Demo User (humoriste)
    content: 'Bonjour Demo ! Nous avons vu votre profil et souhaitons vous proposer notre spectacle de Noël. Intéressé ?',
    timestamp: '2024-01-16T10:00:00Z',
    read: false,
    eventId: '2'
  },
  {
    id: '5',
    fromId: '1', // Demo User (humoriste)
    toId: 'org2', // Café de la Comédie (organisateur)
    content: 'Merci pour cette proposition ! Le spectacle de Noël m\'intéresse beaucoup. Quels sont les détails ?',
    timestamp: '2024-01-16T10:30:00Z',
    read: true,
    eventId: '2'
  },
  // Conversation avec Stand-up Lyon
  {
    id: '6',
    fromId: '1', // Demo User (humoriste)
    toId: 'org3', // Stand-up Lyon (organisateur)
    content: 'Salut ! Votre soirée découverte à Lyon me tente bien. C\'est dans mes cordes !',
    timestamp: '2024-01-14T16:20:00Z',
    read: true,
    eventId: '3'
  },
  {
    id: '7',
    fromId: 'org3', // Stand-up Lyon (organisateur)
    toId: '1', // Demo User (humoriste)
    content: 'Hello Demo ! Ton profil nous plaît. On peut te proposer 8 min en deuxième partie. Tu es dispo le 10 décembre ?',
    timestamp: '2024-01-14T17:30:00Z',
    read: true,
    eventId: '3'
  },
  {
    id: '8',
    fromId: '1', // Demo User (humoriste)
    toId: 'org3', // Stand-up Lyon (organisateur)
    content: 'Génial ! Je suis libre ce soir-là. On peut fixer les détails techniques ?',
    timestamp: '2024-01-14T18:00:00Z',
    read: false,
    eventId: '3'
  },
  // Messages généraux de networking
  {
    id: '9',
    fromId: 'org1', // Comedy Club Paris (organisateur)
    toId: '1', // Demo User (humoriste)
    content: 'Au fait Demo, on organise aussi des ateliers d\'écriture tous les mardis. Ça pourrait t\'intéresser ?',
    timestamp: '2024-01-16T14:30:00Z',
    read: false
  },
  {
    id: '10',
    fromId: '1', // Demo User (humoriste)
    toId: 'org1', // Comedy Club Paris (organisateur)
    content: 'Oh oui ! J\'adore travailler l\'écriture. Vous avez des places disponibles ?',
    timestamp: '2024-01-16T15:00:00Z',
    read: false
  },
  // Conversation avec Festival Marseille
  {
    id: '11',
    fromId: 'org4', // Festival Marseille (organisateur)
    toId: '1', // Demo User (humoriste)
    content: 'Bonjour Demo ! Nous recrutons pour notre festival. Votre style observationnel pourrait bien coller !',
    timestamp: '2024-01-17T11:00:00Z',
    read: false,
    eventId: '4'
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Get event by ID
  const getEventById = (eventId: string): Event | undefined => {
    return events.find(event => event.id === eventId);
  };

  // Get user by ID
  const getUserById = (userId: string) => {
    return mockUsers.find(user => user.id === userId);
  };

  // Créer un événement
  const createEvent = (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'applications' | 'createdAt'>) => {
    console.log('🎪 CREATE EVENT - Début fonction createEvent');
    console.log('👤 User actuel:', user);
    console.log('📝 Données événement reçues:', eventData);
    
    if (!user || user.userType !== 'organisateur') {
      console.log('❌ Utilisateur non autorisé:', user?.userType);
      return;
    }
    
    const organizer = getUserById(user.id);
    console.log('🔍 Organisateur trouvé via getUserById:', organizer);
    
    const organizerName = organizer?.userType === 'organisateur' && 'companyName' in organizer.profile 
      ? organizer.profile.companyName || `${organizer.firstName} ${organizer.lastName}`
      : `${user.firstName} ${user.lastName}`;
    
    console.log('🏢 Nom organisateur calculé:', organizerName);
    
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}`,
      organizerId: user.id,
      organizerName,
      status: eventData.status || 'published', // Par défaut publié
      applications: [],
      createdAt: new Date().toISOString()
    };
    
    console.log('✨ Nouvel événement créé:', newEvent);
    
    setEvents(prev => {
      console.log('📋 Événements avant ajout:', prev.length);
      const newEvents = [newEvent, ...prev];
      console.log('📋 Événements après ajout:', newEvents.length);
      console.log('🎯 Premier événement dans la liste:', newEvents[0]);
      return newEvents;
    });
    
    // Créer une notification pour les humoristes de la zone
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      userId: 'all_humoristes', // Pour tous les humoristes
      type: 'new_event',
      title: 'Nouvel événement disponible !',
      message: `${newEvent.title} - ${newEvent.city}`,
      read: false,
      createdAt: new Date().toISOString(),
      relatedId: newEvent.id
    };
    
    setNotifications(prev => [notification, ...prev]);
    console.log('✅ CREATE EVENT - Fonction terminée avec succès');
  };

  // Candidater à un événement
  const applyToEvent = (eventId: string, message: string) => {
    if (!user || user.userType !== 'humoriste') return;
    
    const stageName = user.userType === 'humoriste' && 'stageName' in user.profile 
      ? user.profile.stageName 
      : undefined;
    
    const newApplication: Application = {
      id: `app_${Date.now()}`,
      eventId,
      humoristId: user.id,
      humoristName: `${user.firstName} ${user.lastName}`,
      stageName,
      message,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    
    setApplications(prev => [newApplication, ...prev]);
    
    // Mettre à jour l'événement
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, applications: [...event.applications, newApplication] }
        : event
    ));
    
    // Créer notification pour l'organisateur
    const event = events.find(e => e.id === eventId);
    if (event) {
      const notification: Notification = {
        id: `notif_${Date.now()}`,
        userId: event.organizerId,
        type: 'application_received',
        title: 'Nouvelle candidature !',
        message: `${user.firstName} ${user.lastName} a candidaté pour "${event.title}"`,
        read: false,
        createdAt: new Date().toISOString(),
        relatedId: newApplication.id
      };
      
      setNotifications(prev => [notification, ...prev]);
    }
  };

  // Répondre à une candidature
  const respondToApplication = (applicationId: string, status: 'accepted' | 'rejected') => {
    updateApplicationStatus(applicationId, status);
  };

  // Update application status
  const updateApplicationStatus = (applicationId: string, status: 'accepted' | 'rejected') => {
    setApplications(prev => prev.map(app => 
      app.id === applicationId 
        ? { ...app, status, respondedAt: new Date().toISOString() }
        : app
    ));
    
    // Mettre à jour l'événement
    setEvents(prev => prev.map(event => ({
      ...event,
      applications: event.applications.map(app =>
        app.id === applicationId 
          ? { ...app, status, respondedAt: new Date().toISOString() }
          : app
      )
    })));
    
    // Créer notification pour l'humoriste
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      const notification: Notification = {
        id: `notif_${Date.now()}`,
        userId: application.humoristId,
        type: 'application_response',
        title: status === 'accepted' ? 'Candidature acceptée !' : 'Candidature refusée',
        message: status === 'accepted' 
          ? 'Félicitations ! Votre candidature a été acceptée.'
          : 'Votre candidature n\'a pas été retenue cette fois.',
        read: false,
        createdAt: new Date().toISOString(),
        relatedId: applicationId
      };
      
      setNotifications(prev => [notification, ...prev]);
    }
  };

  // Fonctions utilitaires
  const getEventsByOrganizer = (organizerId: string) => {
    console.log('🔍 GET EVENTS BY ORGANIZER - Recherche pour ID:', organizerId);
    console.log('📋 Tous les événements disponibles:', events.length);
    console.log('🎪 Liste des événements avec leurs organizerId:');
    events.forEach(event => {
      console.log(`  - ${event.title}: organizerId="${event.organizerId}"`);
    });
    
    const organizerEvents = events.filter(event => event.organizerId === organizerId);
    console.log(`✅ Événements trouvés pour organisateur ${organizerId}:`, organizerEvents.length);
    organizerEvents.forEach(event => {
      console.log(`  ✓ ${event.title} (${event.id})`);
    });
    
    return organizerEvents;
  };

  const getAvailableEvents = (humoristId: string, city?: string) => {
    const humoriste = getUserById(humoristId);
    const humoristeProfile = humoriste?.profile;
    
    console.log('🔍 FILTRAGE ÉVÉNEMENTS - Humoriste:', humoristId);
    console.log('👤 Profil humoriste:', humoristeProfile);
    console.log('📍 Total événements disponibles:', events.length);
    
    const availableEvents = events.filter(event => {
      console.log(`\n🎪 === ANALYSE ${event.title} ===`);
      console.log(`📊 Status: ${event.status}`);
      console.log(`👤 Organisateur: ${event.organizerId}`);
      console.log(`📍 Ville: ${event.city}`);
      console.log(`🗓️ Date: ${event.date}`);
      
      // Règle 1: L'événement doit être publié
      if (event.status !== 'published') {
        console.log('❌ REJETÉ - Événement pas publié');
        return false;
      }
      
      // Règle 2: L'humoriste ne doit pas avoir déjà candidaté
      const alreadyApplied = applications.some(app => app.eventId === event.id && app.humoristId === humoristId);
      if (alreadyApplied) {
        console.log('❌ REJETÉ - Déjà candidaté');
        return false;
      }
      
      // Règle 3: Filtrage géographique simplifié
      if (humoristeProfile && 'mobilityZone' in humoristeProfile && humoristeProfile.mobilityZone) {
        // Si même ville, toujours OK
        if (humoristeProfile.city === event.city) {
          console.log('✅ ACCEPTÉ - Même ville');
          return true;
        }
        
        // Calcul de distance si possible
        let distance = null;
        
        if (humoristeProfile.coordinates && event.coordinates) {
          distance = calculateDistanceKm(humoristeProfile.coordinates, event.coordinates);
          console.log(`📏 Distance GPS: ${distance.toFixed(1)}km / Zone: ${humoristeProfile.mobilityZone}km`);
        } else if (humoristeProfile.city && event.city) {
          const userCoords = getCityCoordinates(humoristeProfile.city);
          const eventCoords = getCityCoordinates(event.city);
          if (userCoords && eventCoords) {
            distance = calculateDistanceKm(userCoords, eventCoords);
            console.log(`📏 Distance villes: ${distance.toFixed(1)}km / Zone: ${humoristeProfile.mobilityZone}km`);
          }
        }
        
        // Si on a pu calculer la distance
        if (distance !== null) {
          if (distance <= humoristeProfile.mobilityZone) {
            console.log('✅ ACCEPTÉ - Dans la zone de mobilité');
            return true;
          } else {
            console.log('❌ REJETÉ - Hors zone de mobilité');
            return false;
          }
        } else {
          // Si on ne peut pas calculer la distance, on accepte l'événement
          console.log('⚠️ ACCEPTÉ - Distance incalculable, événement inclus par défaut');
          return true;
        }
      } else {
        // Pas de profil de mobilité, on accepte tous les événements
        console.log('⚠️ ACCEPTÉ - Pas de zone de mobilité définie');
        return true;
      }
    });
    
    console.log(`\n🎯 RÉSULTAT FINAL: ${availableEvents.length} événements disponibles`);
    availableEvents.forEach(event => {
      console.log(`  ✅ ${event.title} (${event.city})`);
    });
    
    return availableEvents;
  };

  const getApplicationsByEvent = (eventId: string) =>
    applications.filter(app => app.eventId === eventId);

  const getApplicationsByHumorist = (humoristId: string) =>
    applications.filter(app => app.humoristId === humoristId);

  const sendMessage = (toId: string, content: string, eventId?: string) => {
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      fromId: user.id,
      toId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      eventId
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const getConversation = (userId1: string, userId2: string, eventId?: string) => {
    return messages
      .filter(msg => 
        ((msg.fromId === userId1 && msg.toId === userId2) || 
         (msg.fromId === userId2 && msg.toId === userId1)) &&
        (!eventId || msg.eventId === eventId)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const getUnreadNotifications = (userId: string) =>
    notifications.filter(notif => 
      (notif.userId === userId || notif.userId === 'all_humoristes') && 
      !notif.read
    );

  // Stats
  const getOrganizerStats = (organizerId: string) => {
    const organizerEvents = events.filter(event => event.organizerId === organizerId);
    const organizer = getUserById(organizerId);
    
    return {
      totalEvents: organizerEvents.length,
      totalApplications: organizerEvents.reduce((sum, event) => sum + event.applications.length, 0),
      completedEvents: organizerEvents.filter(event => event.status === 'completed').length,
      averageResponseTime: 2,
      companyName: organizer?.userType === 'organisateur' && 'companyName' in organizer.profile ? organizer.profile.companyName : undefined
    };
  };

  const getHumoristeStats = (humoristId: string) => {
    const humoristeApplications = getApplicationsByHumorist(humoristId);
    const acceptedApplications = humoristeApplications.filter(app => app.status === 'accepted');
    
    return {
      totalApplications: humoristeApplications.length,
      acceptedApplications: acceptedApplications.length,
      completedShows: acceptedApplications.length, // Simplifié pour la démo
      averageRating: 4.7 // Mockée
    };
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  // Fonction de debug utile
  const debugInfo = () => {
    console.log('\n🔧 === DEBUG INFO ===');
    console.log('📋 Total événements:', events.length);
    events.forEach(event => {
      console.log(`  🎪 ${event.title} - Organisateur: ${event.organizerId} - Status: ${event.status}`);
    });
    console.log('\n👥 Utilisateurs disponibles:');
    mockUsers.forEach(user => {
      console.log(`  👤 ${user.firstName} ${user.lastName} (ID: ${user.id}) - Type: ${user.userType}`);
    });
    console.log('\n👤 Utilisateur connecté:', user ? `${user.firstName} ${user.lastName} (ID: ${user.id})` : 'Aucun');
  };

  const value: DataContextType = {
    events,
    createEvent,
    updateEvent,
    getEventsByOrganizer,
    getAvailableEvents,
    getEventById,
    applications,
    applyToEvent,
    respondToApplication,
    updateApplicationStatus,
    getApplicationsByEvent,
    getApplicationsByHumorist,
    messages,
    sendMessage,
    markMessageAsRead,
    getConversation,
    notifications,
    markNotificationAsRead,
    getUnreadNotifications,
    getUserById,
    getOrganizerStats,
    getHumoristeStats,
    debugInfo
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
