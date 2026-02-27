export const COLORS = {
  // Primary
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  
  // Secondary
  secondary: '#8b5cf6',
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  
  // Semantic
  success: '#10b981',
  successLight: '#34d399',
  danger: '#ef4444',
  dangerLight: '#f87171',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  info: '#3b82f6',
  
  // Grayscale
  background: '#0f172a',
  surface: '#1e293b',
  card: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDisabled: '#64748b',
  
  // Gradients
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',

  // Shadow
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
} as const;

export const FONTS = {
  caption: 12,
  body: 14,
  h4: 16,
  h3: 18,
  h2: 20,
  h1: 24,
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
