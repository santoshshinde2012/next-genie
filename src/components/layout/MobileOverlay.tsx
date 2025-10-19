/**
 * Mobile Overlay Component
 * 
 * Provides a backdrop overlay for mobile sidebar interactions
 */
'use client';

import React from 'react';

interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileOverlay: React.FC<MobileOverlayProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
};
