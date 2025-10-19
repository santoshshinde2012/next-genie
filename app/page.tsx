/**
 * Main Page - Databricks Genie Chat Integration
 * 
 * Optimized with proper decomposition and modern architecture
 */
'use client';

import React from 'react';
import { AppProvider, useApp } from '@/src/contexts/AppContext';
import { AppLayout } from '@/src/components/layout/AppLayout';
import { HomePage } from '@/src/components/pages/HomePage';
import { useAppState } from '@/src/hooks/useAppState';

/**
 * Main application component with context provider
 */
function AppContent() {
  // Initialize application state and side effects
  useAppState();

  const { 
    sidebarOpen, 
    setSidebarOpen, 
    conversations
  } = useApp();

  return (
    <AppLayout
      onMenuClick={() => setSidebarOpen(true)}
      conversationCount={conversations.length}
      isMobileMenuOpen={sidebarOpen}
      onCloseMobileMenu={() => setSidebarOpen(false)}
    >
      <HomePage />
    </AppLayout>
  );
}

/**
 * Main page component with providers
 */
export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

