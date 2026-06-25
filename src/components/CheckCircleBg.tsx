import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../fonts';

export const CheckCircleBg: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 24], [0, 0.30], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale = interpolate(localFrame, [0, 24], [0.78, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const glow = 0.5 + Math.sin((frame / 38) * Math.PI) * 0.5;

  return (
    <div
      style={{
        position: 'absolute',
        right: 55,
        top: '50%',
        transform: `translateY(-50%) scale(${scale})`,
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div
        style={{
          width: 250,
          height: 250,
          borderRadius: '50%',
          border: `2.5px solid rgba(232,119,34,${0.65 + glow * 0.35})`,
          backgroundColor: 'rgba(232,119,34,0.07)',
          boxShadow: `0 0 ${50 + glow * 35}px rgba(232,119,34,${0.28 + glow * 0.18}), 0 0 ${90 + glow * 50}px rgba(232,119,34,${0.10 + glow * 0.08})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path
            d="M24 64 L50 90 L96 34"
            stroke={COLORS.orange}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85 + glow * 0.15}
          />
        </svg>
      </div>
    </div>
  );
};
