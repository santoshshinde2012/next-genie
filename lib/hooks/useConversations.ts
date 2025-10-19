/**
 * Custom React hook for managing conversations
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Conversation,
  UseConversationsReturn
} from '@/src/types';
import { apiService } from '@/lib/services/api';

// UseConversationsReturn is now imported from frontend types

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getConversations();
      setConversations(response.conversations || []);
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    loadConversations,
  };
}
