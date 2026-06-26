import React from 'react';
import {
  AbsoluteFill,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { Background } from '../components/Background';
import { AccentLine, Badge, RichText, SceneText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { SceneEnter } from '../components/SceneEnter';
import { PhoneMockup } from '../components/PhoneMockup';
import {
  WhatsAppUnanswered,
  WhatsAppAutoReply,
  GrowthAnalyticsScreen,
  GoogleReviewsScreen,
} from '../components/PhoneScreens';
import { COLORS, fontFamily } from '../fonts';
import type { FullProps } from '../types';

const SAFE_X = 70;
const TRANS = 10;

// Phone-zone ambient glow
const PhoneGlow: React.FC<{ accent?: boolean }> = ({ accent = false }) => (
  <div style={{
    position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%',
    background: `radial-gradient(ellipse at 85% 50%, rgba(${accent ? '232,119,34' : '100,100,100'},${accent ? '0.09' : '0.04'}) 0%, transparent 55%)`,
    pointerEvents: 'none',
  }} />
);

// Particle burst on step entry (kept for highlighted steps)
const ParticleBurst: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 10) return null;

  const BURSTS = [
    { angle: 0, dist: 130 }, { angle: 60, dist: 110 }, { angle: 120, dist: 125 },
    { angle: 180, dist: 130 }, { angle: 240, dist: 108 }, { angle: 300, dist: 120 },
  ];

  const progress = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const opacity = interpolate(frame, [3, 10], [0.75, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 20 }}>
      {BURSTS.map((b, i) => {
        const rad = (b.angle * Math.PI) / 180;
        const x = 400 + Math.cos(rad) * b.dist * progress;
        const y = 960 + Math.sin(rad) * b.dist * progress;
        return (
          <div key={i} style={{ position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.orange, opacity, boxShadow: '0 0 10px rgba(232,119,34,0.9)' }} />
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Step scene: split left text + right phone ───────────────────────────────

type PhoneVariant = 'unanswered' | 'flat-analytics' | 'auto-reply' | 'reviews';

const PHONE_BY_STEP: PhoneVariant[] = ['unanswered', 'flat-analytics', 'auto-reply', 'reviews'];

const PhoneContent: React.FC<{ variant: PhoneVariant }> = ({ variant }) => {
  if (variant === 'unanswered') return <WhatsAppUnanswered />;
  if (variant === 'flat-analytics') return <GrowthAnalyticsScreen mode="flat" />;
  if (variant === 'auto-reply') return <WhatsAppAutoReply />;
  return <GoogleReviewsScreen />;
};

const StepScene: React.FC<{
  step: number;
  text: string;
  isHighlight: boolean;
  durationInFrames: number;
}> = ({ step, text, isHighlight, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const numY = spring({ frame, fps, config: { damping: 16, stiffness: 100, mass: 0.8 }, from: 32, to: 0 });
  const glow = isHighlight ? 0.5 + Math.sin(frame / 30) * 0.5 : 0;

  const variant = PHONE_BY_STEP[step - 1] ?? 'unanswered';

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 40, gap: 22 }}>
      <PhoneGlow accent={isHighlight} />

      {/* Left: step number + text */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div style={{
          opacity: numOpacity,
          transform: `translateY(${numY}px)`,
          width: 60, height: 60, borderRadius: '50%',
          border: `2px solid ${isHighlight ? 'rgba(232,119,34,0.9)' : 'rgba(255,255,255,0.18)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800,
          color: isHighlight ? COLORS.orange : 'rgba(255,255,255,0.45)',
          backgroundColor: isHighlight ? 'rgba(232,119,34,0.12)' : 'rgba(255,255,255,0.04)',
          boxShadow: isHighlight ? `0 0 ${18 + glow * 14}px rgba(232,119,34,${0.22 + glow * 0.20})` : 'none',
        }}>
          {step}
        </div>

        <SceneText
          text={text}
          fontSize={50}
          color={isHighlight ? COLORS.orange : COLORS.primary}
          fontWeight={700}
          delay={14}
          textAlign="left"
          lineHeight={1.3}
          textShadow={isHighlight ? '0 0 32px rgba(232,119,34,0.55)' : undefined}
        />
      </div>

      {/* Right: phone */}
      <PhoneMockup delay={6} tiltY={-13} width={316}>
        <PhoneContent variant={variant} />
      </PhoneMockup>

      {isHighlight && <ParticleBurst />}
    </AbsoluteFill>
  );
};

// ─── Hook: full-width ────────────────────────────────────────────────────────

const HookScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
    <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <Badge text="EL ERROR MAS COMUN" delay={0} />
        <RichText text={text} baseFontSize={68} baseWeight={800} delay={12} textAlign="center" lineHeight={1.18} />
        <AccentLine delay={28} width={90} />
      </div>
    </SceneEnter>
  </AbsoluteFill>
);

// ─── CTA: full-width ─────────────────────────────────────────────────────────

const CtaScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const glowPulse = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
      <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
          <Badge text="LA SOLUCION" delay={0} />
          <RichText text={text} baseFontSize={64} baseWeight={800} delay={12} textAlign="center" lineHeight={1.25} />
          <div style={{ marginTop: 8, padding: '16px 40px', borderRadius: 100, border: `1.5px solid rgba(232,119,34,${0.4 + glowPulse * 0.35})`, backgroundColor: 'rgba(232,119,34,0.10)', boxShadow: `0 0 ${16 + glowPulse * 10}px rgba(232,119,34,${0.13 + glowPulse * 0.10})`, fontSize: 22, fontWeight: 700, color: COLORS.orange, letterSpacing: 2 }}>
            @DIGITALGROWTH.WR
          </div>
        </div>
      </SceneEnter>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const Full: React.FC<FullProps> = ({ hook, scene1, scene2, scene3, scene4, cta }) => {
  const { fps } = useVideoConfig();

  const hookDuration  = Math.round(3 * fps);
  const sceneDuration = Math.round(2.5 * fps);
  const ctaDuration   = Math.round(2.5 * fps);
  const logoDuration  = Math.round(3.5 * fps);

  const slideTiming = linearTiming({ durationInFrames: TRANS });
  const fadeTiming  = linearTiming({ durationInFrames: TRANS });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      <TransitionSeries>

        <TransitionSeries.Sequence durationInFrames={hookDuration}>
          <HookScene text={hook} durationInFrames={hookDuration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={1} text={scene1} isHighlight={false} durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={2} text={scene2} isHighlight={false} durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={3} text={scene3} isHighlight durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={4} text={scene4} isHighlight={false} durationInFrames={sceneDuration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={ctaDuration}>
          <CtaScene text={cta} durationInFrames={ctaDuration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={logoDuration}>
          <LogoScreen />
        </TransitionSeries.Sequence>

      </TransitionSeries>
    </AbsoluteFill>
  );
};
