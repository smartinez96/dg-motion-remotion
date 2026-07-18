import React from 'react';
import {
  AbsoluteFill,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { Background } from '../components/Background';
import { AccentLine, Badge, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { SceneEnter } from '../components/SceneEnter';
import { PhoneMockup } from '../components/PhoneMockup';
import { IconBadge } from '../components/IconBadge';
import { sceneWipe, sceneSettle, TIMING_WIPE, TIMING_SETTLE } from '../components/SceneTransition';
import {
  WhatsAppUnanswered,
  GrowthAnalyticsScreen,
  WhatsAppAutoReply,
} from '../components/PhoneScreens';
import { TOKENS, fontFamily } from '../fonts';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { darkTheme, lightTheme } from '../themes';
import type { StatsProps } from '../types';
import { wordsToFrames } from './Full';

const SAFE_X = 80;
const TOTAL_SCENES = 5;

// ─── Utilities ───────────────────────────────────────────────────────────────

function parseNumber(s: string): { value: number; suffix: string } {
  const m = s.match(/^([\d.]+)(.*)$/);
  return m ? { value: parseFloat(m[1]), suffix: m[2] } : { value: 0, suffix: s };
}

// ─── Shared components ───────────────────────────────────────────────────────

const PhoneGlow: React.FC = () => (
  <div style={{
    position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%',
    background: 'radial-gradient(ellipse at 85% 50%, rgba(255,107,26,0.07) 0%, transparent 55%)',
    pointerEvents: 'none',
  }} />
);

// 5 puntos de progreso — el activo se expande en naranja
const StatsDots: React.FC<{ current: number }> = ({ current }) => {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';
  return (
    <div style={{
      position: 'absolute', top: 72, left: 80, right: 80,
      display: 'flex', justifyContent: 'center', gap: 10, zIndex: 100,
    }}>
      {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 36 : 8,
          height: 6,
          borderRadius: 3,
          backgroundColor: i === current
            ? TOKENS.accentPrimary
            : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'),
          boxShadow: i === current ? '0 0 8px rgba(255,107,26,0.65)' : 'none',
        }} />
      ))}
    </div>
  );
};

