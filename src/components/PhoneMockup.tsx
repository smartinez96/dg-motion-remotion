import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

type Props = {
  children: React.ReactNode;
  delay?: number;
  tiltY?: number;
  width?: number;
};

export const PhoneMockup: React.FC<Props> = ({
  children,
  delay = 0,
  tiltY = -14,
  width = 340,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - delay);

  const h = Math.round(width * 2.165);
  const B = Math.round(width * 0.034);
  const R = Math.round(width * 0.138);
  const BTN = Math.round(width * 0.022);

  const opacity = spring({ frame: lf, fps, config: { damping: 20, stiffness: 85, mass: 1.0 }, from: 0, to: 1 });
  const ty = spring({ frame: lf, fps, config: { damping: 18, stiffness: 80, mass: 1.0 }, from: 65, to: 0 });

  return (
    <div style={{
      width,
      height: h,
      opacity,
      transform: `perspective(1400px) rotateY(${tiltY}deg) rotateX(-3deg) translateY(${ty}px)`,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Main frame */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: R,
        background: 'linear-gradient(145deg, #3a3a3c 0%, #131313 45%, #1c1c1e 80%, #2a2a2c 100%)',
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.13)',
          'inset 0 0 0 0.5px rgba(255,255,255,0.07)',
          '0 70px 140px rgba(0,0,0,0.80)',
          '0 24px 48px rgba(0,0,0,0.55)',
          '-6px 0 36px rgba(0,0,0,0.4)',
        ].join(', '),
      }} />

      {/* Left buttons: mute / vol+ / vol- */}
      {([
        { top: h * 0.17, height: h * 0.033 },
        { top: h * 0.25, height: h * 0.055 },
        { top: h * 0.32, height: h * 0.055 },
      ] as { top: number; height: number }[]).map((btn, i) => (
        <div key={i} style={{
          position: 'absolute', left: -BTN, top: btn.top,
          width: BTN, height: btn.height,
          borderRadius: `${BTN}px 0 0 ${BTN}px`,
          background: 'linear-gradient(90deg, #0e0e0e, #1e1e1e)',
          boxShadow: '-1px 0 3px rgba(0,0,0,0.8)',
        }} />
      ))}

      {/* Right power button */}
      <div style={{
        position: 'absolute', right: -BTN, top: h * 0.26,
        width: BTN, height: h * 0.11,
        borderRadius: `0 ${BTN}px ${BTN}px 0`,
        background: 'linear-gradient(270deg, #0e0e0e, #1e1e1e)',
        boxShadow: '1px 0 3px rgba(0,0,0,0.8)',
      }} />

      {/* Screen area */}
      <div style={{
        position: 'absolute',
        top: B, left: B, right: B, bottom: B,
        borderRadius: R - Math.round(B * 0.6),
        overflow: 'hidden',
        backgroundColor: '#000',
      }}>
        {children}
      </div>

      {/* Dynamic Island */}
      <div style={{
        position: 'absolute',
        top: B + Math.round(h * 0.014),
        left: '50%', transform: 'translateX(-50%)',
        width: width * 0.28, height: width * 0.066,
        borderRadius: 100, backgroundColor: '#000', zIndex: 10,
        boxShadow: '0 0 0 0.5px rgba(255,255,255,0.06)',
      }} />

      {/* Subtle top reflection */}
      <div style={{
        position: 'absolute', top: B, left: B, right: B,
        height: '30%',
        borderRadius: `${R - Math.round(B * 0.6)}px ${R - Math.round(B * 0.6)}px 60% 60%`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 5,
      }} />

      {/* Home indicator */}
      <div style={{
        position: 'absolute',
        bottom: B + Math.round(h * 0.008),
        left: '50%', transform: 'translateX(-50%)',
        width: width * 0.32, height: Math.round(width * 0.011),
        borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.30)', zIndex: 10,
      }} />
    </div>
  );
};
