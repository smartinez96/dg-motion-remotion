import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { TOKENS } from '../fonts';
import { GlowText } from './GlowText';
import { useTheme } from '../ThemeContext';

const ACCENT_RGBA = (a: number) => `rgba(255,107,26,${a})`; // FF6B1A

// ─── SceneText ───────────────────────────────────────────────────────────────

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
  text, fontSize, color, fontWeight = 700, delay = 0,
  textAlign = 'center', letterSpacing = 0, lineHeight = 1.2, maxWidth, textShadow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - delay);

  const opacity    = interpolate(lf, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = spring({ frame: lf, fps, config: { damping: 18, stiffness: 110, mass: 0.7 }, from: 28, to: 0 });

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, fontSize, color, fontWeight, textAlign, letterSpacing, lineHeight, maxWidth, textShadow }}>
      {text}
    </div>
  );
};

// ─── AccentLine ──────────────────────────────────────────────────────────────

export const AccentLine: React.FC<{ delay?: number; width?: number }> = ({ delay = 0, width = 60 }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const lf    = Math.max(0, frame - delay);
  const scaleX  = interpolate(lf, [0, 15], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const opacity = interpolate(lf, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      width, height: 3,
      backgroundColor: theme.accentPrimary,
      transformOrigin: 'left center',
      transform: `scaleX(${scaleX})`,
      opacity, borderRadius: 2,
      boxShadow: theme.mode === 'dark' ? `0 0 10px rgba(255,107,26,0.65)` : '0 2px 6px rgba(255,107,26,0.30)',
    }} />
  );
};

// ─── Badge ───────────────────────────────────────────────────────────────────

export const Badge: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const lf    = Math.max(0, frame - delay);
  const opacity    = interpolate(lf, [0, 14], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const translateY = interpolate(lf, [0, 14], [-12, 0], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const isDark = theme.mode === 'dark';
  const dotShadow = isDark
    ? `0 0 8px ${ACCENT_RGBA(0.9)}`
    : '0 2px 6px rgba(255,107,26,0.35)';
  const textColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)';
  const badgeShadow = isDark ? undefined : '0 2px 12px rgba(0,0,0,0.07)';

  return (
    <div style={{
      opacity, transform: `translateY(${translateY}px)`,
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '13px 28px', borderRadius: 100,
      backgroundColor: ACCENT_RGBA(0.10),
      border: `1px solid ${ACCENT_RGBA(0.32)}`,
      marginBottom: 14,
      boxShadow: badgeShadow,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: TOKENS.accentPrimary, boxShadow: dotShadow, flexShrink: 0 }} />
      <span style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, color: textColor, letterSpacing: 3, textTransform: 'uppercase' as const }}>
        {text}
      </span>
    </div>
  );
};

// ─── FeaturePill ─────────────────────────────────────────────────────────────

export const FeaturePill: React.FC<{ icon: string; text: string; delay?: number }> = ({ icon, text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const lf    = Math.max(0, frame - delay);
  const opacity    = interpolate(lf, [0, 18], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const translateX = interpolate(lf, [0, 18], [-24, 0], { extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });

  const isDark = theme.mode === 'dark';
  const pillBg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const pillBorder = isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.09)';
  const textColor  = isDark ? 'rgba(255,255,255,0.85)' : theme.textSecondary;
  const dotShadow  = isDark ? `0 0 6px rgba(255,107,26,0.8)` : '0 2px 6px rgba(255,107,26,0.35)';

  return (
    <div style={{
      opacity, transform: `translateX(${translateX}px)`,
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 28px', borderRadius: 16,
      backgroundColor: pillBg, border: pillBorder, width: '100%',
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 26, fontWeight: 600, color: textColor }}>{text}</span>
      <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.accentPrimary, boxShadow: dotShadow, flexShrink: 0 }} />
    </div>
  );
};

// ─── FlashIn ─────────────────────────────────────────────────────────────────

export const FlashIn: React.FC<{ durationFrames?: number }> = ({ durationFrames = 10 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationFrames], [1, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  if (opacity <= 0.01) return null;
  return <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity, pointerEvents: 'none' }} />;
};

// ─── RichText — [[...]] usa GlowText con pulso orgánico ──────────────────────

const parseSegments = (text: string): { t: string; o: boolean }[] =>
  text
    .split(/(\[\[.*?\]\])/g)
    .filter(p => p !== '')
    .map(part =>
      part.startsWith('[[') && part.endsWith(']]')
        ? { t: part.slice(2, -2), o: true }
        : { t: part, o: false }
    );

export const RichText: React.FC<{
  text: string;
  baseFontSize: number;
  baseWeight?: number;
  delay?: number;
  textAlign?: 'center' | 'left' | 'right';
  lineHeight?: number;
}> = ({ text, baseFontSize, baseWeight = 800, delay = 0, textAlign = 'center', lineHeight = 1.2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const lf = Math.max(0, frame - delay);

  const opacity    = interpolate(lf, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = spring({ frame: lf, fps, config: { damping: 18, stiffness: 110, mass: 0.7 }, from: 28, to: 0 });

  const segments = parseSegments(text);

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)`, fontSize: baseFontSize, fontWeight: baseWeight, lineHeight, textAlign }}>
      {segments.map((seg, i) =>
        seg.t.split('\n').map((line, li) => (
          <React.Fragment key={`${i}-${li}`}>
            {li > 0 && <br />}
            {line && (
              seg.o
                ? (
                  // GlowText: pulso orgánico con noise2D, seed único por segmento
                  <GlowText
                    key={`g-${i}`}
                    seed={`rw-${i}`}
                    fontWeight={900}
                    fontSize={Math.round(baseFontSize * 1.1)}
                    intensity={0.80}
                  >
                    {line}
                  </GlowText>
                )
                : (
                  <span key={`s-${i}`} style={{ color: theme.textPrimary }}>
                    {line}
                  </span>
                )
            )}
          </React.Fragment>
        ))
      )}
    </div>
  );
};
