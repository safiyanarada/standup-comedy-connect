
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  
  // Applications
  applications: Application[];
  applyToEvent: (eventId: string, message: string) => void;
  respondToApplication: (applicationId: string, status: 'accepted' | 'rejected') => void;
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
  
  // Stats
  getOrganizerStats: (organizerId: string) => {
    totalEvents: number;
    totalApplications: number;
    averageResponseTime: number;
    completedEvents: number;
  };
  getHumoristeStats: (humoristId: string) => {
    totalApplications: number;
    acceptedApplications: number;
    completedShows: number;
    averageRating: number;
  };
}

const DataContext = createContext<DataContextType | null>(null);

// Données mockées pour la démo
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
    organizerId: 'org2',
    organizerName: 'Café de la Comédie',
    title: 'Spectacle de Noël',
    description: 'Spectacle spécial pour les fêtes de fin d\'année',
    venue: 'Café de la Comédie',
    address: '32 boulevard Saint-Germain',
    city: 'Paris',
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
  }
];

const mockApplications: Application[] = [
  {
    id: 'app1',
    eventId: '1',
    humoristId: '1',
    humoristName: 'Demo Comic',
    stageName: 'Demo Comic',
    message: 'Salut ! J\'aimerais participer à votre open mic. J\'ai 2 ans d\'expérience et je fais principalement de l\'observationnel.',
    status: 'pending',
    appliedAt: new Date().toISOString()
  }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Créer un événement
  const createEvent = (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'applications' | 'createdAt'>) => {
    if (!user || user.userType !== 'organisateur') return;
    
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}`,
      organizerId: user.id,
      organizerName: user.profile.companyName || `${user.firstName} ${user.lastName}`,
      applications: [],
      createdAt: new Date().toISOString()
    };
    
    setEvents(prev => [newEvent, ...prev]);
    
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
  };

  // Candidater à un événement
  const applyToEvent = (eventId: string, message: string) => {
    if (!user || user.userType !== 'humoriste') return;
    
    const newApplication: Application = {
      id: `app_${Date.now()}`,
      eventId,
      humoristId: user.id,
      humoristName: `${user.firstName} ${user.lastName}`,
      stageName: user.profile.stageName,
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
  const getEventsByOrganizer = (organizerId: string) => 
    events.filter(event => event.organizerId === organizerId);

  const getAvailableEvents = (humoristId: string, city?: string) => 
    events.filter(event => 
      event.status === 'published' && 
      (!city || event.city === city) &&
      !applications.some(app => app.eventId === event.id && app.humoristId === humoristId)
    );

  const getApplicationsByEvent = (eventId: string) =>
    applications.filter(app => app.eventId === eventId);

  const getApplicationsByHumorist = (humoristId: string) =>
    applications.filter(app => app.humoristId === humoristId);

  const sendMessage = (toId: string, content: string, eventId?: string) => {
    if (!user) return;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      fromId: user.id,
      toId,
      eventId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [newMessage, ...prev]);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

  const getConversation = (userId1: string, userId2: string, eventId?: string) =>
    messages.filter(msg => 
      ((msg.fromId === userId1 && msg.toId === userId2) ||
       (msg.fromId === userId2 && msg.toId === userId1)) &&
      (!eventId || msg.eventId === eventId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

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
    const organizerEvents = getEventsByOrganizer(organizerId);
    const totalApplications = organizerEvents.reduce((sum, event) => sum + event.applications.length, 0);
    
    return {
      totalEvents: organizerEvents.length,
      totalApplications,
      averageResponseTime: 24, // En heures - mockée
      completedEvents: organizerEvents.filter(e => e.status === 'completed').length
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

  const value: DataContextType = {
    events,
    createEvent,
    updateEvent,
    getEventsByOrganizer,
    getAvailableEvents,
    applications,
    applyToEvent,
    respondToApplication,
    getApplicationsByEvent,
    getApplicationsByHumorist,
    messages,
    sendMessage,
    markMessageAsRead,
    getConversation,
    notifications,
    markNotificationAsRead,
    getUnreadNotifications,
    getOrganizerStats,
    getHumoristeStats
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
