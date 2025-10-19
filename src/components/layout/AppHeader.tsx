/**
 * Application Header Component
 * 
 * Displays the main application header with branding and navigation
 */
'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { 
  Menu, 
  Sparkles, 
  ExternalLink,
  Github,
  Settings
} from 'lucide-react';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  onMenuClick
}) => {
  return (
    <header className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-200/80 dark:bg-gray-900/90 dark:border-gray-800/80 px-4 lg:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-60"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Databricks Genie
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block truncate">
                Ask questions about your data using natural language
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mr-1">
            <a
              href="https://docs.databricks.com/api/workspace/genie"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg transition-all duration-200 font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>API Docs</span>
            </a>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="GitHub"
            >
              <Github className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
