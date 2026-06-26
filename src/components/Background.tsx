import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';
import { ParticleField } from './ParticleField';
import { TOKENS } from './tokens';

// Franja de luz diagonal animada — drift muy lento con noise2D
const DiagonalStreak: React.FC<{
  seed: string;
  xBase: number;
  opacity: number;
  angle?: number;
}> = ({ seed, xBase, opacity, angle = 22 }) => {
  const frame = useCurrentFrame();
  const drift = noise2D(seed, frame / 500, 0) * 85;

  return (
    <div
      style={{
        position: 'absolute',
        top: -300,
        left: xBase + drift,
        width: 68,
        height: 2500,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'top left',
        background: `linear-gradient(180deg,
          transparent 0%,
          rgba(255,107,26,${opacity}) 22%,
          rgba(255,107,26,${opacity}) 78%,
          transparent 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const grainSeed = Math.floor(frame / 2);
  const filterId  = `gbg${grainSeed}`;

  // Orb naranja — movimiento orgánico via noise2D (no sin/cos mecánico)
  const t    = frame / 160;
  const orbX = 540 + noise2D('orb-x', t, 0) * 230;
  const orbY = 1580 + noise2D('orb-y', 0, t) * 270;

  // Pulso de intensidad del orb también via noise para que no sea perfecto
  const orbPulse = (noise2D('orb-b', frame / 80, 0) + 1) / 2; // 0-1

  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.bgPrimary, overflow: 'hidden' }}>

      {/* Glow atmosférico superior — profundidad fría */}
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

      {/* Orb naranja principal — respiración orgánica */}
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

      {/* Franjas de luz diagonal — 2 bandas, drift lento con noise */}
      <DiagonalStreak seed="streak-a" xBase={160}  opacity={0.065} angle={22} />
      <DiagonalStreak seed="streak-b" xBase={680}  opacity={0.045} angle={20} />

      {/* ParticleField — 45 puntos flotantes, distribución noise2D */}
      <ParticleField count={45} />

      {/* Viñeta de bordes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.70) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Grano de película */}
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.04 }}>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={grainSeed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} fill="white" />
      </svg>

    </AbsoluteFill>
  );
};
