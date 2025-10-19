/**
 * Application Layout Component
 * 
 * Main layout wrapper that provides the overall application structure
 */
'use client';

import React from 'react';
import { MobileOverlay } from './MobileOverlay';

interface AppLayoutProps {
  children: React.ReactNode;
  onMenuClick: () => void;
  conversationCount: number;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  onMenuClick,
  conversationCount,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative w-full">
        <MobileOverlay 
          isOpen={isMobileMenuOpen} 
          onClose={onCloseMobileMenu} 
        />
        
        <main className="flex-1 flex min-w-0 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
