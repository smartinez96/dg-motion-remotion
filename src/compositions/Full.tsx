import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, Easing } from 'remotion';
import { Background } from '../components/Background';
import { SceneText, AccentLine, Badge, FlashIn, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { COLORS, fontFamily } from '../fonts';
import type { FullProps } from '../types';

const SAFE_X = 80;

const SceneFade: React.FC<{ children: React.ReactNode; durationInFrames: number }> = ({
  children, durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{ opacity: fadeOut, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
};

const StepScene: React.FC<{
  step: number;
  text: string;
  isHighlight: boolean;
  durationInFrames: number;
  flash?: boolean;
}> = ({ step, text, isHighlight, durationInFrames, flash }) => {
  const frame = useCurrentFrame();

  const numOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const numScale = interpolate(frame, [0, 14], [0.7, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const glow = isHighlight ? 0.5 + Math.sin(frame / 30) * 0.5 : 0;

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
      }}
    >
      <SceneFade durationInFrames={durationInFrames}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          {/* Step number badge */}
          <div
            style={{
              opacity: numOpacity,
              transform: `scale(${numScale})`,
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: `2px solid ${isHighlight ? 'rgba(232,119,34,0.9)' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              color: isHighlight ? COLORS.orange : 'rgba(255,255,255,0.5)',
              backgroundColor: isHighlight ? 'rgba(232,119,34,0.12)' : 'rgba(255,255,255,0.04)',
              boxShadow: isHighlight ? `0 0 ${18 + glow * 12}px rgba(232,119,34,${0.2 + glow * 0.2})` : 'none',
            }}
          >
            {step}
          </div>
          <SceneText
            text={text}
            fontSize={58}
            color={isHighlight ? COLORS.orange : COLORS.primary}
            fontWeight={700}
            delay={12}
            textAlign="center"
            lineHeight={1.25}
            textShadow={isHighlight
              ? `0 0 28px rgba(232,119,34,0.6), 0 0 56px rgba(232,119,34,0.3)`
              : undefined
            }
          />
        </div>
      </SceneFade>
      {flash && <FlashIn />}
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

  const s1Start = hookDuration;
  const s2Start = s1Start + sceneDuration;
  const s3Start = s2Start + sceneDuration;
  const s4Start = s3Start + sceneDuration;
  const ctaStart = s4Start + sceneDuration;
  const logoStart = ctaStart + ctaDuration;

  const ctaGlow = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />

      {/* Hook */}
      <Sequence from={0} durationInFrames={hookDuration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: SAFE_X,
            paddingRight: SAFE_X,
            gap: 36,
          }}
        >
          <Badge text="EL ERROR MÁS COMÚN" delay={0} />
          <RichText
            text={hook}
            baseFontSize={68}
            baseWeight={800}
            delay={12}
            textAlign="center"
            lineHeight={1.18}
          />
          <AccentLine delay={28} width={90} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={s1Start} durationInFrames={sceneDuration}>
        <StepScene step={1} text={scene1} isHighlight={false} durationInFrames={sceneDuration} flash />
      </Sequence>
      <Sequence from={s2Start} durationInFrames={sceneDuration}>
        <StepScene step={2} text={scene2} isHighlight={false} durationInFrames={sceneDuration} flash />
      </Sequence>
      <Sequence from={s3Start} durationInFrames={sceneDuration}>
        <StepScene step={3} text={scene3} isHighlight={true} durationInFrames={sceneDuration} flash />
      </Sequence>
      <Sequence from={s4Start} durationInFrames={sceneDuration}>
        <StepScene step={4} text={scene4} isHighlight={false} durationInFrames={sceneDuration} flash />
      </Sequence>

      {/* CTA */}
      <Sequence from={ctaStart} durationInFrames={ctaDuration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: SAFE_X,
            paddingRight: SAFE_X,
            gap: 36,
          }}
        >
          <Badge text="LA SOLUCIÓN" delay={0} />
          <RichText
            text={cta}
            baseFontSize={64}
            baseWeight={800}
            delay={12}
            textAlign="center"
            lineHeight={1.25}
          />
          <div
            style={{
              marginTop: 8,
              padding: '16px 40px',
              borderRadius: 100,
              border: `1.5px solid rgba(232,119,34,${0.4 + ctaGlow * 0.35})`,
              backgroundColor: 'rgba(232,119,34,0.10)',
              boxShadow: `0 0 ${16 + ctaGlow * 10}px rgba(232,119,34,${0.13 + ctaGlow * 0.10})`,
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.orange,
              letterSpacing: 2,
            }}
          >
            @DIGITALGROWTH.WR
          </div>
          <FlashIn />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={logoStart} durationInFrames={logoDuration}>
        <LogoScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
