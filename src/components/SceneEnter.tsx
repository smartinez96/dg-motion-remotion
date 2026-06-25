import { useCurrentFrame, interpolate, Easing } from 'remotion';

type SceneEnterProps = {
  children: React.ReactNode;
  durationInFrames: number;
  enterDuration?: number;
  exitDuration?: number;
};

export const SceneEnter: React.FC<SceneEnterProps> = ({
  children,
  durationInFrames,
  enterDuration = 18,
  exitDuration = 12,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, enterDuration], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scaleIn = interpolate(frame, [0, enterDuration], [1.05, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateIn = interpolate(frame, [0, enterDuration], [14, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - exitDuration, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const opacity = Math.min(fadeIn, fadeOut);

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
