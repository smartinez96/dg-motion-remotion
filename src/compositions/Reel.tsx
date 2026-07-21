import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { Background } from '../components/Background';
import { Badge, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { sceneSlide, sceneSettle, TIMING_SETTLE } from '../components/SceneTransition';
import { TOKENS, fontFamily } from '../fonts';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { darkTheme, lightTheme } from '../themes';
import type { ReelProps } from '../types';
import { wordsToFrames } from './Full';
import { getLeadMagnetLabel } from '../leadMagnetLabels';

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

// Card contenedor — cabecera con counter + barra de progreso + cuerpo
const BeatCard: React.FC<{
  beatIndex: number;
  durationInFrames: number;
  glow?: number;
  children: React.ReactNode;
}> = ({ beatIndex, durationInFrames, glow = 0, children }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const cardBg  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const hdrBg   = isDark ? 'rgba(255,107,26,0.14)'  : 'rgba(255,107,26,0.10)';
  const counter = `${String(beatIndex + 1).padStart(2, '0')} / ${String(TOTAL_BEATS).padStart(2, '0')}`;
  const cardGlow = glow > 0
    ? `0 0 ${24 + glow * 14}px rgba(255,107,26,${0.16 + glow * 0.10})`
    : 'none';

  // Barra de progreso: se llena proporcionalmente al frame actual del beat
  const fillPct = Math.min(100, (frame / durationInFrames) * 100);

  return (
    <div style={{
      width: '100%',
      borderRadius: 28,
      border: '1.5px solid rgba(255,107,26,0.40)',
      background: cardBg,
      overflow: 'hidden',
      boxShadow: cardGlow,
    }}>
      {/* Cabecera — counter + barra de progreso */}
      <div style={{
        background: hdrBg,
        padding: '24px 40px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        borderBottom: '1px solid rgba(255,107,26,0.20)',
      }}>
        <span style={{
          fontFamily,
          fontSize: 30,
          fontWeight: 800,
          color: TOKENS.accentPrimary,
          letterSpacing: 6,
          lineHeight: 1,
        }}>
          {counter}
        </span>
        {/* Track */}
        <div style={{
          width: '100%',
          height: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(255,107,26,0.20)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${fillPct}%`,
            borderRadius: 2,
            backgroundColor: TOKENS.accentPrimary,
            boxShadow: '0 0 6px rgba(255,107,26,0.60)',
          }} />
        </div>
      </div>
      {/* Cuerpo */}
      <div style={{
        padding: '44px 52px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}>
        {children}
      </div>
    </div>
  );
};

// Beat genérico — slide-up de entrada + card con cabecera
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
  const scale = interpolate(frame, [0, 18], [0.94, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translateY = interpolate(frame, [0, 18], [28, 0], {
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
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        width: '100%',
      }}>
        <BeatCard beatIndex={beatIndex} durationInFrames={durationInFrames} glow={glow}>
          {badge && <Badge text={badge} delay={0} />}
          <RichText
            text={text}
            baseFontSize={54}
            baseWeight={800}
            delay={0}
            textAlign="center"
            lineHeight={1.30}
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
        </BeatCard>
      </div>
    </AbsoluteFill>
  );
};

// CTA beat — slide-up de entrada + card 05/05 + badge + handle animado
const CtaBeatScene: React.FC<{ text: string; label: string; durationInFrames: number }> = ({ text, label, durationInFrames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const scale   = interpolate(frame, [0, 18], [0.94, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translateY = interpolate(frame, [0, 18], [28, 0], {
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
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>
        <BeatCard beatIndex={4} durationInFrames={durationInFrames}>
          <Badge text="DA EL PRIMER PASO" delay={0} />
          <RichText
            text={text}
            baseFontSize={54}
            baseWeight={800}
            delay={0}
            textAlign="center"
            lineHeight={1.30}
          />
        </BeatCard>

        {label ? (
          <div style={{
            opacity: pillOpacity, transform: `scale(${pillScale})`,
            padding: '14px 28px', borderRadius: 14,
            backgroundColor: 'rgba(255,107,26,0.07)',
            border: '1px solid rgba(255,107,26,0.22)',
            fontSize: 24, fontWeight: 600,
            color: 'rgba(255,255,255,0.62)',
            textAlign: 'center' as const,
            maxWidth: 820, lineHeight: 1.4,
          }}>
            {label}
          </div>
        ) : null}

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

export const Reel: React.FC<ReelProps> = ({ beat1, beat2, beat3, beat4, cta, lead_magnet_label = '', dolor = '', theme: themeName = 'dark' }) => {
  const themeObj = themeName === 'light' ? lightTheme : darkTheme;
  const { fps } = useVideoConfig();
  const label = getLeadMagnetLabel(lead_magnet_label, dolor);
  const MAX_BEAT = Math.round(fps * 7); // cap beats at 7s
  const MAX_CTA  = Math.round(fps * 7); // cap CTA at 7s
  const b1d = Math.min(wordsToFrames(beat1, fps, 2.5), MAX_BEAT);
  const b2d = Math.min(wordsToFrames(beat2, fps, 2.5), MAX_BEAT);
  const b3d = Math.min(wordsToFrames(beat3, fps, 2.5), MAX_BEAT);
  const b4d = Math.min(wordsToFrames(beat4, fps, 2.5), MAX_BEAT);
  const ctaD = Math.min(wordsToFrames(`${cta} ${label}`, fps, 4.5), MAX_CTA);
  const logoD = Math.round(3.0 * fps);

  return (
    <ThemeProvider theme={themeObj}>
      <AbsoluteFill style={{ fontFamily }}>
        <Background />
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={b1d}>
            <BeatScene text={beat1} beatIndex={0} durationInFrames={b1d} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={b2d}>
            <BeatScene text={beat2} beatIndex={1} durationInFrames={b2d} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={b3d}>
            <BeatScene text={beat3} beatIndex={2} isHighlight durationInFrames={b3d} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={b4d}>
            <BeatScene text={beat4} beatIndex={3} durationInFrames={b4d} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={ctaD}>
            <CtaBeatScene text={cta} label={label} durationInFrames={ctaD} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={logoD}>
            <LogoScreen />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </AbsoluteFill>
    </ThemeProvider>
  );
};
