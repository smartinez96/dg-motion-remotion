import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../fonts';

type SceneTextProps = {
  text: string;
  fontSize: number;
  color: string;
  fontWeight?: number;
  delay?: number;
  textAlign?: 'center' | 'left' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  maxWidth?: number;
  textShadow?: string;
};

export const SceneText: React.FC<SceneTextProps> = ({
  text,
  fontSize,
  color,
  fontWeight = 700,
  delay = 0,
  textAlign = 'center',
  letterSpacing = 0,
  lineHeight = 1.2,
  maxWidth,
  textShadow,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 16], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateY = interpolate(localFrame, [0, 16], [28, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontSize,
        color,
        fontWeight,
        textAlign,
        letterSpacing,
        lineHeight,
        maxWidth,
        textShadow,
      }}
    >
      {text}
    </div>
  );
};

export const AccentLine: React.FC<{ delay?: number; width?: number }> = ({
  delay = 0,
  width = 60,
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const scaleX = interpolate(localFrame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width,
        height: 3,
        backgroundColor: '#E87722',
        transformOrigin: 'left center',
        transform: `scaleX(${scaleX})`,
        opacity,
        borderRadius: 2,
        boxShadow: '0 0 10px rgba(232,119,34,0.6)',
      }}
    />
  );
};

export const Badge: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateY = interpolate(localFrame, [0, 14], [-12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 24px',
        borderRadius: 100,
        backgroundColor: 'rgba(232,119,34,0.10)',
        border: '1px solid rgba(232,119,34,0.32)',
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: '#E87722',
          boxShadow: '0 0 8px rgba(232,119,34,0.9)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const FeaturePill: React.FC<{
  icon: string;
  text: string;
  delay?: number;
}> = ({ icon, text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateX = interpolate(localFrame, [0, 18], [-24, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 28px',
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        width: '100%',
      }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
        {text}
      </span>
      <div
        style={{
          marginLeft: 'auto',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#E87722',
          boxShadow: '0 0 6px rgba(232,119,34,0.8)',
          flexShrink: 0,
        }}
      />
    </div>
  );
};

// White flash overlay — add after content in any Sequence to create cinematic scene transition
export const FlashIn: React.FC<{ durationFrames?: number }> = ({ durationFrames = 10 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationFrames], [1, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  if (opacity <= 0.01) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity, pointerEvents: 'none' }} />
  );
};

// Parse [[word]] syntax into styled segments
const parseSegments = (text: string): { t: string; o: boolean }[] => {
  const parts = text.split(/(\[\[.*?\]\])/g);
  return parts
    .filter(p => p !== '')
    .map(part => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        return { t: part.slice(2, -2), o: true };
      }
      return { t: part, o: false };
    });
};

// Mixed typography — supports [[word]] syntax for orange neon accent words
export const RichText: React.FC<{
  text: string;
  baseFontSize: number;
  baseWeight?: number;
  delay?: number;
  textAlign?: 'center' | 'left' | 'right';
  lineHeight?: number;
}> = ({ text, baseFontSize, baseWeight = 800, delay = 0, textAlign = 'center', lineHeight = 1.2 }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 16], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translateY = interpolate(localFrame, [0, 16], [28, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const segments = parseSegments(text);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontSize: baseFontSize,
        fontWeight: baseWeight,
        lineHeight,
        textAlign,
      }}
    >
      {segments.map((seg, i) =>
        seg.t.split('\n').map((line, li) => (
          <React.Fragment key={`${i}-${li}`}>
            {li > 0 && <br />}
            {line && (
              <span
                style={{
                  color: seg.o ? COLORS.orange : COLORS.primary,
                  textShadow: seg.o
                    ? '0 0 28px rgba(232,119,34,0.65), 0 0 56px rgba(232,119,34,0.3)'
                    : undefined,
                }}
              >
                {line}
              </span>
            )}
          </React.Fragment>
        ))
      )}
    </div>
  );
};
