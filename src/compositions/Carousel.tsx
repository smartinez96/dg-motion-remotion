import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, Easing } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { Background } from '../components/Background';
import { AccentLine, RichText } from '../components/SceneText';
import { LogoScreen } from '../components/LogoScreen';
import { COLORS, fontFamily } from '../fonts';
import type { CarouselProps } from '../types';

const SAFE_X = 80;
const SLIDE_SECONDS = 4;
const TRANS = 10;

const SlideScene: React.FC<{
  index: number;
  total: number;
  headline: string;
  body: string;
  durationInFrames: number;
}> = ({ index, total, headline, body, durationInFrames }) => {
  const frame = useCurrentFrame();

  const bodyOpacity = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const bodyTranslateY = interpolate(frame, [22, 38], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

  return (
    <AbsoluteFill style={{ fontFamily, display: 'flex', flexDirection: 'column', paddingLeft: SAFE_X, paddingRight: SAFE_X, paddingTop: 120, paddingBottom: 120 }}>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 52 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, backgroundColor: i <= index ? COLORS.orange : 'rgba(255,255,255,0.12)', borderRadius: 2, opacity: i < index ? 0.45 : 1, overflow: 'hidden', boxShadow: i === index ? '0 0 8px rgba(232,119,34,0.5)' : 'none' }}>
            {i === index && (
              <div style={{ height: '100%', width: `${(frame / durationInFrames) * 100}%`, backgroundColor: COLORS.orange, borderRadius: 2, boxShadow: '0 0 6px rgba(232,119,34,0.8)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <AccentLine delay={0} width={60} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 100, backgroundColor: 'rgba(232,119,34,0.10)', border: '1px solid rgba(232,119,34,0.28)' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.orange, letterSpacing: 2 }}>
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>

        <RichText text={headline} baseFontSize={70} baseWeight={800} delay={10} textAlign="left" lineHeight={1.15} />

        <div style={{ fontSize: 36, fontWeight: 400, color: COLORS.mediumGray, lineHeight: 1.55, opacity: bodyOpacity, transform: `translateY(${bodyTranslateY}px)` }}>
          {body}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: COLORS.orange, boxShadow: '0 0 8px rgba(232,119,34,0.8)' }} />
        <div style={{ fontSize: 18, color: COLORS.gray, fontWeight: 600, letterSpacing: 2 }}>@DIGITALGROWTH.WR</div>
      </div>

    </AbsoluteFill>
  );
};

export const Carousel: React.FC<CarouselProps> = ({ slides, title }) => {
  const { fps } = useVideoConfig();

  if (!slides || slides.length === 0) {
    return (
      <AbsoluteFill style={{ fontFamily }}>
        <Background />
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: SAFE_X, paddingRight: SAFE_X }}>
          <RichText text={title || 'Digital Growth'} baseFontSize={80} baseWeight={800} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  const slideDuration = Math.round(SLIDE_SECONDS * fps);
  const logoDuration = Math.round(4 * fps);
  const timing = linearTiming({ durationInFrames: TRANS });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      <TransitionSeries>
        {slides.map((slide_item, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={timing} />
            )}
            <TransitionSeries.Sequence durationInFrames={slideDuration}>
              <SlideScene index={i} total={slides.length} headline={slide_item.headline} body={slide_item.body} durationInFrames={slideDuration} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={logoDuration}>
          <LogoScreen />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
