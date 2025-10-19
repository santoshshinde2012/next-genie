/**
 * Application Configuration Types
 * 
 * These types represent application configuration and environment settings
 */

// ============================================================================
// ENVIRONMENT TYPES
// ============================================================================

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_API_URL: string;
}

/**
 * Databricks configuration
 */
export interface DatabricksConfig {
  host: string;
  token: string;
  spaceId: string;
}

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Polling configuration
 */
export interface PollingConfig {
  intervalMs: number;
  maxDurationMs: number;
  initialBackoffMs: number;
  backoffMultiplier: number;
}

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

/**
 * Main application configuration
 */
export interface AppConfig {
  environment: EnvironmentConfig;
  databricks: DatabricksConfig;
  api: ApiConfig;
  polling: PollingConfig;
  features: FeatureFlags;
  ui: UIConfig;
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  enableFeedback: boolean;
  enableSuggestedQuestions: boolean;
  enableQueryExecution: boolean;
  enableConversationHistory: boolean;
  enableMobileResponsive: boolean;
  enableDarkMode: boolean;
}

/**
 * UI configuration
 */
export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  maxMessageLength: number;
  maxCommentLength: number;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Environment variable validation
 */
export interface EnvValidation {
  required: string[];
  optional: string[];
  patterns: Record<string, RegExp>;
}

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Configuration loader interface
 */
export interface ConfigLoader {
  load(): Promise<AppConfig>;
  validate(config: Partial<AppConfig>): ConfigValidationResult;
  getEnvironmentConfig(): EnvironmentConfig;
  getDatabricksConfig(): DatabricksConfig;
}

/**
 * Configuration error
 */
export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: '/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Default polling configuration
 */
export const DEFAULT_POLLING_CONFIG: PollingConfig = {
  intervalMs: 5000,
  maxDurationMs: 600000,
  initialBackoffMs: 2000,
  backoffMultiplier: 1.5,
};

/**
 * Default feature flags
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableFeedback: true,
  enableSuggestedQuestions: true,
  enableQueryExecution: true,
  enableConversationHistory: true,
  enableMobileResponsive: true,
  enableDarkMode: false,
};

/**
 * Default UI configuration
 */
export const DEFAULT_UI_CONFIG: UIConfig = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: 'HH:mm',
  maxMessageLength: 10000,
  maxCommentLength: 1000,
};
