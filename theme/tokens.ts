/**
 * MotoSync Design System Tokens
 * Strict semantic design system — no hardcoded colors or pixel widths outside tokens.
 */

export const Colors = {
  // Base Backgrounds & Surfaces
  background: '#000000',      // True Black
  surface: '#070A10',         // Deep Surface
  card: '#0E1422',            // Elevated Card
  cardHover: '#131B2E',

  // Core Brand Accents
  blue: '#10B1FB',            // Electric Blue
  blueGlow: 'rgba(16, 177, 251, 0.35)',
  blueSoft: 'rgba(16, 177, 251, 0.12)',
  blueBorder: 'rgba(16, 177, 251, 0.35)',

  violet: '#8B5CF6',          // Neon Violet
  violetGlow: 'rgba(139, 92, 246, 0.35)',
  violetSoft: 'rgba(139, 92, 246, 0.12)',
  violetBorder: 'rgba(139, 92, 246, 0.35)',

  // Alerts only (strictly for hazards / emergencies)
  red: '#EF4444',             // Alert Red
  redGlow: 'rgba(239, 68, 68, 0.40)',
  redSoft: 'rgba(239, 68, 68, 0.15)',
  redBorder: 'rgba(239, 68, 68, 0.40)',

  // Status & Success
  green: '#10B981',           // Success Emerald
  greenGlow: 'rgba(16, 185, 129, 0.30)',
  greenSoft: 'rgba(16, 185, 129, 0.12)',
  greenBorder: 'rgba(16, 185, 129, 0.35)',

  // Typography Palette
  text: '#FFFFFF',            // High-contrast pure white
  textSecondary: '#94A3B8',   // Medium subtext
  textMuted: '#475569',       // Muted helper text
  textDisabled: 'rgba(255, 255, 255, 0.22)',

  // Borders & Glass
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.14)',
  glassCard: 'rgba(14, 20, 34, 0.85)',
  overlayDark: 'rgba(0, 0, 0, 0.80)',
} as const

export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const

export const Radii = {
  badge: 8,
  sm: 12,
  md: 16,
  button: 18,
  card: 24,
  cardLarge: 28,
  pill: 999,
  full: 9999,
} as const

export const Typography = {
  hero: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  titleLarge: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    color: Colors.textMuted,
  },
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  telemetryMonoLarge: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  telemetryMono: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700' as const,
    color: Colors.blue,
  },
  telemetryMonoSmall: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    color: Colors.blue,
  },
} as const

export const TouchTargets = {
  minTouch: 48,               // 48px+ accessibility minimum
  primaryButtonHeight: 56,    // Exactly 56px per spec
  secondaryButtonHeight: 48,
  iconButtonSize: 48,
  tabBarHeight: 68,
} as const

export const Shadows = {
  none: {},
  blueGlow: {
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 8,
  },
  violetGlow: {
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 8,
  },
  redGlow: {
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 16,
    elevation: 8,
  },
  greenGlow: {
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  cardAmbient: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
} as const

export const Motion = {
  spring: {
    damping: 16,
    stiffness: 180,
    mass: 0.8,
  },
  springBouncy: {
    damping: 12,
    stiffness: 160,
    mass: 0.9,
  },
  springGentle: {
    damping: 24,
    stiffness: 140,
    mass: 1,
  },
  pressScale: 0.97,
  durations: {
    fast: 150,
    normal: 250,
    slow: 400,
    splashDuration: 2500,
  },
} as const
