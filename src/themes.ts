export type DGTheme = {
  mode: 'dark' | 'light';
  // Core palette
  bgPrimary: string;
  bgCard: string;
  bgCardBorder: string;
  accentPrimary: string;
  textPrimary: string;
  textSecondary: string;
  // Effect mode (glow vs shadow)
  glowMode: 'glow' | 'shadow';
  // Logo asset
  logoFile: string;
  // Particles
  particleColorA: string;
  particleColorB: string;
  particleOpacityBase: number;
  // Diagonal streaks
  streakColorA: string;
  streakColorB: string;
  // Chat mockup
  chatBubbleRecvBg: string;
  chatBubbleRecvBorder: string;
  chatBubbleSentBg: string;
  chatBubbleSentBorder: string;
  chatBubbleRecvText: string;
  chatBubbleSentText: string;
  chatCheckSingle: string;
  chatContainerBg: string;
  chatContainerShadow: string;
  chatContainerBorderRadius: number;
  chatContainerPadding: string;
  // IconBadge
  iconBadgeSubtleBg: string;
  iconBadgeBorder: string;
};

export const darkTheme: DGTheme = {
  mode: 'dark',
  bgPrimary: '#0A0A0A',
  bgCard: '#161616',
  bgCardBorder: '#2A2A2A',
  accentPrimary: '#FF6B1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8B8',
  glowMode: 'glow',
  logoFile: 'logo-full-white.png',
  particleColorA: '#FF6B1A',
  particleColorB: '#FFFFFF',
  particleOpacityBase: 1,
  streakColorA: 'rgba(255,255,255,1)',
  streakColorB: 'rgba(232,119,34,1)',
  chatBubbleRecvBg: '#161616',
  chatBubbleRecvBorder: '#2A2A2A',
  chatBubbleSentBg: 'rgba(255,107,26,0.13)',
  chatBubbleSentBorder: 'rgba(255,107,26,0.22)',
  chatBubbleRecvText: '#B8B8B8',
  chatBubbleSentText: '#FFFFFF',
  chatCheckSingle: 'rgba(255,255,255,0.30)',
  chatContainerBg: 'transparent',
  chatContainerShadow: 'none',
  chatContainerBorderRadius: 0,
  chatContainerPadding: '0',
  iconBadgeSubtleBg: 'rgba(255,107,26,0.15)',
  iconBadgeBorder: '#2A2A2A',
};

export const lightTheme: DGTheme = {
  mode: 'light',
  bgPrimary: '#FAFAFA',
  bgCard: '#FFFFFF',
  bgCardBorder: '#E8E8E8',
  accentPrimary: '#FF6B1A',
  textPrimary: '#0A0A0A',
  textSecondary: '#5A5A5A',
  glowMode: 'shadow',
  logoFile: 'logo-full-white.png',
  particleColorA: '#B0B0B0',
  particleColorB: '#C8C8C8',
  particleOpacityBase: 0.65,
  streakColorA: 'rgba(0,0,0,0.03)',
  streakColorB: 'rgba(0,0,0,0.02)',
  chatBubbleRecvBg: '#F0F0F0',
  chatBubbleRecvBorder: '#E8E8E8',
  chatBubbleSentBg: 'rgba(255,107,26,0.12)',
  chatBubbleSentBorder: 'rgba(255,107,26,0.28)',
  chatBubbleRecvText: '#5A5A5A',
  chatBubbleSentText: '#0A0A0A',
  chatCheckSingle: 'rgba(0,0,0,0.25)',
  chatContainerBg: '#FFFFFF',
  chatContainerShadow: '0 12px 48px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
  chatContainerBorderRadius: 24,
  chatContainerPadding: '24px 20px',
  iconBadgeSubtleBg: 'rgba(255,107,26,0.09)',
  iconBadgeBorder: '#E8E8E8',
};
