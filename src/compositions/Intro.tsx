import {
  AbsoluteFill,
  Img,
  staticFile,
  Sequence,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { Background } from '../components/Background';
import { SceneText, AccentLine, Badge, FeaturePill, FlashIn, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { SceneEnter } from '../components/SceneEnter';
import { COLORS, fontFamily } from '../fonts';
import type { IntroProps } from '../types';

const SAFE_X = 80;


const SERVICES = [
  { icon: '🤖', text: 'Agente WhatsApp 24/7',     delay: 18 },
  { icon: '📞', text: 'Recepcionista por voz IA',  delay: 28 },
  { icon: '⭐', text: 'Reseñas automáticas Google', delay: 38 },
  { icon: '⚡', text: 'Automatización de procesos', delay: 48 },
];

export const Intro: React.FC<IntroProps> = ({ line1, line2, tagline, cta }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const s1Duration = Math.round(3 * fps);
  const s2Start = s1Duration;
  const s2Duration = Math.round(3.5 * fps);
  const s3Start = s2Start + s2Duration;
  const s3Duration = Math.round(2.5 * fps);
  const logoStart = s3Start + s3Duration;
  const logoDuration = Math.round(4 * fps);

  const bgIconOpacity = interpolate(frame, [0, 50], [0, 0.03], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />

      {/* Very subtle watermark */}
      <AbsoluteFill
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: bgIconOpacity }}
      >
        <Img src={staticFile('logo-icon-white.png')} style={{ width: 700 }} />
      </AbsoluteFill>

      {/* Scene 1: Brand reveal */}
      <Sequence from={0} durationInFrames={s1Duration}>
        <SceneEnter durationInFrames={s1Duration}>
          <AbsoluteFill
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: SAFE_X,
              paddingRight: SAFE_X,
              gap: 28,
            }}
          >
            <Badge text="AI MARKETING AGENCY" delay={0} />
            <SceneText
              text={line1}
              fontSize={92}
              color={COLORS.primary}
              fontWeight={900}
              delay={10}
              textAlign="center"
              lineHeight={1.05}
              letterSpacing={-2}
            />
            <SceneText
              text={line2}
              fontSize={28}
              color={COLORS.orange}
              fontWeight={600}
              delay={22}
              textAlign="center"
              letterSpacing={1}
            />
            <AccentLine delay={32} width={100} />
          </AbsoluteFill>
        </SceneEnter>
      </Sequence>

      {/* Scene 2: Services pills */}
      <Sequence from={s2Start} durationInFrames={s2Duration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: SAFE_X,
            paddingRight: SAFE_X,
          }}
        >
          <SceneEnter durationInFrames={s2Duration}>
            <AbsoluteFill
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: SAFE_X,
                paddingRight: SAFE_X,
                gap: 28,
              }}
            >
              <Badge text="LO QUE HACEMOS" delay={0} />
              <RichText
                text={tagline}
                baseFontSize={46}
                baseWeight={700}
                delay={10}
                textAlign="left"
                lineHeight={1.25}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                {SERVICES.map((s, i) => (
                  <FeaturePill key={i} icon={s.icon} text={s.text} delay={s.delay} />
                ))}
              </div>
            </AbsoluteFill>
          </SceneEnter>
          <FlashIn />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: CTA */}
      <Sequence from={s3Start} durationInFrames={s3Duration}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: SAFE_X,
            paddingRight: SAFE_X,
          }}
        >
          <SceneEnter durationInFrames={s3Duration}>
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
              <Badge text="DA EL PRIMER PASO" delay={0} />
              <RichText
                text={cta}
                baseFontSize={58}
                baseWeight={800}
                delay={12}
                textAlign="center"
                lineHeight={1.2}
              />
              <CtaPill delay={26} />
            </AbsoluteFill>
          </SceneEnter>
          <FlashIn />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={logoStart} durationInFrames={logoDuration}>
        <LogoScreen />
      </Sequence>
    </AbsoluteFill>
  );
};

const CtaPill: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 16], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const scale = interpolate(localFrame, [0, 16], [0.9, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const glow = 0.5 + Math.sin(frame / 30) * 0.5;

  return (
    <div style={{ opacity, transform: `scale(${scale})`, display: 'flex', alignItems: 'center', gap: 32 }}>
      <div
        style={{
          padding: '18px 44px',
          borderRadius: 100,
          border: `1.5px solid rgba(232,119,34,${0.5 + glow * 0.3})`,
          backgroundColor: 'rgba(232,119,34,0.12)',
          boxShadow: `0 0 ${18 + glow * 10}px rgba(232,119,34,${0.15 + glow * 0.10})`,
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.orange,
          letterSpacing: 1.5,
        }}
      >
        @DIGITALGROWTH.WR
      </div>
    </div>
  );
};
