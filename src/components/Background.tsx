import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';
import { ParticleField } from './ParticleField';
import { useTheme } from '../ThemeContext';

// Franja de luz diagonal animada — drift muy lento con noise2D
const DiagonalStreak: React.FC<{
  seed: string;
  xBase: number;
  color: string;
  opacity: number;
  angle?: number;
  width?: number;
  blur?: number;
}> = ({ seed, xBase, color, opacity, angle = 22, width = 68, blur = 0 }) => {
  const frame = useCurrentFrame();
  const drift = noise2D(seed, frame / 500, 0) * 85;

  return (
    <div
      style={{
        position: 'absolute',
        top: -300,
        left: xBase + drift,
        width,
        height: 2500,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'top left',
        background: `linear-gradient(180deg,
          transparent 0%,
          ${color.replace(')', `,${opacity})`).replace('rgb', 'rgba')} 22%,
          ${color.replace(')', `,${opacity})`).replace('rgb', 'rgba')} 78%,
          transparent 100%)`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  const grainSeed = Math.floor(frame / 2);
  const filterId  = `gbg${grainSeed}`;

  const t    = frame / 160;
  const orbX = 540 + noise2D('orb-x', t, 0) * 230;
  const orbY = 1580 + noise2D('orb-y', 0, t) * 270;
  const orbPulse = (noise2D('orb-b', frame / 80, 0) + 1) / 2;

  const isDark = theme.mode === 'dark';

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bgPrimary, overflow: 'hidden' }}>

      {isDark ? (
        <>
          {/* DARK — Glow atmosférico superior (frío teal) */}
          <div style={{
            position: 'absolute',
            top: -80, left: '50%',
            transform: 'translateX(-50%)',
            width: 900, height: 650,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,185,195,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />

          {/* DARK — Orb naranja principal respiración orgánica */}
          <div style={{
            position: 'absolute',
            left: orbX - 380, top: orbY - 380,
            width: 760, height: 760,
            borderRadius: '50%',
            background: `radial-gradient(circle,
              rgba(255,107,26,${0.08 + orbPulse * 0.07}) 0%,
              rgba(200,70,10,0.03) 45%,
              transparent 70%)`,
            filter: 'blur(58px)',
            pointerEvents: 'none',
          }} />

          {/* DARK — Franjas de luz naranja diagonal */}
          <DiagonalStreak seed="streak-a" xBase={160} color="rgb(255,107,26)" opacity={0.065} angle={22} />
          <DiagonalStreak seed="streak-b" xBase={680} color="rgb(255,107,26)" opacity={0.045} angle={20} />

          {/* DARK — Viñeta de bordes oscura */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.70) 100%)',
            pointerEvents: 'none',
          }} />
        </>
      ) : (
        <>
          {/* LIGHT — Tinte cálido sutil arriba (no es glow, es temperatura de color) */}
          <div style={{
            position: 'absolute',
            top: -60, left: '50%',
            transform: 'translateX(-50%)',
            width: 1000, height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,220,255,0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }} />

          {/* LIGHT — Tinte cálido naranja muy sutil en la parte baja */}
          <div style={{
            position: 'absolute',
            left: orbX - 380, top: orbY - 380,
            width: 760, height: 760,
            borderRadius: '50%',
            background: `radial-gradient(circle,
              rgba(255,107,26,${0.025 + orbPulse * 0.015}) 0%,
              transparent 60%)`,
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }} />

          {/* LIGHT — Franjas de sombra diagonal muy sutiles (oscuridad sobre fondo claro) */}
          <DiagonalStreak seed="streak-a" xBase={160} color="rgb(0,0,0)" opacity={0.025} angle={22} width={120} blur={18} />
          <DiagonalStreak seed="streak-b" xBase={680} color="rgb(0,0,0)" opacity={0.018} angle={20} width={90}  blur={22} />

          {/* LIGHT — Viñeta muy sutil en bordes */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.06) 100%)',
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* Partículas — se adaptan vía useTheme() internamente */}
      <ParticleField count={45} />

      {/* Grano de película — más sutil en light */}
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: isDark ? 0.04 : 0.025 }}>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={grainSeed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} fill={isDark ? 'white' : 'black'} />
      </svg>

    </AbsoluteFill>
  );
};
