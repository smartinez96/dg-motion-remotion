import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { TOKENS } from './tokens';
import { useTheme } from '../ThemeContext';

export type IconType = 'check' | 'clock' | 'chart' | 'message';
export type BadgeVariant = 'subtle' | 'solid';

type Props = {
  icon: IconType;
  size?: number;
  variant?: BadgeVariant; // subtle = fondo 15% acento | solid = fondo acento + ícono blanco
  delay?: number;
  shape?: 'circle' | 'rounded';
};

// Paths en viewBox 0 0 48 48
// strokeDasharray > longitud real del path → strokeDashoffset anima de ese valor a 0
const ICON_PATH: Record<IconType, { d: string; len: number }> = {
  check:   { d: 'M 9 25 L 20 36 L 39 12',                              len: 50  },
  chart:   { d: 'M 10 38 L 10 26 M 22 38 L 22 18 M 34 38 L 34 10',    len: 70  },
  message: { d: 'M 7 11 Q 7 8 10 8 L 38 8 Q 41 8 41 11 L 41 29 Q 41 32 38 32 L 26 32 L 21 39 L 21 32 L 10 32 Q 7 32 7 29 Z', len: 160 },
  clock:   { d: 'M 24 8 C 32.8 8 40 15.2 40 24 C 40 32.8 32.8 40 24 40 C 15.2 40 8 32.8 8 24 C 8 15.2 15.2 8 24 8 M 24 15 L 24 24 L 31 29', len: 130 },
};

const DRAW_FRAMES = 14; // ~0.47s a 30fps

export const IconBadge: React.FC<Props> = ({
  icon,
  size = 120,
  variant = 'subtle',
  delay = 0,
  shape = 'circle',
}) => {
  const frame = useCurrentFrame();
  const lf    = Math.max(0, frame - delay);

  // Badge entra con spring scale
  const badgeScale   = interpolate(lf, [0, 10], [0.7, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) });
  const badgeOpacity = interpolate(lf, [0, 8],  [0, 1],   { extrapolateRight: 'clamp' });

  // Ícono se dibuja a partir del frame 4 (badge ya visible)
  const drawProgress = interpolate(lf, [4, 4 + DRAW_FRAMES], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const { d, len } = ICON_PATH[icon];
  const strokeDasharray  = len;
  const strokeDashoffset = len * (1 - drawProgress);

  const theme = useTheme();
  const bgColor    = variant === 'solid' ? TOKENS.accentPrimary : theme.iconBadgeSubtleBg;
  const iconColor  = variant === 'solid' ? TOKENS.textPrimary   : TOKENS.accentPrimary;
  const borderRadius = shape === 'circle' ? '50%' : `${Math.round(size * 0.26)}px`;
  const strokeW    = Math.max(2.5, size * 0.05);
  // Light theme: sombra sutil debajo en lugar de glow alrededor
  const boxShadow = theme.mode === 'light' && variant === 'subtle'
    ? '0 4px 16px rgba(0,0,0,0.08)'
    : 'none';

  return (
    <div style={{
      width: size, height: size, borderRadius,
      backgroundColor: bgColor,
      border: variant === 'subtle' ? `1px solid ${theme.iconBadgeBorder}` : 'none',
      boxShadow,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: badgeOpacity,
      transform: `scale(${badgeScale})`,
      flexShrink: 0,
    }}>
      <svg
        viewBox="0 0 48 48"
        width={size * 0.56}
        height={size * 0.56}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <path
          d={d}
          stroke={iconColor}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
    </div>
  );
};
