import React from 'react';
import {
  AbsoluteFill,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { Background } from '../components/Background';
import { AccentLine, Badge, RichText, SceneText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { SceneEnter } from '../components/SceneEnter';
import { ChatMockupBg } from '../components/ChatMockupBg';
import { CheckCircleBg } from '../components/CheckCircleBg';
import { COLORS, fontFamily } from '../fonts';
import type { FullProps } from '../types';

const SAFE_X = 80;
const TRANS = 10;

// Orange particle burst on step scene entrance
const ParticleBurst: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 10) return null;

  const BURSTS = [
    { angle: 0, dist: 140 }, { angle: 45, dist: 115 }, { angle: 90, dist: 130 },
    { angle: 135, dist: 155 }, { angle: 180, dist: 140 }, { angle: 225, dist: 110 },
    { angle: 270, dist: 135 }, { angle: 315, dist: 120 },
  ];

  const progress = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const opacity = interpolate(frame, [3, 10], [0.7, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {BURSTS.map((b, i) => {
        const rad = (b.angle * Math.PI) / 180;
        const x = 540 + Math.cos(rad) * b.dist * progress;
        const y = 960 + Math.sin(rad) * b.dist * progress;
        return (
          <div key={i} style={{ position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.orange, opacity, boxShadow: '0 0 10px rgba(232,119,34,0.9)' }} />
        );
      })}
    </AbsoluteFill>
  );
};

type VisualElement = 'chat' | 'check' | null;

const StepScene: React.FC<{
  step: number;
  text: string;
  isHighlight: boolean;
  durationInFrames: number;
  visualElement?: VisualElement;
}> = ({ step, text, isHighlight, durationInFrames, visualElement }) => {
  const frame = useCurrentFrame();

  const numOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const numScale = interpolate(frame, [0, 14], [0.7, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const glow = isHighlight ? 0.5 + Math.sin(frame / 30) * 0.5 : 0;

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
      {visualElement === 'chat' && <ChatMockupBg delay={8} />}
      {visualElement === 'check' && <CheckCircleBg delay={8} />}
      <SceneEnter durationInFrames={durationInFrames} exitDuration={0}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <div style={{ opacity: numOpacity, transform: `scale(${numScale})`, width: 72, height: 72, borderRadius: '50%', border: `2px solid ${isHighlight ? 'rgba(232,119,34,0.9)' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: isHighlight ? COLORS.orange : 'rgba(255,255,255,0.5)', backgroundColor: isHighlight ? 'rgba(232,119,34,0.12)' : 'rgba(255,255,255,0.04)', boxShadow: isHighlight ? `0 0 ${18 + glow * 12}px rgba(232,119,34,${0.2 + glow * 0.2})` : 'none' }}>
            {step}
          </div>
          <SceneText text={text} fontSize={58} color={isHighlight ? COLORS.orange : COLORS.primary} fontWeight={700} delay={12} textAlign="center" lineHeight={1.25} textShadow={isHighlight ? '0 0 28px rgba(232,119,34,0.6), 0 0 56px rgba(232,119,34,0.3)' : undefined} />
        </div>
      </SceneEnter>
      <ParticleBurst />
    </AbsoluteFill>
  );
};

export const Full: React.FC<FullProps> = ({ hook, scene1, scene2, scene3, scene4, cta }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const hookDuration = Math.round(3 * fps);
  const sceneDuration = Math.round(2.5 * fps);
  const ctaDuration = Math.round(2.5 * fps);
  const logoDuration = Math.round(3.5 * fps);

  const ctaGlow = 0.5 + Math.sin(frame / 28) * 0.5;

  const slideTiming = linearTiming({ durationInFrames: TRANS });
  const fadeTiming = linearTiming({ durationInFrames: TRANS });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      <TransitionSeries>

        {/* Hook */}
        <TransitionSeries.Sequence durationInFrames={hookDuration}>
          <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
            <SceneEnter durationInFrames={hookDuration} exitDuration={0}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
                <Badge text="EL ERROR MAS COMUN" delay={0} />
                <RichText text={hook} baseFontSize={68} baseWeight={800} delay={12} textAlign="center" lineHeight={1.18} />
                <AccentLine delay={28} width={90} />
              </div>
            </SceneEnter>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={1} text={scene1} isHighlight={false} durationInFrames={sceneDuration} visualElement="chat" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={2} text={scene2} isHighlight={false} durationInFrames={sceneDuration} visualElement="chat" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={3} text={scene3} isHighlight durationInFrames={sceneDuration} visualElement="check" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={slideTiming} />

        <TransitionSeries.Sequence durationInFrames={sceneDuration}>
          <StepScene step={4} text={scene4} isHighlight={false} durationInFrames={sceneDuration} visualElement="check" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        {/* CTA */}
        <TransitionSeries.Sequence durationInFrames={ctaDuration}>
          <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
            <SceneEnter durationInFrames={ctaDuration} exitDuration={0}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
                <Badge text="LA SOLUCION" delay={0} />
                <RichText text={cta} baseFontSize={64} baseWeight={800} delay={12} textAlign="center" lineHeight={1.25} />
                <div style={{ marginTop: 8, padding: '16px 40px', borderRadius: 100, border: `1.5px solid rgba(232,119,34,${0.4 + ctaGlow * 0.35})`, backgroundColor: 'rgba(232,119,34,0.10)', boxShadow: `0 0 ${16 + ctaGlow * 10}px rgba(232,119,34,${0.13 + ctaGlow * 0.10})`, fontSize: 22, fontWeight: 700, color: COLORS.orange, letterSpacing: 2 }}>
                  @DIGITALGROWTH.WR
                </div>
              </div>
            </SceneEnter>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={logoDuration}>
          <LogoScreen />
        </TransitionSeries.Sequence>

      </TransitionSeries>
    </AbsoluteFill>
  );
};
