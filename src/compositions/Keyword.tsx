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
import { Badge, RichText, AccentLine } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { sceneSettle, TIMING_SETTLE } from '../components/SceneTransition';
import { TOKENS, fontFamily } from '../fonts';
import { ThemeProvider } from '../ThemeContext';
import { darkTheme, lightTheme } from '../themes';
import type { KeywordProps } from '../types';
import { wordsToFrames } from './Full';
import { getLeadMagnetLabel } from '../leadMagnetLabels';

const HookScene: React.FC<{ text: string; durationInFrames: number }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const scale   = interpolate(frame, [0, 18], [0.92, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 72, paddingRight: 72 }}>
      <div style={{ opacity, transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <Badge text="¿TE PASA ESTO?" delay={0} />
        <RichText text={text} baseFontSize={84} baseWeight={900} delay={8} textAlign="center" lineHeight={1.1} />
        <AccentLine delay={22} width={72} />
      </div>
    </AbsoluteFill>
  );
};

const ProblemaScene: React.FC<{ text: string; durationInFrames: number }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity     = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const translateY  = interpolate(frame, [0, 18], [32, 0], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 72, paddingRight: 72 }}>
      <div style={{ opacity, transform: `translateY(${translateY}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <Badge text="EL COSTO REAL" delay={0} />
        <RichText text={text} baseFontSize={58} baseWeight={800} delay={10} textAlign="center" lineHeight={1.25} />
      </div>
    </AbsoluteFill>
  );
};

const PruebaScene: React.FC<{ text: string; durationInFrames: number }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const scale   = interpolate(frame, [0, 18], [0.94, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 72, paddingRight: 72 }}>
      <div style={{ opacity, transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <Badge text="DATO REAL" delay={0} />
        <RichText text={text} baseFontSize={62} baseWeight={800} delay={10} textAlign="center" lineHeight={1.25} />
        <AccentLine delay={24} width={60} />
      </div>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{ cta: string; lead_magnet_label: string; durationInFrames: number }> = ({ cta, lead_magnet_label }) => {
  const frame = useCurrentFrame();
  const opacity     = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const pillOpacity = interpolate(frame, [24, 38], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pillScale   = interpolate(frame, [24, 38], [0.88, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const glow = 0.5 + Math.sin(frame / 26) * 0.5;

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 72, paddingRight: 72 }}>
      <div style={{ opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <Badge text="TU TURNO" delay={0} />
        <RichText text={cta} baseFontSize={54} baseWeight={800} delay={8} textAlign="center" lineHeight={1.25} />
        <div style={{
          opacity: pillOpacity,
          transform: `scale(${pillScale})`,
          padding: '14px 32px',
          borderRadius: 14,
          backgroundColor: 'rgba(255,107,26,0.07)',
          border: '1px solid rgba(255,107,26,0.22)',
          fontSize: 28,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.60)',
          textAlign: 'center' as const,
          maxWidth: 820,
          lineHeight: 1.4,
        }}>
          {lead_magnet_label}
        </div>
        <div style={{
          opacity: pillOpacity,
          transform: `scale(${pillScale})`,
          padding: '18px 44px',
          borderRadius: 100,
          border: `1.5px solid rgba(255,107,26,${0.45 + glow * 0.35})`,
          backgroundColor: 'rgba(255,107,26,0.10)',
          boxShadow: `0 0 ${18 + glow * 12}px rgba(255,107,26,${0.14 + glow * 0.12})`,
          fontSize: 26,
          fontWeight: 700,
          color: TOKENS.accentPrimary,
          letterSpacing: 1.5,
        }}>
          @DIGITALGROWTH.WR
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Keyword: React.FC<KeywordProps> = ({
  hook, problema, prueba, cta, lead_magnet_label = '', dolor = '', theme: themeName = 'dark',
}) => {
  const themeObj = themeName === 'light' ? lightTheme : darkTheme;
  const { fps } = useVideoConfig();
  const label = getLeadMagnetLabel(lead_magnet_label, dolor);
  const MAX_K = Math.round(fps * 7);
  const hd = Math.min(wordsToFrames(hook, fps, 3.0), MAX_K);
  const pd = Math.min(wordsToFrames(problema, fps, 3.0), MAX_K);
  const rd = Math.min(wordsToFrames(prueba, fps, 3.0), MAX_K);
  const cd = Math.min(wordsToFrames(`${cta} ${label}`, fps, 4.5), MAX_K);
  const ld = Math.round(3.0 * fps);

  return (
    <ThemeProvider theme={themeObj}>
      <AbsoluteFill style={{ fontFamily }}>
        <Background />
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={hd}>
            <HookScene text={hook} durationInFrames={hd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={pd}>
            <ProblemaScene text={problema} durationInFrames={pd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={rd}>
            <PruebaScene text={prueba} durationInFrames={rd} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

          <TransitionSeries.Sequence durationInFrames={cd}>
            <CtaScene cta={cta} lead_magnet_label={label} durationInFrames={cd} />
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
