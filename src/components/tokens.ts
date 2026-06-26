export const TOKENS = {
  bgPrimary:     '#0A0A0A',
  bgCard:        '#161616',
  bgCardBorder:  '#2A2A2A',
  accentPrimary: '#FF6B1A',
  textPrimary:   '#FFFFFF',
  textSecondary: '#B8B8B8',
} as const;

// Alias backward-compat — todos los compositions importan esto desde fonts.ts
export const COLORS = {
  bg:         TOKENS.bgPrimary,
  primary:    TOKENS.textPrimary,
  orange:     TOKENS.accentPrimary,
  gray:       'rgba(255,255,255,0.40)',
  lightGray:  'rgba(255,255,255,0.12)',
  mediumGray: TOKENS.textSecondary,
  offWhite:   '#F5F5F5',
} as const;
