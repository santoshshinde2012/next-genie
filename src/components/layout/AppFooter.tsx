/**
 * Application Footer Component
 * 
 * Displays the main application footer with information and stats
 */
'use client';

import React from 'react';
import { 
  Heart, 
  Code, 
  Zap,
  Database
} from 'lucide-react';

interface AppFooterProps {
  conversationCount: number;
}

export const AppFooter: React.FC<AppFooterProps> = ({ conversationCount }) => {
  return (
    <footer className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-gray-200/80 dark:bg-gray-900/90 dark:border-gray-800/80 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 max-w-screen-2xl mx-auto">
        <div className="hidden sm:flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
            <Code className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-700 dark:text-purple-300">Next.js 14</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-pink-50 dark:bg-pink-900/20 rounded-md border border-pink-200 dark:border-pink-800">
            <Zap className="h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
            <span className="font-medium text-pink-700 dark:text-pink-300">TypeScript</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
            <Database className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-700 dark:text-blue-300">Databricks Genie</span>
          </div>
        </div>
        
        <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
          <Code className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-purple-700 dark:text-purple-300">Next.js + TS</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-md border border-purple-200 dark:border-purple-800">
            <Database className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-700 dark:text-purple-300">
              {conversationCount} conversation{conversationCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-1 text-gray-400 dark:text-gray-500">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
