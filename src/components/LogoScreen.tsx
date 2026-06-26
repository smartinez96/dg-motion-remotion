import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, fontFamily } from '../fonts';
import { useTheme } from '../ThemeContext';

export const LogoScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  // Flash: white → transparent (dark bg appears from behind)
  const flashOpacity = interpolate(frame, [0, 12], [1, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Entire content fades in after flash clears
  const contentOpacity = interpolate(frame, [8, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Fade out at end (works for 90–120 frame durations)
  const fadeOut = interpolate(frame, [88, 106], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const screenOpacity = Math.min(contentOpacity, fadeOut);

  // Full logo — enters with scale + fade
  const logoScale = interpolate(frame, [8, 36], [0.78, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const logoOpacity = interpolate(frame, [8, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Orange line — grows from center (after logo finishes entering)
  const lineScaleX = interpolate(frame, [34, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const lineOpacity = interpolate(frame, [34, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Handle — enters last
  const handleOpacity = interpolate(frame, [50, 68], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const handleY = interpolate(frame, [50, 68], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Pulsing glow on the orange line
  const glow = 0.5 + Math.sin(frame / 28) * 0.5;

  return (
    <AbsoluteFill>
      {/* Background */}
      <AbsoluteFill style={{ backgroundColor: isDark ? COLORS.bg : theme.bgPrimary }} />

      {isDark ? (
        <>
          {/* DARK — Teal glow top */}
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 65% 30% at 50% 0%, rgba(0,185,195,0.07) 0%, transparent 100%)' }} />
          {/* DARK — Orange glow bottom */}
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 55% 25% at 50% 100%, rgba(232,119,34,0.08) 0%, transparent 100%)' }} />
          {/* DARK — Vignette */}
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 100%)' }} />
        </>
      ) : (
        <>
          {/* LIGHT — Tinte cálido muy sutil arriba */}
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 65% 30% at 50% 0%, rgba(200,220,255,0.06) 0%, transparent 100%)' }} />
          {/* LIGHT — Viñeta muy sutil */}
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.05) 100%)' }} />
        </>
      )}

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily,
          opacity: screenOpacity,
        }}
      >
        {/* Ícono DG pequeño — entra con el logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 28,
          }}
        >
          <Img
            src={staticFile('logo-icon-white.png')}
            style={{
              width: 72, height: 72, objectFit: 'contain',
              filter: isDark ? undefined : 'invert(1)',
            }}
          />
        </div>

        {/* Full logo wordmark */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 40,
            filter: isDark
              ? 'drop-shadow(0 0 40px rgba(232,119,34,0.18)) drop-shadow(0 0 12px rgba(255,255,255,0.08))'
              : `invert(1) drop-shadow(0 4px 14px rgba(0,0,0,0.14))`,
          }}
        >
          <Img
            src={staticFile(theme.logoFile)}
            style={{ width: 580, objectFit: 'contain' }}
          />
        </div>

        {/* Orange divider — grows from center. Dark: glow pulsante. Light: sombra sutil */}
        <div
          style={{
            width: 120,
            height: 3,
            backgroundColor: COLORS.orange,
            borderRadius: 2,
            transformOrigin: 'center',
            transform: `scaleX(${lineScaleX})`,
            opacity: lineOpacity,
            marginBottom: 26,
            boxShadow: isDark
              ? `0 0 ${14 + glow * 10}px rgba(232,119,34,${0.5 + glow * 0.3}), 0 0 ${28 + glow * 16}px rgba(232,119,34,${0.2 + glow * 0.15})`
              : `0 2px ${8 + glow * 4}px rgba(232,119,34,0.30)`,
          }}
        />

        {/* Handle */}
        <div
          style={{
            opacity: handleOpacity,
            transform: `translateY(${handleY}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: COLORS.orange,
              boxShadow: isDark ? '0 0 6px rgba(232,119,34,0.9)' : '0 2px 4px rgba(232,119,34,0.35)',
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            @DIGITALGROWTH.WR
          </span>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: COLORS.orange,
              boxShadow: isDark ? '0 0 6px rgba(232,119,34,0.9)' : '0 2px 4px rgba(232,119,34,0.35)',
            }}
          />
        </div>
      </AbsoluteFill>

      {/* White flash overlay — burns in at scene start then clears to reveal dark bg */}
      {flashOpacity > 0.01 && (
        <AbsoluteFill
          style={{ backgroundColor: '#FFFFFF', opacity: flashOpacity, pointerEvents: 'none' }}
        />
      )}
    </AbsoluteFill>
  );
};
