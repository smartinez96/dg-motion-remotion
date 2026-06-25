import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { DiagonalStreaks } from './DiagonalStreaks';

const PARTICLES = [
  { x: 8,  baseY: 300,  speed: 0.28, size: 2,   opacity: 0.35, delay: 0   },
  { x: 22, baseY: 800,  speed: 0.38, size: 2.5,  opacity: 0.25, delay: 40  },
  { x: 37, baseY: 100,  speed: 0.32, size: 1.5,  opacity: 0.45, delay: 15  },
  { x: 52, baseY: 1400, speed: 0.45, size: 3,    opacity: 0.22, delay: 70  },
  { x: 65, baseY: 600,  speed: 0.22, size: 2,    opacity: 0.20, delay: 100 },
  { x: 78, baseY: 200,  speed: 0.35, size: 1.5,  opacity: 0.40, delay: 30  },
  { x: 88, baseY: 1100, speed: 0.42, size: 2.5,  opacity: 0.28, delay: 55  },
  { x: 14, baseY: 1600, speed: 0.30, size: 2,    opacity: 0.22, delay: 85  },
  { x: 45, baseY: 900,  speed: 0.50, size: 1.5,  opacity: 0.35, delay: 10  },
  { x: 60, baseY: 1800, speed: 0.25, size: 3,    opacity: 0.15, delay: 120 },
  { x: 30, baseY: 500,  speed: 0.40, size: 2,    opacity: 0.30, delay: 60  },
  { x: 92, baseY: 1200, speed: 0.48, size: 2,    opacity: 0.25, delay: 90  },
];

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const totalHeight = 1920;

  const grainSeed = Math.floor(frame / 2);
  const filterId = `gbg${grainSeed}`;

  const breathe = Math.sin(frame / 70 * Math.PI);

  // Moving orange orb — slow, low
  const t = frame / 30;
  const orbX = 540 + Math.sin(t * 0.25) * 180;
  const orbY = 1580 + Math.cos(t * 0.20) * 220;

  return (
    <AbsoluteFill style={{ backgroundColor: '#080808', overflow: 'hidden' }}>

      {/* Teal glow — upper center (atmospheric depth) */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,185,195,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Moving orange orb — lower area, slow breathing */}
      <div
        style={{
          position: 'absolute',
          left: orbX - 380,
          top: orbY - 380,
          width: 760,
          height: 760,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(232,119,34,${0.09 + breathe * 0.07}) 0%, rgba(180,65,15,0.04) 45%, transparent 70%)`,
          filter: 'blur(55px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating particles */}
      <svg width="1080" height="1920" style={{ position: 'absolute' }}>
        {PARTICLES.map((p, i) => {
          const travel = (frame * p.speed * 1.8 + p.delay + p.baseY) % totalHeight;
          const y = totalHeight - travel;
          const pulse = 0.5 + Math.sin((frame + i * 30) / 40) * 0.5;
          return (
            <circle
              key={i}
              cx={p.x * 10.8}
              cy={y}
              r={p.size}
              fill={`rgba(232,119,34,${p.opacity * pulse})`}
            />
          );
        })}
      </svg>

      {/* Dark vignette edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.68) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Film grain */}
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.045 }}>
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={grainSeed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} fill="white" />
      </svg>

      <DiagonalStreaks />
    </AbsoluteFill>
  );
};
