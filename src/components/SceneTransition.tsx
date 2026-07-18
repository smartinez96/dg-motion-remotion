import React from 'react';
import { AbsoluteFill } from 'remotion';
import { linearTiming } from '@remotion/transitions';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';

// ─── Settle: fade + escena se "asienta" desde 1.04 → 1.0 ────────────────────
// Más profesional que un fade plano — la escena entra con un micro-zoom

const SettleComponent: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const entering = presentationDirection === 'entering';
  const opacity = entering ? presentationProgress : 1 - presentationProgress;
  // Entering: 1.04 → 1.00 (settle in). Exiting: 1.00 → 1.04 (push away)
  const scale = entering
    ? 1.04 - 0.04 * presentationProgress
    : 1.00 + 0.04 * presentationProgress;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale.toFixed(4)})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const sceneSettle = (): TransitionPresentation<Record<string, never>> => ({
  component: SettleComponent,
  props: {},
});

// ─── Slide-settle: slide desde un lado + settle combinados ──────────────────

type SlideProps = { direction: 'from-right' | 'from-left' };

const SlideSettleComponent: React.FC<TransitionPresentationComponentProps<SlideProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const entering = presentationDirection === 'entering';
  const opacity = entering ? presentationProgress : 1 - presentationProgress;
  const dir = passedProps.direction === 'from-right' ? 1 : -1;

  // Desplazamiento horizontal que se suma al settle
  const tx = entering
    ? dir * (1 - presentationProgress) * 72
    : dir * presentationProgress * -72;

  const scale = entering
    ? 1.03 - 0.03 * presentationProgress
    : 1.00 + 0.03 * presentationProgress;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateX(${tx.toFixed(2)}px) scale(${scale.toFixed(4)})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const sceneSlide = (
  direction: 'from-right' | 'from-left' = 'from-right'
): TransitionPresentation<SlideProps> => ({
  component: SlideSettleComponent,
  props: { direction },
});

// ─── Wipe: barrido naranja de izquierda a derecha ───────────────────────────
// La barra naranja (color de marca) barre la pantalla revelando la nueva escena.
// Entering: clip-path revela de izquierda a derecha + barra naranja en el borde.
// Exiting: clip-path oculta de izquierda a derecha.

const WipeComponent: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const entering = presentationDirection === 'entering';

  if (entering) {
    const clipRight = (1 - presentationProgress) * 100;
    const barPos    = presentationProgress * 100;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `inset(0 ${clipRight.toFixed(2)}% 0 0)` }}>
          {children}
        </AbsoluteFill>
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${Math.max(0, barPos - 3.5).toFixed(2)}%`,
          width: '7%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,107,26,0.88) 38%, rgba(255,107,26,0.68) 72%, transparent 100%)',
          boxShadow: '0 0 18px rgba(255,107,26,0.35)',
          pointerEvents: 'none',
        }} />
      </AbsoluteFill>
    );
  }

  const clipLeft = presentationProgress * 100;
  return (
    <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${clipLeft.toFixed(2)}%)` }}>
      {children}
    </AbsoluteFill>
  );
};

export const sceneWipe = (): TransitionPresentation<Record<string, never>> => ({
  component: WipeComponent,
  props: {},
});

// ─── Timings estándar ────────────────────────────────────────────────────────

export const TIMING_SETTLE = linearTiming({ durationInFrames: 10 });
export const TIMING_FAST   = linearTiming({ durationInFrames: 7 });
export const TIMING_WIPE   = linearTiming({ durationInFrames: 16 });
