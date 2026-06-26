import React from 'react';
import {
  AbsoluteFill,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
} from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { Background } from '../components/Background';
import { AccentLine, Badge, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { SceneEnter } from '../components/SceneEnter';
import { PhoneMockup } from '../components/PhoneMockup';
import { IconBadge } from '../components/IconBadge';
import { ChatMockup } from '../components/ChatMockup';
import type { ChatMessage } from '../components/ChatMockup';
import { sceneSettle, sceneSlide, TIMING_SETTLE } from '../components/SceneTransition';
import {
  WhatsAppUnanswered,
  WhatsAppAutoReply,
  GrowthAnalyticsScreen,
  GoogleReviewsScreen,
} from '../components/PhoneScreens';
import { TOKENS, fontFamily } from '../fonts';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { darkTheme, lightTheme } from '../themes';
import type { FullProps } from '../types';

const SAFE_X = 70;

// Glow detrás del teléfono
const PhoneGlow: React.FC<{ accent?: boolean }> = ({ accent = false }) => (
  <div style={{
    position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%',
    background: `radial-gradient(ellipse at 85% 50%, rgba(${accent ? '255,107,26' : '100,100,100'},${accent ? '0.09' : '0.04'}) 0%, transparent 55%)`,
    pointerEvents: 'none',
  }} />
);

// Mensajes de problema para el HookScene
const HOOK_MESSAGES: ChatMessage[] = [
  { text: 'Hola, necesito una cita para mañana',  sent: false, check: 'none' },
  { text: '¿Hay alguien disponible?',              sent: false, check: 'none' },
  { text: 'Buscaré en otro lugar entonces...',     sent: false, check: 'none' },
];

// Particle burst al entrar en step resaltado
const ParticleBurst: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 10) return null;
  const BURSTS = [
    { angle: 0, dist: 130 }, { angle: 60, dist: 110 }, { angle: 120, dist: 125 },
    { angle: 180, dist: 130 }, { angle: 240, dist: 108 }, { angle: 300, dist: 120 },
  ];
  const progress = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const opacity  = interpolate(frame, [3,  10], [0.75, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 20 }}>
      {BURSTS.map((b, i) => {
        const rad = (b.angle * Math.PI) / 180;
        return (
          <div key={i} style={{ position: 'absolute', left: 400 + Math.cos(rad) * b.dist * progress - 5, top: 960 + Math.sin(rad) * b.dist * progress - 5, width: 10, height: 10, borderRadius: '50%', backgroundColor: TOKENS.accentPrimary, opacity, boxShadow: '0 0 10px rgba(255,107,26,0.9)' }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── StepScene: texto izquierda, phone contextual derecha ────────────────────

type PhoneVariant = 'unanswered' | 'flat-analytics' | 'auto-reply' | 'reviews';
const PHONE_BY_STEP: PhoneVariant[] = ['unanswered', 'flat-analytics', 'auto-reply', 'reviews'];

const PhoneContent: React.FC<{ variant: PhoneVariant }> = ({ variant }) => {
  if (variant === 'unanswered')     return <WhatsAppUnanswered />;
  if (variant === 'flat-analytics') return <GrowthAnalyticsScreen mode="flat" />;
  if (variant === 'auto-reply')     return <WhatsAppAutoReply />;
  return <GoogleReviewsScreen />;
};

const StepScene: React.FC<{ step: number; text: string; isHighlight: boolean; durationInFrames: number }> = ({
  step, text, isHighlight, durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const numOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const numY = spring({ frame, fps, config: { damping: 16, stiffness: 100, mass: 0.8 }, from: 32, to: 0 });
  const glow = isHighlight ? 0.5 + Math.sin(frame / 30) * 0.5 : 0;
  const variant = PHONE_BY_STEP[step - 1] ?? 'unanswered';

  const isDark = theme.mode === 'dark';
  const circleBorder = isHighlight ? 'rgba(255,107,26,0.9)' : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)');
  const circleColor  = isHighlight ? TOKENS.accentPrimary : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)');
  const circleBg     = isHighlight ? 'rgba(255,107,26,0.12)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)');

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 30, paddingTop: 130, paddingBottom: 130, gap: 28 }}>
      <PhoneGlow accent={isHighlight} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{
          opacity: numOpacity, transform: `translateY(${numY}px)`,
          width: 60, height: 60, borderRadius: '50%',
          border: `2px solid ${circleBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800,
          color: circleColor,
          backgroundColor: circleBg,
          boxShadow: isHighlight ? `0 0 ${18 + glow * 14}px rgba(255,107,26,${0.22 + glow * 0.20})` : 'none',
        }}>{step}</div>
        <div style={isHighlight ? { filter: 'drop-shadow(0 0 18px rgba(255,107,26,0.40))' } : undefined}>
          <RichText text={text} baseFontSize={50} baseWeight={700} delay={14} textAlign="left" lineHeight={1.3} />
        </div>
      </div>
      <PhoneMockup delay={6} tiltY={-12} width={430}>
        <PhoneContent variant={variant} />
      </PhoneMockup>
      {isHighlight && <ParticleBurst />}
    </AbsoluteFill>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

const HookScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 40, paddingTop: 130, paddingBottom: 130, gap: 32 }}>
    {/* Izquierda: texto del hook */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Badge text="EL ERROR MÁS COMÚN" delay={0} />
      <RichText text={text} baseFontSize={60} baseWeight={800} delay={10} textAlign="left" lineHeight={1.2} />
      <AccentLine delay={24} width={80} />
    </div>
    {/* Derecha: ChatMockup — mensajes sin respuesta que muestran el problema */}
    <div style={{ width: 420, flexShrink: 0 }}>
      <ChatMockup messages={HOOK_MESSAGES} delay={12} stagger={14} width={420} />
    </div>
  </AbsoluteFill>
);

// ─── CTA ─────────────────────────────────────────────────────────────────────

const CtaScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const glowPulse = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
      {/* Check grande sólido como fondo */}
      <div style={{ position: 'absolute', right: 80, top: 260, opacity: 0.20, zIndex: 0 }}>
        <IconBadge icon="check" size={200} variant="solid" delay={6} shape="circle" />
      </div>

      <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
          <Badge text="LA SOLUCIÓN" delay={0} />
          <RichText text={text} baseFontSize={64} baseWeight={800} delay={12} textAlign="center" lineHeight={1.25} />
          <div style={{ marginTop: 8, padding: '16px 40px', borderRadius: 100, border: `1.5px solid rgba(255,107,26,${0.4 + glowPulse * 0.35})`, backgroundColor: 'rgba(255,107,26,0.10)', boxShadow: `0 0 ${16 + glowPulse * 10}px rgba(255,107,26,${0.13 + glowPulse * 0.10})`, fontSize: 22, fontWeight: 700, color: TOKENS.accentPrimary, letterSpacing: 2 }}>
            @DIGITALGROWTH.WR
          </div>
        </div>
      </SceneEnter>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const Full: React.FC<FullProps> = ({ hook, scene1, scene2, scene3, scene4, cta, theme: themeName = 'dark' }) => {
  const { fps } = useVideoConfig();
  const themeObj = themeName === 'light' ? lightTheme : darkTheme;
  const hookDuration  = Math.round(4.5 * fps);
  const sceneDuration = Math.round(4   * fps);
  const ctaDuration   = Math.round(4   * fps);
  const logoDuration  = Math.round(3.5 * fps);

  return (
    <ThemeProvider theme={themeObj}>
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={hookDuration}>
          <HookScene text={hook} durationInFrames={hookDuration} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={1} text={scene1} isHighlight={false} durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={2} text={scene2} isHighlight={false} durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={3} text={scene3} isHighlight durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSlide('from-right')} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={4} text={scene4} isHighlight={false} durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={ctaDuration}>
          <CtaScene text={cta} durationInFrames={ctaDuration} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={logoDuration}>
          <LogoScreen />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
    </ThemeProvider>
  );
};
