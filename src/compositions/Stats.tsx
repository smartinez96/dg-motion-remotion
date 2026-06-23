import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { Background } from '../components/Background';
import { SceneText, AccentLine, Badge, FlashIn, RichText } from '../components/SceneText';
import { StatCounter } from '../components/StatCounter';
import { LogoScreen } from '../components/LogoScreen';
import { COLORS, fontFamily } from '../fonts';
import type { StatsProps } from '../types';

const SAFE_X = 80;

const SceneFade: React.FC<{ children: React.ReactNode; durationInFrames: number }> = ({
  children,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{ opacity: fadeOut, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
};

const HookScene: React.FC<{ text: string; durationInFrames: number; flash?: boolean }> = ({ text, durationInFrames, flash }) => {
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
          <Badge text="AUTOMATIZACIÓN IA" delay={0} />
          <RichText
            text={text}
            baseFontSize={72}
            baseWeight={800}
            delay={12}
            textAlign="center"
            lineHeight={1.15}
          />
          <AccentLine delay={28} width={80} />
        </div>
      </SceneFade>
      {flash && <FlashIn />}
    </AbsoluteFill>
  );
};

const StatScene: React.FC<{
  number: string;
  label: string;
  badge: string;
  durationInFrames: number;
  flash?: boolean;
}> = ({ number, label, badge, durationInFrames, flash }) => {
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
          <Badge text={badge} delay={0} />
          <StatCounter number={number} label={label} delay={8} />
        </div>
      </SceneFade>
      {flash && <FlashIn />}
    </AbsoluteFill>
  );
};

const InsightScene: React.FC<{ text: string; badge?: string; durationInFrames: number; flash?: boolean }> = ({ text, badge, durationInFrames, flash }) => {
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
          <Badge text={badge || 'LO QUE NADIE TE DICE'} delay={0} />
          <RichText
            text={text}
            baseFontSize={52}
            baseWeight={700}
            delay={12}
            textAlign="center"
            lineHeight={1.3}
          />
        </div>
      </SceneFade>
      {flash && <FlashIn />}
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{ text: string; durationInFrames: number; flash?: boolean }> = ({ text, durationInFrames, flash }) => {
  const frame = useCurrentFrame();

  const pillOpacity = interpolate(frame, [22, 36], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const pillScale = interpolate(frame, [22, 36], [0.88, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const glowPulse = 0.5 + Math.sin(frame / 28) * 0.5;

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
          <Badge text="¿LISTO PARA CRECER?" delay={0} />
          <RichText
            text={text}
            baseFontSize={52}
            baseWeight={700}
            delay={12}
            textAlign="center"
            lineHeight={1.3}
          />
          <div
            style={{
              opacity: pillOpacity,
              transform: `scale(${pillScale})`,
              padding: '18px 44px',
              borderRadius: 100,
              border: `1.5px solid rgba(232,119,34,${0.45 + glowPulse * 0.35})`,
              backgroundColor: 'rgba(232,119,34,0.10)',
              boxShadow: `0 0 ${20 + glowPulse * 12}px rgba(232,119,34,${0.15 + glowPulse * 0.12})`,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.orange, letterSpacing: 2 }}>
              @DIGITALGROWTH.WR
            </div>
          </div>
        </div>
      </SceneFade>
      {flash && <FlashIn />}
    </AbsoluteFill>
  );
};

export const Stats: React.FC<StatsProps> = ({ hook, stat1, stat2, insight, cta, badge }) => {
  const { fps } = useVideoConfig();

  const s1Duration = Math.round(3 * fps);
  const s2Start = s1Duration;
  const s2Duration = Math.round(3.5 * fps);
  const s3Start = s2Start + s2Duration;
  const s3Duration = Math.round(3.5 * fps);
  const s4Start = s3Start + s3Duration;
  const s4Duration = Math.round(3 * fps);
  const s5Start = s4Start + s4Duration;
  const s5Duration = Math.round(2.5 * fps);
  const logoStart = s5Start + s5Duration;
  const logoDuration = Math.round(3.5 * fps);

  return (
    <AbsoluteFill>
      <Background />

      <Sequence from={0} durationInFrames={s1Duration}>
        <HookScene text={hook} durationInFrames={s1Duration} />
      </Sequence>

      <Sequence from={s2Start} durationInFrames={s2Duration}>
        <StatScene number={stat1.number} label={stat1.label} badge="DATO REAL" durationInFrames={s2Duration} flash />
      </Sequence>

      <Sequence from={s3Start} durationInFrames={s3Duration}>
        <StatScene number={stat2.number} label={stat2.label} badge="RESULTADO PROBADO" durationInFrames={s3Duration} flash />
      </Sequence>

      <Sequence from={s4Start} durationInFrames={s4Duration}>
        <InsightScene text={insight} badge={badge} durationInFrames={s4Duration} flash />
      </Sequence>

      <Sequence from={s5Start} durationInFrames={s5Duration}>
        <CtaScene text={cta} durationInFrames={s5Duration} flash />
      </Sequence>

      <Sequence from={logoStart} durationInFrames={logoDuration}>
        <LogoScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
