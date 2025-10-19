/**
 * Application Context
 * 
 * Provides global application state management
 */
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useGenie } from '@/lib/hooks/useGenie';
import { useConversations } from '@/lib/hooks/useConversations';

interface AppContextType {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  
  // Chat State
  messages: any[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  conversationTitle: string | null;
  
  // Conversations State
  conversations: any[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  
  // Processing State
  isProcessing: boolean;
  processingMessage: string | null;
  
  // Actions
  handleSelectConversation: (conversationId: string) => Promise<void>;
  handleNewConversation: () => void;
  handleSendMessage: (content: string) => Promise<void>;
  handleSuggestedQuestion: (question: string) => Promise<void>;
  sendFeedback: (messageId: string, rating: 'POSITIVE' | 'NEGATIVE', comment?: string) => Promise<any>;
  loadConversations: () => Promise<void>;
  
  // Utility Actions
  clearError: () => void;
  refreshConversations: () => Promise<void>;
  getSelectedConversation: () => any | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // UI State - Start with sidebar open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Open sidebar on desktop
      } else {
        setSidebarOpen(false); // Close sidebar on mobile
      }
    };

    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Chat State
  const {
    messages,
    isLoading,
    error,
    conversationId,
    conversationTitle,
    startConversation,
    sendMessage,
    clearConversation,
    loadConversation,
    sendFeedback,
  } = useGenie();

  // Sync activeConversationId with conversationId when it changes
  useEffect(() => {
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, activeConversationId]);

  // Conversations State
  const {
    conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    loadConversations,
  } = useConversations();

  // Actions
  const handleSelectConversation = useCallback(async (conversationId: string) => {
    // Only load conversation if it's different from current one
    if (conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
      await loadConversation(conversationId);
    } else {
      // Just update the active conversation ID if it's the same
      setActiveConversationId(conversationId);
    }
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [loadConversation, activeConversationId]);

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null);
    clearConversation();
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [clearConversation]);

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      setIsProcessing(true);
      setProcessingMessage('Sending message...');
      
      if (conversationId) {
        // Send message to existing conversation
        await sendMessage(content);
      } else {
        // Start new conversation
        await startConversation(content);
        // Refresh conversations list after starting a new one
        await loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
      setProcessingMessage(null);
    }
  }, [conversationId, sendMessage, startConversation, loadConversations]);

  const handleSuggestedQuestion = useCallback(async (question: string) => {
    await handleSendMessage(question);
  }, [handleSendMessage]);

  const clearError = useCallback(() => {
    // Clear errors from both chat and conversations
    // This would need to be implemented in the hooks
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      await loadConversations();
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  }, [loadConversations]);

  const getSelectedConversation = useCallback(() => {
    if (!activeConversationId) return null;
    return conversations.find(conv => conv.conversation_id === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  const value: AppContextType = {
    // UI State
    sidebarOpen,
    setSidebarOpen,
    activeConversationId,
    setActiveConversationId,
    
    // Chat State
    messages,
    isLoading,
    error,
    conversationId,
    conversationTitle,
    
    // Conversations State
    conversations,
    conversationsLoading,
    conversationsError,
    
    // Processing State
    isProcessing,
    processingMessage,
    
    // Actions
    handleSelectConversation,
    handleNewConversation,
    handleSendMessage,
    handleSuggestedQuestion,
    sendFeedback,
    loadConversations,
    
    // Utility Actions
    clearError,
    refreshConversations,
    getSelectedConversation,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
