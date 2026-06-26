import React from 'react';
import { useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';
import { TOKENS } from './tokens';
import { useTheme } from '../ThemeContext';

type Props = {
  children: React.ReactNode;
  fontSize?: number;
  fontWeight?: number;
  intensity?: number; // 0–1, default 0.75
  color?: string;     // hex, default accentPrimary
  seed?: string;      // noise seed — usar distinto para múltiples GlowText en misma escena
};

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export const GlowText: React.FC<Props> = ({
  children,
  fontSize,
  fontWeight = 900,
  intensity = 0.75,
  color = TOKENS.accentPrimary,
  seed = 'glow',
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  const raw   = noise2D(seed, frame / 90, 0);
  const pulse = (raw + 1) / 2; // -1..1 → 0..1

  let textShadow: string;

  if (theme.glowMode === 'shadow') {
    // Light theme: sombra que se mueve sutilmente — simula luz cenital moviéndose
    // No glow, no brillo — pura sensación de elevación del texto
    const shadowY    = (2 + pulse * 5).toFixed(1);
    const shadowBlur = (6 + pulse * 6).toFixed(1);
    const shadowOp   = (0.08 + pulse * 0.10).toFixed(2);
    textShadow = `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOp})`;
  } else {
    // Dark theme: glow naranja multicapa
    const g = intensity * (0.60 + pulse * 0.40);
    const [r, gv, b] = hexToRgb(color);
    const rgba = (a: number) => `rgba(${r},${gv},${b},${(g * a).toFixed(2)})`;
    textShadow = [
      `0 0  8px ${rgba(0.95)}`,
      `0 0 22px ${rgba(0.70)}`,
      `0 0 55px ${rgba(0.40)}`,
      `0 0 110px ${rgba(0.18)}`,
    ].join(', ');
  }

  return (
    <span style={{ color, fontWeight, fontSize, textShadow }}>
      {children}
    </span>
  );
};
