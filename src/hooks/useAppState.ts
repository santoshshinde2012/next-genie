/**
 * Application State Hook
 * 
 * Custom hook for managing application-wide state and side effects
 */
'use client';

import { useEffect } from 'react';
import { useApp } from '@/src/contexts/AppContext';

export const useAppState = () => {
  const { loadConversations } = useApp();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search (future feature)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        // TODO: Implement search focus
      }
      
      // Escape to close sidebar
      if (event.key === 'Escape') {
        // TODO: Close any open modals or sidebar
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar on desktop if it's open
      if (window.innerWidth >= 1024) {
        // TODO: Close sidebar if open
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    // Return any additional state or methods if needed
  };
};
