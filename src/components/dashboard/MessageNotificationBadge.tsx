import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

interface MessageNotificationBadgeProps {
  className?: string;
}

const MessageNotificationBadge: React.FC<MessageNotificationBadgeProps> = ({ className }) => {
  const { user } = useAuth();
  const { messages } = useData();

  if (!user) return null;

  // Compter les messages non lus
  const unreadCount = messages.filter(msg => 
    msg.toId === user.id && !msg.read
  ).length;

  return (
    <div className={`relative ${className}`}>
      <MessageSquare className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0 border-2 border-gray-900"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default MessageNotificationBadge; 