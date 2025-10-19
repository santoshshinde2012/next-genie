/**
 * Conversation Sidebar Component
 */
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  Search,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { 
  Conversation,
  ConversationSidebarProps
} from '@/src/types';

// Re-export Conversation for backward compatibility
export type { Conversation };

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isLoading = false,
  isOpen = true,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const formatTimestamp = (timestamp: number) => {
    // Handle both seconds and milliseconds timestamps
    const date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateTitle = (title: string, maxLength: number = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
            title="New conversation"
          >
            <Plus className="h-4 w-4 text-white" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        
        {onClose && (
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 h-8 w-8 p-0 lg:hidden hover:bg-gray-100"
            title="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mb-4">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto" />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <Button onClick={onNewConversation} size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.conversation_id}
                className={cn(
                  'group relative p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1',
                  activeConversationId === conversation.conversation_id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                )}
                onClick={() => onSelectConversation(conversation.conversation_id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                    activeConversationId === conversation.conversation_id
                      ? "bg-blue-500 text-white"
                      : "bg-purple-100 text-purple-600"
                  )}>
                    {conversation.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "text-sm font-medium truncate",
                      activeConversationId === conversation.conversation_id
                        ? "text-blue-900"
                        : "text-gray-900"
                    )}>
                      {truncateTitle(conversation.title, 30)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(conversation.created_timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};
