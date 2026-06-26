import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { Background } from '../components/Background';
import { SceneText, AccentLine, Badge, FeaturePill, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { SceneEnter } from '../components/SceneEnter';
import { IconBadge } from '../components/IconBadge';
import { ChatMockup } from '../components/ChatMockup';
import type { ChatMessage } from '../components/ChatMockup';
import { sceneSettle, TIMING_SETTLE } from '../components/SceneTransition';
import { TOKENS, fontFamily } from '../fonts';
import { ThemeProvider } from '../ThemeContext';
import { darkTheme, lightTheme } from '../themes';
import type { IntroProps } from '../types';

const SAFE_X = 80;

const SERVICES = [
  { icon: '🤖', text: 'Agente WhatsApp 24/7',      delay: 18 },
  { icon: '📞', text: 'Recepcionista por voz IA',   delay: 28 },
  { icon: '⭐', text: 'Reseñas automáticas Google', delay: 38 },
  { icon: '⚡', text: 'Automatización de procesos', delay: 48 },
];

// Mensajes de ejemplo para el CTA scene
const CTA_MESSAGES: ChatMessage[] = [
  { text: '¿Cómo puedo automatizar mi negocio?', sent: false, check: 'none' },
  { text: '¡Hola! Te explico en 2 minutos 😊',   sent: true,  check: 'double' },
];

const CtaPill: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const lf    = Math.max(0, frame - delay);
  const opacity = interpolate(lf, [0, 16], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const scale   = interpolate(lf, [0, 16], [0.9, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const glow    = 0.5 + Math.sin(frame / 30) * 0.5;

  return (
    <div style={{ opacity, transform: `scale(${scale})` }}>
      <div style={{ padding: '18px 44px', borderRadius: 100, border: `1.5px solid rgba(255,107,26,${0.5 + glow * 0.3})`, backgroundColor: 'rgba(255,107,26,0.12)', boxShadow: `0 0 ${18 + glow * 10}px rgba(255,107,26,${0.15 + glow * 0.10})`, fontSize: 24, fontWeight: 700, color: TOKENS.accentPrimary, letterSpacing: 1.5 }}>
        @DIGITALGROWTH.WR
      </div>
    </div>
  );
};

export const Intro: React.FC<IntroProps> = ({ line1, line2, tagline, cta, theme: themeName = 'dark' }) => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();
  const themeObj = themeName === 'light' ? lightTheme : darkTheme;

  const s1 = Math.round(4.5 * fps);
  const s2 = Math.round(5   * fps);
  const s3 = Math.round(4   * fps);
  const sL = Math.round(4   * fps);

  const bgIconOpacity = interpolate(frame, [0, 50], [0, 0.03], { extrapolateRight: 'clamp' });

  return (
    <ThemeProvider theme={themeObj}>
    <AbsoluteFill style={{ fontFamily }}>
      <Background />

      {/* Watermark logo — muy sutil */}
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: bgIconOpacity }}>
        <Img src={staticFile('logo-icon-white.png')} style={{ width: 700 }} />
      </AbsoluteFill>

      <TransitionSeries>

        {/* ── Scene 1: Brand reveal ─────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={s1}>
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
            {/* Chart badge decorativo de fondo */}
            <div style={{ position: 'absolute', right: 80, bottom: 300, opacity: 0.15, zIndex: 0 }}>
              <IconBadge icon="chart" size={200} variant="subtle" delay={12} shape="rounded" />
            </div>
            <SceneEnter durationInFrames={s1} exitDuration={0}>
              <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
                <Badge text="AI MARKETING AGENCY" delay={0} />
                <SceneText text={line1} fontSize={92} color={themeObj.textPrimary} fontWeight={900} delay={10} textAlign="center" lineHeight={1.05} letterSpacing={-2} />
                <SceneText text={line2} fontSize={28} color={TOKENS.accentPrimary} fontWeight={600} delay={22} textAlign="center" letterSpacing={1} />
                <AccentLine delay={32} width={100} />
              </div>
            </SceneEnter>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        {/* ── Scene 2: Services ─────────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={s2}>
          <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
            <SceneEnter durationInFrames={s2} exitDuration={0}>
              <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X, gap: 28 }}>
                <Badge text="LO QUE HACEMOS" delay={0} />
                <RichText text={tagline} baseFontSize={46} baseWeight={700} delay={10} textAlign="left" lineHeight={1.25} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                  {SERVICES.map((s, i) => (
                    <FeaturePill key={i} icon={s.icon} text={s.text} delay={s.delay} />
                  ))}
                </div>
              </AbsoluteFill>
            </SceneEnter>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        {/* ── Scene 3: CTA ──────────────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={s3}>
          <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 40, paddingTop: 130, paddingBottom: 130, gap: 32 }}>
            {/* Izquierda: texto CTA */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 36 }}>
              <Badge text="DA EL PRIMER PASO" delay={0} />
              <RichText text={cta} baseFontSize={52} baseWeight={800} delay={10} textAlign="left" lineHeight={1.2} />
              <CtaPill delay={24} />
            </div>
            {/* Derecha: ChatMockup — conversación como elemento visual primario */}
            <div style={{ width: 390, flexShrink: 0 }}>
              <ChatMockup messages={CTA_MESSAGES} delay={12} stagger={16} width={390} />
            </div>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={sL}>
          <LogoScreen />
        </TransitionSeries.Sequence>

      </TransitionSeries>
    </AbsoluteFill>
    </ThemeProvider>
  );
};
