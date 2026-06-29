import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { Background } from '../components/Background';
import { Badge, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { sceneSettle, TIMING_SETTLE } from '../components/SceneTransition';
import { TOKENS, fontFamily } from '../fonts';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { darkTheme, lightTheme } from '../themes';
import type { ReelProps } from '../types';

const TOTAL_BEATS = 5;

// Indicador de progreso — barra que crece en el beat activo
const BeatDots: React.FC<{ current: number }> = ({ current }) => {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';
  return (
    <div style={{
      position: 'absolute', top: 72, left: 80, right: 80,
      display: 'flex', justifyContent: 'center', gap: 10, zIndex: 100,
    }}>
      {Array.from({ length: TOTAL_BEATS }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 36 : 8,
          height: 6,
          borderRadius: 3,
          backgroundColor: i === current
            ? TOKENS.accentPrimary
            : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'),
          boxShadow: i === current ? '0 0 8px rgba(255,107,26,0.65)' : 'none',
          transition: 'width 0.15s',
        }} />
      ))}
    </div>
  );
};

// Beat genérico — texto puro centrado con flash-in
const BeatScene: React.FC<{
  text: string;
  beatIndex: number;
  isHighlight?: boolean;
  badge?: string;
  durationInFrames: number;
}> = ({ text, beatIndex, isHighlight = false, badge, durationInFrames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const scale = interpolate(frame, [0, 16], [0.91, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const lineScale = interpolate(frame, [14, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const glow = isHighlight ? 0.5 + Math.sin(frame / 26) * 0.5 : 0;

  return (
    <AbsoluteFill style={{
      fontFamily,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingLeft: 72, paddingRight: 72,
    }}>
      <BeatDots current={beatIndex} />

      <div style={{
        opacity, transform: `scale(${scale})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        filter: isHighlight
          ? `drop-shadow(0 0 ${22 + glow * 12}px rgba(255,107,26,${0.22 + glow * 0.16}))`
          : undefined,
      }}>
        {badge && <Badge text={badge} delay={0} />}
        <RichText
          text={text}
          baseFontSize={isHighlight ? 100 : 88}
          baseWeight={900}
          delay={0}
          textAlign="center"
          lineHeight={1.08}
        />
        {isHighlight && (
          <div style={{
            width: 80, height: 4, borderRadius: 2,
            backgroundColor: TOKENS.accentPrimary,
            transformOrigin: 'center',
            transform: `scaleX(${lineScale})`,
            boxShadow: `0 0 ${14 + glow * 10}px rgba(255,107,26,${0.55 + glow * 0.30})`,
          }} />
        )}
      </div>
    </AbsoluteFill>
  );
};

// CTA beat — texto + handle + badge de acción
const CtaBeatScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const scale   = interpolate(frame, [0, 16], [0.91, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const pillOpacity = interpolate(frame, [20, 34], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const pillScale = interpolate(frame, [20, 34], [0.88, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const glow = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill style={{
      fontFamily,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingLeft: 72, paddingRight: 72,
    }}>
      <BeatDots current={4} />

      <div style={{
        opacity, transform: `scale(${scale})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40,
      }}>
        <Badge text="DA EL PRIMER PASO" delay={0} />
        <RichText
          text={text}
          baseFontSize={84}
          baseWeight={900}
          delay={0}
          textAlign="center"
          lineHeight={1.1}
        />
        <div style={{
          opacity: pillOpacity, transform: `scale(${pillScale})`,
          padding: '18px 44px', borderRadius: 100,
          border: `1.5px solid rgba(255,107,26,${0.45 + glow * 0.35})`,
          backgroundColor: 'rgba(255,107,26,0.10)',
          boxShadow: `0 0 ${18 + glow * 12}px rgba(255,107,26,${0.14 + glow * 0.12})`,
          fontSize: 26, fontWeight: 700,
          color: TOKENS.accentPrimary,
          letterSpacing: 1.5,
        }}>
          @DIGITALGROWTH.WR
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const Reel: React.FC<ReelProps> = ({ beat1, beat2, beat3, beat4, cta, theme: themeName = 'dark' }) => {
  const themeObj = themeName === 'light' ? lightTheme : darkTheme;
  const bd = Math.round(3   * 30);
  const cd = Math.round(3.5 * 30);
  const ld = Math.round(3.5 * 30);

  return (
    <ThemeProvider theme={themeObj}>
      <AbsoluteFill style={{ fontFamily }}>
        <Background />
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={bd}>
            <BeatScene text={beat1} beatIndex={0} durationInFrames={bd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={bd}>
            <BeatScene text={beat2} beatIndex={1} durationInFrames={bd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={bd}>
            <BeatScene text={beat3} beatIndex={2} isHighlight durationInFrames={bd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={bd}>
            <BeatScene text={beat4} beatIndex={3} durationInFrames={bd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={cd}>
            <CtaBeatScene text={cta} durationInFrames={cd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={ld}>
            <LogoScreen />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>
    </ThemeProvider>
  );
};
