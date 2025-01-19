import React from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot }) => {
  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isBot ? 'bg-pink-50' : 'bg-yellow-50'
      )}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        {isBot ? (
          <Bot className="w-5 h-5 text-pink-600" />
        ) : (
          <User className="w-5 h-5 text-yellow-600" />
        )}
      </div>
      <div className={cn('flex-1', isBot ? 'text-pink-900' : 'text-yellow-900')}>
        {message}
      </div>
    </div>
  );
};