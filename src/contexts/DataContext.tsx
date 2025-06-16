import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { User, HumoristeProfile, Location } from '@/types/auth'; // Import User and HumoristeProfile types
import { Event, Application } from '@/types/events'; // Ensure Event and Application are imported
import { toast } from 'react-hot-toast';

// Types for messages and notifications can stay here if they are only used in this context
export interface Message {
  id: string;
  fromId: string;
  toId: string;
  eventId?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

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
  // States
  isLoading: boolean;
  error: string | null;

  // Events
  events: Event[];
  createEvent: (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'applications' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  getEventsByOrganizer: (organizerId: string) => Event[];
  getAvailableEvents: (humoristId: string, city?: string) => Event[];
  getEventById: (eventId: string) => Event | undefined;
  fetchEvents: () => Promise<void>;
  
  // Applications
  applications: Application[];
  applyToEvent: (eventId: string, humoristId: string, message: string) => Promise<void>;
  respondToApplication: (applicationId: string, status: 'accepted' | 'rejected') => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: 'accepted' | 'rejected') => Promise<void>;
  getApplicationsByEvent: (eventId: string) => Application[];
  getApplicationsByHumorist: (humoristId: string) => Application[];
  fetchApplications: () => Promise<void>;
  
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
  getUserById: (userId: string) => User | undefined;
  
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
}

const DataContext = createContext<DataContextType | null>(null);

// Remove mock users data as it will be fetched from the backend

// Remove mockEvents and mockApplications as they will be fetched from the backend

// Remove getInitialEvents and getInitialApplications

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, users, token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3000/api'; // Define your backend API URL

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }), [token]);

  // Fetch Events from backend
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: authHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Event[] = await response.json();
      setEvents(data);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  // Fetch Applications from backend
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: authHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Application[] = await response.json();
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders]);

  // Initial data loading on mount
  useEffect(() => {
    fetchEvents();
    fetchApplications();
  }, [fetchEvents, fetchApplications]);

  // Remove local storage effects
  useEffect(() => {
    console.log('Removed local storage saving for events.');
  }, [events]);

  useEffect(() => {
    console.log('Removed local storage saving for applications.');
  }, [applications]);

  // Debug effect (can be removed later)
  useEffect(() => {
    console.log('=== DataProvider Debug ===');
    console.log('User:', user);
    console.log('Events:', events);
    console.log('Applications:', applications);
    console.log('Loading:', isLoading);
    console.log('Error:', error);
  }, [user, events, applications, isLoading, error]);

  const getEventById = (eventId: string): Event | undefined => {
    return events.find(event => event.id === eventId);
  };

  const getUserById = (userId: string): User | undefined => {
    const foundUser = users.find(u => u.id === userId);
    console.log('getUserById:', { userId, foundUser });
    return foundUser;
  };

  // Create Event
  const createEvent = async (eventData: Omit<Event, 'id' | 'organizerId' | 'organizerName' | 'applications' | 'createdAt' | 'updatedAt'>) => {
    if (!user || user.userType !== 'organisateur') {
      setError('Unauthorized: Only organizers can create events.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...eventData,
          organizerId: user.id, // Ensure organizerId is sent
          organizerName: user.firstName + ' ' + user.lastName, // Ensure organizerName is sent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      await fetchEvents(); // Re-fetch events after creation
      toast.success(`Événement '${eventData.title}' créé à ${eventData.location.city} !`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message);
      toast.error("Erreur lors de la création de l'événement.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update Event
  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }
      await fetchEvents(); // Re-fetch events after update
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Event
  const deleteEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }
      await fetchEvents(); // Re-fetch events after deletion
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyToEvent = async (eventId: string, humoristId: string, message: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          eventId,
          humoristId,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply to event');
      }
      await fetchApplications(); // Re-fetch applications after applying
      toast.success("Candidature envoyée avec succès !");
    } catch (err: any) {
      console.error('Error applying to event:', err);
      setError(err.message);
      toast.error("Erreur lors de l'envoi de la candidature.");
    } finally {
      setIsLoading(false);
    }
  };

  const respondToApplication = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to respond to application');
      }
      await fetchApplications(); // Re-fetch applications after response
      await fetchEvents(); // Also re-fetch events, as application status affects event data (e.g., accepted performers)
    } catch (err: any) {
      console.error('Error responding to application:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    // This function can potentially be merged with respondToApplication if their logic is always identical
    // For now, mirroring respondToApplication's logic
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update application status');
      }
      await fetchApplications();
      await fetchEvents();
    } catch (err: any) {
      console.error('Error updating application status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventsByOrganizer = (organizerId: string) => 
    events.filter(event => event.organizerId === organizerId);

  const getAvailableEvents = (humoristId: string, city?: string) => {
    const humorist = users.find(u => u.id === humoristId);
    if (!humorist || humorist.userType !== 'humoriste') return [];

    const humoristProfile = humorist.profile as HumoristeProfile;

    console.log('Debug - Humorist Profile (getAvailableEvents):', {
      humoristId,
      profile: humoristProfile
    });

    const filteredEvents = events.filter(event => {
      // Check if event.applications is populated (contains full application objects) or just IDs
      // If it contains IDs, we need to manually find them from the applications state
      const hasApplied = applications.some(app => app.eventId === event.id && app.humoristId === humoristId);

      console.log('Debug - Evaluating Event in getAvailableEvents:', {
        eventId: event.id,
        eventTitle: event.title,
        eventStatus: event.status,
        humoristId: humoristId,
        alreadyApplied: hasApplied
      });

      if (event.status !== 'published') {
        console.log(`Event ${event.id} (${event.title}): Not published. Skipping.`);
        return false;
      }

      if (hasApplied) {
        console.log(`Event ${event.id} (${event.title}): Already applied by humorist ${humoristId}. Skipping.`);
        return false;
      }
      console.log(`Event ${event.id} (${event.title}): Passed all filters. Including in available events.`);
      return true;
    });
    console.log('Debug - Final Filtered Events from getAvailableEvents:', filteredEvents);
    return filteredEvents;
  };

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
    const organizerEvents = events.filter(event => event.organizerId === organizerId);
    const organizer = users.find(u => u.id === organizerId); 
    
    return {
      totalEvents: organizerEvents.length,
      totalApplications: organizerEvents.reduce((sum, event) => sum + event.applications.length, 0),
      completedEvents: organizerEvents.filter(event => event.status === 'completed').length,
      averageResponseTime: 2,
      companyName: organizer?.userType === 'organisateur' && 'profile' in organizer && 'companyName' in organizer.profile ? organizer.profile.companyName : undefined
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

  const value: DataContextType = {
    isLoading,
    error,
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByOrganizer,
    getAvailableEvents,
    getEventById,
    fetchEvents,
    applications,
    applyToEvent,
    respondToApplication,
    updateApplicationStatus,
    getApplicationsByEvent,
    getApplicationsByHumorist,
    fetchApplications,
    messages,
    sendMessage,
    markMessageAsRead,
    getConversation,
    notifications,
    markNotificationAsRead,
    getUnreadNotifications,
    getUserById,
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
