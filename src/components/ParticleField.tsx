import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { noise2D } from '@remotion/noise';

const W = 1080;
const H = 1920;

type Props = {
  count?: number;
  dissolve?: number; // 0-1: en 1 las partículas se dispersan y desvanecen (efecto disolución)
};

export const ParticleField: React.FC<Props> = ({ count = 45, dissolve = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / 350; // drift muy lento — casi imperceptible frame a frame

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg
        width={W}
        height={H}
        style={{ position: 'absolute' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: count }, (_, i) => {
          // Posición base determinista y distribuida uniformemente por todo el canvas
          const bx = ((i * 23.7) % 100) / 100 * W;
          const by = ((i * 37.3) % 100) / 100 * H;

          // Deriva orgánica lenta — cada partícula tiene su propia seed
          const dx = noise2D(`pfx${i}`, t, 0) * 90;
          const dy = noise2D(`pfy${i}`, 0, t) * 120;

          // Modo disolución: partículas se dispersan y aceleran
          const sx = dissolve > 0 ? noise2D(`pdx${i}`, i * 0.1, 0) * W * 0.55 * dissolve : 0;
          const sy = dissolve > 0 ? noise2D(`pdy${i}`, 0, i * 0.1) * H * 0.45 * dissolve : 0;

          const cx = bx + dx + sx;
          const cy = by + dy + sy;

          const r = 1.5 + Math.abs(noise2D(`psr${i}`, i, 0)) * 2;
          const baseOp = 0.08 + Math.abs(noise2D(`pop${i}`, 0, i)) * 0.14;
          const opacity = baseOp * Math.max(0, 1 - dissolve * 1.5);

          // 1 de cada 3 partículas en accentPrimary, el resto blancas
          const fill = i % 3 === 0 ? '#FF6B1A' : '#FFFFFF';

          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