// Texto palabra por palabra — cada palabra entra con translateY + fade.
// Soporta *palabra* para colorear en naranja.
const WordByWord: React.FC<{
  text: string;
  startFrame?: number;
  wordDelay?: number;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
}> = ({ text, startFrame = 0, wordDelay = 4, fontSize, fontWeight, lineHeight = 1.4 }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const baseColor = theme.mode === 'dark' ? 'rgba(240,240,240,0.72)' : 'rgba(10,10,10,0.65)';
  const words = text.split(' ');

  return (
    <div style={{ fontSize, fontWeight, lineHeight, fontFamily }}>
      {words.map((word, i) => {
        const isHighlight = word.startsWith('*') && word.endsWith('*');
        const displayWord = isHighlight ? word.slice(1, -1) : word;
        const color = isHighlight ? TOKENS.accentPrimary : baseColor;
        const wf = startFrame + i * wordDelay;
        const op = interpolate(frame, [wf, wf + 7], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        const ty = interpolate(frame, [wf, wf + 10], [7, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        return (
          <React.Fragment key={i}>
            <span style={{ display: 'inline-block', opacity: op, transform: `translateY(${ty}px)`, color }}>
              {displayWord}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

const HookScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => (
  <AbsoluteFill style={{ fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
    <StatsDots current={0} />
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

// ─── Stat: split layout con count-up + blur-resolve + stagger cascade ────────

const StatScene: React.FC<{
  number: string;
  label: string;
  badge: string;
  durationInFrames: number;
  phoneType: 'unanswered' | 'growth';
  sceneIndex: number;
}> = ({ number, label, badge, durationInFrames, phoneType, sceneIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { value: numValue, suffix: numSuffix } = parseNumber(number);

  // Stagger 1 — AccentLine: frame 0, wipe scaleX 0→1
  const lineOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const lineScale   = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Stagger 2 — Número: frame 6, count-up + blur-resolve
  const countOffset = Math.max(0, frame - 6);
  const countDur    = Math.round(fps * 1.3);
  const countProg   = interpolate(countOffset, [0, countDur], [0, 1], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  const displayValue = Math.round(countProg * numValue);
  const blur         = interpolate(countOffset, [0, Math.round(fps * 0.65)], [10, 0], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.quad),
  });
  const numOpacity = interpolate(frame, [6, 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Stagger 4 — Badge: frame 28
  const badgeOpacity = interpolate(frame, [28, 38], [0, 1], { extrapolateRight: 'clamp' });
  const badgeY       = interpolate(frame, [28, 42], [8, 0], {
    extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{
      fontFamily,
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      paddingLeft: SAFE_X, paddingRight: 30, paddingTop: 130, paddingBottom: 130, gap: 28,
    }}>
      <StatsDots current={sceneIndex} />
      <PhoneGlow />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* AccentLine — stagger 1 */}
        <div style={{
          opacity: lineOpacity,
          transformOrigin: 'left center',
          transform: `scaleX(${lineScale.toFixed(4)})`,
        }}>
          <div style={{
            width: 48, height: 3, borderRadius: 2,
            backgroundColor: TOKENS.accentPrimary,
            boxShadow: '0 0 6px rgba(255,107,26,0.50)',
          }} />
        </div>

        {/* Número — stagger 2: count-up + blur-resolve */}
        <div style={{ opacity: numOpacity, filter: `blur(${blur.toFixed(2)}px)` }}>
          <div style={{
            fontSize: 106, fontWeight: 900, color: TOKENS.accentPrimary,
            lineHeight: 0.95, letterSpacing: -3, fontFamily,
            textShadow: '0 0 55px rgba(255,107,26,0.38)',
          }}>
            {displayValue}{numSuffix}
          </div>
        </div>

        {/* Label — stagger 3: word-by-word desde frame 18 */}
        <WordByWord
          text={label}
          startFrame={18}
          wordDelay={4}
          fontSize={34}
          fontWeight={500}
          lineHeight={1.4}
        />

        {/* Badge — stagger 4 */}
        <div style={{ opacity: badgeOpacity, transform: `translateY(${badgeY.toFixed(2)}px)` }}>
          <Badge text={badge} delay={0} />
        </div>
      </div>

      <PhoneMockup delay={6} tiltY={-12} width={430}>
        {phoneType === 'unanswered' ? <WhatsAppUnanswered /> : <GrowthAnalyticsScreen mode="growth" />}
      </PhoneMockup>
    </AbsoluteFill>
  );
};

// ─── Insight: split layout + stagger cascade + word-by-word ─────────────────

const InsightScene: React.FC<{ text: string; badge?: string; durationInFrames: number }> = ({ text, badge, durationInFrames }) => {
  const frame = useCurrentFrame();

  const lineOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const lineScale   = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const badgeOpacity = interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' });
  const badgeY       = interpolate(frame, [8, 20], [8, 0], {
    extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill style={{
      fontFamily,
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      paddingLeft: SAFE_X, paddingRight: 30, paddingTop: 130, paddingBottom: 130, gap: 28,
    }}>
      <StatsDots current={3} />
      <PhoneGlow />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* AccentLine — stagger 1 */}
        <div style={{
          opacity: lineOpacity,
          transformOrigin: 'left center',
          transform: `scaleX(${lineScale.toFixed(4)})`,
        }}>
          <div style={{
            width: 52, height: 3, borderRadius: 2,
            backgroundColor: TOKENS.accentPrimary,
            boxShadow: '0 0 6px rgba(255,107,26,0.50)',
          }} />
        </div>

        {/* Badge — stagger 2 */}
        <div style={{ opacity: badgeOpacity, transform: `translateY(${badgeY.toFixed(2)}px)` }}>
          <Badge text={badge || 'LO QUE NADIE TE DICE'} delay={0} />
        </div>

        {/* Texto — stagger 3: word-by-word desde frame 18 */}
        <WordByWord
          text={text}
          startFrame={18}
          wordDelay={4}
          fontSize={48}
          fontWeight={700}
          lineHeight={1.25}
        />
      </div>

      <PhoneMockup delay={8} tiltY={-12} width={430}>
        <WhatsAppAutoReply />
      </PhoneMockup>
    </AbsoluteFill>
  );
};

// ─── CTA ─────────────────────────────────────────────────────────────────────

const CtaScene: React.FC<{ text: string; durationInFrames: number }> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pillOpacity = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const pillScale   = interpolate(frame, [22, 36], [0.88, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const glowPulse   = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
      <StatsDots current={4} />
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

  const s1  = wordsToFrames(hook, fps, 4.0);
  const s2  = wordsToFrames(stat1.label, fps, 4.5);
  const s3  = wordsToFrames(stat2.label, fps, 4.5);
  const s4  = wordsToFrames(insight, fps, 4.0);
  const s5  = wordsToFrames(cta, fps, 4.0);
  const sLo = Math.round(3.0 * fps);

  return (
    <ThemeProvider theme={themeObj}>
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={s1}>
          <HookScene text={hook} durationInFrames={s1} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneWipe()} timing={TIMING_WIPE} />

        <TransitionSeries.Sequence durationInFrames={s2}>
          <StatScene number={stat1.number} label={stat1.label} badge="DATO REAL" durationInFrames={s2} phoneType="unanswered" sceneIndex={1} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneWipe()} timing={TIMING_WIPE} />

        <TransitionSeries.Sequence durationInFrames={s3}>
          <StatScene number={stat2.number} label={stat2.label} badge="RESULTADO PROBADO" durationInFrames={s3} phoneType="growth" sceneIndex={2} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneWipe()} timing={TIMING_WIPE} />

        <TransitionSeries.Sequence durationInFrames={s4}>
          <InsightScene text={insight} badge={badge} durationInFrames={s4} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={sceneWipe()} timing={TIMING_WIPE} />

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
