import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  Clock, 
  CheckCheck,
  Paperclip,
  Smile,
  MoreVertical,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantType: 'humoriste' | 'organisateur';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  eventId?: string;
  eventTitle?: string;
  isOnline?: boolean;
  messages: any[];
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, markMessageAsRead, getUserById, getEventById } = useData();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  // Récupérer toutes les conversations de l'utilisateur
  const userMessages = messages.filter(msg => 
    msg.fromId === user.id || msg.toId === user.id
  );

  // Grouper les messages par conversation
  const conversations: Conversation[] = [];
  const conversationMap = new Map<string, any>();

  userMessages.forEach(message => {
    const otherUserId = message.fromId === user.id ? message.toId : message.fromId;
    const otherUser = getUserById(otherUserId);
    
    // LOGIQUE MÉTIER : Filtrer selon le type d'utilisateur
    // Humoriste → ne parle qu'avec des organisateurs
    // Organisateur → ne parle qu'avec des humoristes
    if (user.userType === 'humoriste' && otherUser?.userType !== 'organisateur') {
      return; // Ignorer cette conversation
    }
    if (user.userType === 'organisateur' && otherUser?.userType !== 'humoriste') {
      return; // Ignorer cette conversation
    }
    
    const conversationKey = `${Math.min(parseInt(user.id), parseInt(otherUserId))}-${Math.max(parseInt(user.id), parseInt(otherUserId))}-${message.eventId || 'general'}`;
    
    if (!conversationMap.has(conversationKey)) {
      const event = message.eventId ? getEventById(message.eventId) : null;
      
      conversationMap.set(conversationKey, {
        id: conversationKey,
        participantId: otherUserId,
        participantName: otherUser?.firstName + ' ' + otherUser?.lastName || 'Utilisateur',
        participantType: otherUser?.userType || 'humoriste',
        lastMessage: message.content,
        lastMessageTime: message.timestamp,
        unreadCount: 0,
        eventId: message.eventId,
        eventTitle: event?.title,
        isOnline: Math.random() > 0.5, // Simulé pour la démo
        messages: []
      });
    }
    
    const conversation = conversationMap.get(conversationKey);
    conversation.messages.push(message);
    
    // Mettre à jour le dernier message
    if (new Date(message.timestamp) > new Date(conversation.lastMessageTime)) {
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = message.timestamp;
    }
    
    // Compter les messages non lus
    if (message.toId === user.id && !message.read) {
      conversation.unreadCount++;
    }
  });

  conversations.push(...conversationMap.values());
  
  // Trier par dernière activité
  conversations.sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  // Filtrer par recherche
  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Messages de la conversation sélectionnée
  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversationData?.messages || [];

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationData) return;
    
    sendMessage(selectedConversationData.participantId, newMessage, selectedConversationData.eventId);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getParticipantAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-[calc(100vh-200px)] flex bg-gray-900 rounded-xl overflow-hidden">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        {/* Header conversations */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Aucune conversation
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Aucun résultat trouvé' : 
                  user.userType === 'humoriste' 
                    ? 'Candidatez à des événements pour commencer à discuter avec des organisateurs !' 
                    : 'Les humoristes qui candidatent à vos événements apparaîtront ici !'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedConversation === conversation.id
                      ? 'bg-pink-500/20 border border-pink-500/30'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={`${
                          conversation.participantType === 'humoriste' 
                            ? 'bg-blue-500' 
                            : 'bg-purple-500'
                        } text-white font-semibold`}>
                          {getParticipantAvatar(conversation.participantName)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white truncate">
                          {conversation.participantName}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-pink-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {conversation.eventTitle && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 truncate">
                            {conversation.eventTitle}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversationData ? (
          <>
            {/* Header du chat */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={`${
                        selectedConversationData.participantType === 'humoriste' 
                          ? 'bg-blue-500' 
                          : 'bg-purple-500'
                      } text-white font-semibold`}>
                        {getParticipantAvatar(selectedConversationData.participantName)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConversationData.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedConversationData.participantName}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Badge variant="outline" className={`${
                        selectedConversationData.participantType === 'humoriste'
                          ? 'border-blue-500/30 text-blue-400'
                          : 'border-purple-500/30 text-purple-400'
                      }`}>
                        {selectedConversationData.participantType === 'humoriste' ? '🎭 Humoriste' : '🎪 Organisateur'}
                      </Badge>
                      {selectedConversationData.isOnline && (
                        <span className="text-green-400 text-xs">● En ligne</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              {selectedConversationData.eventTitle && (
                <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-purple-200">
                    <Calendar className="w-4 h-4" />
                    <span>Conversation liée à : <strong>{selectedConversationData.eventTitle}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {conversationMessages.map((message, index) => {
                  const isOwn = message.fromId === user.id;
                  const showAvatar = index === 0 || conversationMessages[index - 1].fromId !== message.fromId;
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {!isOwn && showAvatar && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`${
                              selectedConversationData.participantType === 'humoriste' 
                                ? 'bg-blue-500' 
                                : 'bg-purple-500'
                            } text-white text-sm`}>
                              {getParticipantAvatar(selectedConversationData.participantName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isOwn && !showAvatar && <div className="w-8" />}
                        
                        <div className={`rounded-2xl px-4 py-2 ${
                          isOwn 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-gray-700 text-gray-100'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                            isOwn ? 'text-pink-100' : 'text-gray-400'
                          }`}>
                            <span>{formatTime(message.timestamp)}</span>
                            {isOwn && (
                              <CheckCheck className={`w-3 h-3 ${message.read ? 'text-blue-300' : 'text-pink-200'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/30">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-gray-700 border-gray-600 text-white pr-12"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* État vide - aucune conversation sélectionnée */
          <div className="flex-1 flex items-center justify-center bg-gray-800/20">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez une conversation dans la liste pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
