import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, Easing } from 'remotion';
import { Background } from '../components/Background';
import { AccentLine, FlashIn, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { COLORS, fontFamily } from '../fonts';
import type { CarouselProps } from '../types';

const SAFE_X = 80;
const SLIDE_SECONDS = 4;

const SlideScene: React.FC<{
  index: number;
  total: number;
  headline: string;
  body: string;
  durationInFrames: number;
  isFirst: boolean;
}> = ({ index, total, headline, body, durationInFrames, isFirst }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const scaleIn = interpolate(frame, [0, 16], [1.04, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translateIn = interpolate(frame, [0, 16], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        paddingTop: 120,
        paddingBottom: 120,
        opacity,
        transform: `scale(${scaleIn}) translateY(${translateIn}px)`,
      }}
    >
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 52 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: i <= index ? COLORS.orange : 'rgba(255,255,255,0.12)',
              borderRadius: 2,
              opacity: i < index ? 0.45 : 1,
              overflow: 'hidden',
              boxShadow: i === index ? '0 0 8px rgba(232,119,34,0.5)' : 'none',
            }}
          >
            {i === index && (
              <div
                style={{
                  height: '100%',
                  width: `${(frame / durationInFrames) * 100}%`,
                  backgroundColor: COLORS.orange,
                  borderRadius: 2,
                  boxShadow: '0 0 6px rgba(232,119,34,0.8)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* Slide number + accent */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <AccentLine delay={0} width={60} />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 20px',
              borderRadius: 100,
              backgroundColor: 'rgba(232,119,34,0.10)',
              border: '1px solid rgba(232,119,34,0.28)',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.orange, letterSpacing: 2 }}>
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>

        <RichText
          text={headline}
          baseFontSize={70}
          baseWeight={800}
          delay={10}
          textAlign="left"
          lineHeight={1.15}
        />

        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            color: COLORS.mediumGray,
            lineHeight: 1.55,
            opacity: interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            transform: `translateY(${interpolate(frame, [22, 38], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) })}px)`,
          }}
        >
          {body}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: COLORS.orange,
            boxShadow: '0 0 8px rgba(232,119,34,0.8)',
          }}
        />
        <div style={{ fontSize: 18, color: COLORS.gray, fontWeight: 600, letterSpacing: 2 }}>
          @DIGITALGROWTH.WR
        </div>
      </div>

      {/* Flash transition on all slides except first */}
      {!isFirst && <FlashIn />}
    </AbsoluteFill>
  );
};

export const Carousel: React.FC<CarouselProps> = ({ slides, title }) => {
  const { fps } = useVideoConfig();

  if (!slides || slides.length === 0) {
    return (
      <AbsoluteFill style={{ fontFamily }}>
        <Background />
        <AbsoluteFill
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}
        >
          <RichText text={title || 'Digital Growth'} baseFontSize={80} baseWeight={800} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  const slideDuration = Math.round(SLIDE_SECONDS * fps);
  const logoDuration = Math.round(4 * fps);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      {slides.map((slide, i) => (
        <Sequence key={i} from={i * slideDuration} durationInFrames={slideDuration}>
          <SlideScene
            index={i}
            total={slides.length}
            headline={slide.headline}
            body={slide.body}
            durationInFrames={slideDuration}
            isFirst={i === 0}
          />
        </Sequence>
      ))}
      <Sequence from={slides.length * slideDuration} durationInFrames={logoDuration}>
        <LogoScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
