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
import { fade } from '@remotion/transitions/fade';
import { Background } from '../components/Background';
import { AccentLine, Badge, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { SceneEnter } from '../components/SceneEnter';
import { PhoneMockup } from '../components/PhoneMockup';
import {
  WhatsAppUnanswered,
  GrowthAnalyticsScreen,
  WhatsAppAutoReply,
} from '../components/PhoneScreens';
import { COLORS, fontFamily } from '../fonts';
import type { StatsProps } from '../types';

const SAFE_X = 80;
const TRANS = 8;

// Ambient glow behind phone zone (right 55% of canvas)
const PhoneGlow: React.FC = () => (
  <div style={{
    position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%',
    background: 'radial-gradient(ellipse at 85% 50%, rgba(232,119,34,0.07) 0%, transparent 55%)',
    pointerEvents: 'none',
  }} />
);

// ─── Hook: full-width ────────────────────────────────────────────────────────

const HookScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
    <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <Badge text="AUTOMATIZACION IA" delay={0} />
        <RichText text={text} baseFontSize={72} baseWeight={800} delay={12} textAlign="center" lineHeight={1.15} />
        <AccentLine delay={28} width={80} />
      </div>
    </SceneEnter>
  </AbsoluteFill>
);

// ─── Stat: split layout — número a la izquierda, phone a la derecha ──────────

const StatScene: React.FC<{
  number: string;
  label: string;
  badge: string;
  durationInFrames: number;
  phoneType: 'unanswered' | 'growth';
}> = ({ number, label, badge, durationInFrames, phoneType }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const numY = spring({ frame, fps, config: { damping: 14, stiffness: 90, mass: 0.9 }, from: 40, to: 0 });
  const badgeOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 44, gap: 24 }}>
      <PhoneGlow />

      {/* Left: stat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ opacity: badgeOpacity }}>
          <AccentLine delay={0} width={48} />
        </div>
        <div style={{ opacity: numOpacity, transform: `translateY(${numY}px)` }}>
          <div style={{
            fontSize: 106, fontWeight: 900, color: COLORS.orange,
            lineHeight: 0.95, letterSpacing: -3, fontFamily,
            textShadow: '0 0 55px rgba(232,119,34,0.38)',
          }}>
            {number}
          </div>
        </div>
        <RichText text={label} baseFontSize={34} baseWeight={500} delay={20} textAlign="left" lineHeight={1.4} />
        <div style={{ opacity: badgeOpacity }}>
          <Badge text={badge} delay={0} />
        </div>
      </div>

      {/* Right: phone */}
      <PhoneMockup delay={6} tiltY={-13} width={330}>
        {phoneType === 'unanswered' ? <WhatsAppUnanswered /> : <GrowthAnalyticsScreen mode="growth" />}
      </PhoneMockup>
    </AbsoluteFill>
  );
};

// ─── Insight: split layout — texto izquierda, WhatsApp auto derecha ──────────

const InsightScene: React.FC<{
  text: string;
  badge?: string;
  durationInFrames: number;
}> = ({ text, badge, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 44, gap: 24 }}>
    <PhoneGlow />

    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AccentLine delay={0} width={52} />
      <Badge text={badge || 'LO QUE NADIE TE DICE'} delay={0} />
      <RichText text={text} baseFontSize={48} baseWeight={700} delay={12} textAlign="left" lineHeight={1.25} />
    </div>

    <PhoneMockup delay={8} tiltY={-13} width={330}>
      <WhatsAppAutoReply />
    </PhoneMockup>
  </AbsoluteFill>
);

// ─── CTA: full-width ─────────────────────────────────────────────────────────

const CtaScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pillOpacity = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pillScale = interpolate(frame, [22, 36], [0.88, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const glowPulse = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
      <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          <Badge text="LISTO PARA CRECER?" delay={0} />
          <RichText text={text} baseFontSize={52} baseWeight={700} delay={12} textAlign="center" lineHeight={1.3} />
          <div style={{ opacity: pillOpacity, transform: `scale(${pillScale})`, padding: '18px 44px', borderRadius: 100, border: `1.5px solid rgba(232,119,34,${0.45 + glowPulse * 0.35})`, backgroundColor: 'rgba(232,119,34,0.10)', boxShadow: `0 0 ${20 + glowPulse * 12}px rgba(232,119,34,${0.15 + glowPulse * 0.12})` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.orange, letterSpacing: 2 }}>@DIGITALGROWTH.WR</div>
          </div>
        </div>
      </SceneEnter>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const Stats: React.FC<StatsProps> = ({ hook, stat1, stat2, insight, cta, badge }) => {
  const { fps } = useVideoConfig();

  const s1Duration = Math.round(3 * fps);
  const s2Duration = Math.round(3.5 * fps);
  const s3Duration = Math.round(3.5 * fps);
  const s4Duration = Math.round(3 * fps);
  const s5Duration = Math.round(2.5 * fps);
  const logoDuration = Math.round(3.5 * fps);

  const timing = linearTiming({ durationInFrames: TRANS });

  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={s1Duration}>
          <HookScene text={hook} durationInFrames={s1Duration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={s2Duration}>
          <StatScene number={stat1.number} label={stat1.label} badge="DATO REAL" durationInFrames={s2Duration} phoneType="unanswered" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={s3Duration}>
          <StatScene number={stat2.number} label={stat2.label} badge="RESULTADO PROBADO" durationInFrames={s3Duration} phoneType="growth" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={s4Duration}>
          <InsightScene text={insight} badge={badge} durationInFrames={s4Duration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={s5Duration}>
          <CtaScene text={cta} durationInFrames={s5Duration} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={timing} />

        <TransitionSeries.Sequence durationInFrames={logoDuration}>
          <LogoScreen />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
