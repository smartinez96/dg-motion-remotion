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
import { sceneSettle, TIMING_SETTLE } from '../components/SceneTransition';
import {
  WhatsAppUnanswered,
  GrowthAnalyticsScreen,
  WhatsAppAutoReply,
} from '../components/PhoneScreens';
import { TOKENS, fontFamily } from '../fonts';
import { ThemeProvider } from '../ThemeContext';
import { darkTheme, lightTheme } from '../themes';
import type { StatsProps } from '../types';

const SAFE_X = 80;

// Glow ambiental detrás de la zona del teléfono
const PhoneGlow: React.FC = () => (
  <div style={{
    position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%',
    background: 'radial-gradient(ellipse at 85% 50%, rgba(255,107,26,0.07) 0%, transparent 55%)',
    pointerEvents: 'none',
  }} />
);

// ─── Hook ────────────────────────────────────────────────────────────────────

const HookScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
    {/* IconBadge de fondo — grande, detrás del texto, depth effect */}
    <div style={{ position: 'absolute', right: 90, bottom: 320, opacity: 0.18, zIndex: 0 }}>
      <IconBadge icon="message" size={220} variant="subtle" delay={10} shape="circle" />
    </div>

    <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
        <Badge text="AUTOMATIZACIÓN IA" delay={0} />
        <RichText text={text} baseFontSize={72} baseWeight={800} delay={12} textAlign="center" lineHeight={1.15} />
        <AccentLine delay={28} width={80} />
      </div>
    </SceneEnter>
  </AbsoluteFill>
);

// ─── Stat: split layout ───────────────────────────────────────────────────────

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
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 30, paddingTop: 130, paddingBottom: 130, gap: 28 }}>
      <PhoneGlow />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ opacity: badgeOpacity }}>
          <AccentLine delay={0} width={48} />
        </div>
        <div style={{ opacity: numOpacity, transform: `translateY(${numY}px)` }}>
          <div style={{
            fontSize: 106, fontWeight: 900, color: TOKENS.accentPrimary,
            lineHeight: 0.95, letterSpacing: -3, fontFamily,
            textShadow: `0 0 55px rgba(255,107,26,0.38)`,
          }}>
            {number}
          </div>
        </div>
        <RichText text={label} baseFontSize={34} baseWeight={500} delay={20} textAlign="left" lineHeight={1.4} />
        <div style={{ opacity: badgeOpacity }}>
          <Badge text={badge} delay={0} />
        </div>
      </div>

      <PhoneMockup delay={6} tiltY={-12} width={430}>
        {phoneType === 'unanswered' ? <WhatsAppUnanswered /> : <GrowthAnalyticsScreen mode="growth" />}
      </PhoneMockup>
    </AbsoluteFill>
  );
};

// ─── Insight: split layout + WhatsApp auto ────────────────────────────────────

const InsightScene: React.FC<{ text: string; badge?: string; durationInFrames: number }> = ({ text, badge, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: SAFE_X, paddingRight: 30, paddingTop: 130, paddingBottom: 130, gap: 28 }}>
    <PhoneGlow />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AccentLine delay={0} width={52} />
      <Badge text={badge || 'LO QUE NADIE TE DICE'} delay={0} />
      <RichText text={text} baseFontSize={48} baseWeight={700} delay={12} textAlign="left" lineHeight={1.25} />
    </div>
    <PhoneMockup delay={8} tiltY={-12} width={430}>
      <WhatsAppAutoReply />
    </PhoneMockup>
  </AbsoluteFill>
);

// ─── CTA ─────────────────────────────────────────────────────────────────────

const CtaScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pillOpacity = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pillScale   = interpolate(frame, [22, 36], [0.88, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const glowPulse   = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
      {/* Check badge sólido como ancla visual */}
      <div style={{ position: 'absolute', left: 70, top: 280, opacity: 0.22, zIndex: 0 }}>
        <IconBadge icon="check" size={180} variant="solid" delay={8} shape="circle" />
      </div>

      <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          <Badge text="LISTO PARA CRECER?" delay={0} />
          <RichText text={text} baseFontSize={52} baseWeight={700} delay={12} textAlign="center" lineHeight={1.3} />
          <div style={{
            opacity: pillOpacity, transform: `scale(${pillScale})`,
            padding: '18px 44px', borderRadius: 100,
            border: `1.5px solid rgba(255,107,26,${0.45 + glowPulse * 0.35})`,
            backgroundColor: 'rgba(255,107,26,0.10)',
            boxShadow: `0 0 ${20 + glowPulse * 12}px rgba(255,107,26,${0.15 + glowPulse * 0.12})`,
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: TOKENS.accentPrimary, letterSpacing: 2 }}>@DIGITALGROWTH.WR</div>
          </div>
        </div>
      </SceneEnter>
    </AbsoluteFill>
  );
};

// ─── Composition ─────────────────────────────────────────────────────────────

export const Stats: React.FC<StatsProps> = ({ hook, stat1, stat2, insight, cta, badge, theme: themeName = 'dark' }) => {
  const { fps } = useVideoConfig();
  const themeObj = themeName === 'light' ? lightTheme : darkTheme;

  const s1  = Math.round(4.5 * fps);
  const s2  = Math.round(5   * fps);
  const s3  = Math.round(5   * fps);
  const s4  = Math.round(4.5 * fps);
  const s5  = Math.round(4   * fps);
  const sLo = Math.round(3.5 * fps);

  return (
    <ThemeProvider theme={themeObj}>
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={s1}>
          <HookScene text={hook} durationInFrames={s1} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={s2}>
          <StatScene number={stat1.number} label={stat1.label} badge="DATO REAL" durationInFrames={s2} phoneType="unanswered" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={s3}>
          <StatScene number={stat2.number} label={stat2.label} badge="RESULTADO PROBADO" durationInFrames={s3} phoneType="growth" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={s4}>
          <InsightScene text={insight} badge={badge} durationInFrames={s4} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={s5}>
          <CtaScene text={cta} durationInFrames={s5} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneSettle()} timing={TIMING_SETTLE} />

        <TransitionSeries.Sequence durationInFrames={sLo}>
          <LogoScreen />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
    </ThemeProvider>
  );
};
