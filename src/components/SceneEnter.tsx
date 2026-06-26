import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

type SceneEnterProps = {
  children: React.ReactNode;
  durationInFrames: number;
  exitDuration?: number;
};

export const SceneEnter: React.FC<SceneEnterProps> = ({
  children,
  durationInFrames,
  exitDuration = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Physics-based entrance — spring overshoots slightly and settles (more organic than bezier)
  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.8 },
    from: 1.06,
    to: 1.0,
  });

  const translateIn = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.8 },
    from: 18,
    to: 0,
  });

  // Fast opacity fade-in (4 frames) so it doesn't compound badly with TransitionSeries
  const fadeIn = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - exitDuration, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const opacity = exitDuration > 0 ? Math.min(fadeIn, fadeOut) : fadeIn;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleIn}) translateY(${translateIn}px)`,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
};
