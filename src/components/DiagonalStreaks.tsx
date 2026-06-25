import { useCurrentFrame } from 'remotion';

export const DiagonalStreaks: React.FC = () => {
  const frame = useCurrentFrame();

  const op1 = 0.055 + Math.sin((frame / 95) * Math.PI) * 0.025;
  const op2 = 0.038 + Math.sin(((frame + 60) / 115) * Math.PI) * 0.018;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: -400,
          left: 320,
          width: 150,
          height: 2800,
          background: 'linear-gradient(transparent 0%, rgba(255,255,255,1) 50%, transparent 100%)',
          transform: 'rotate(32deg)',
          transformOrigin: 'top center',
          opacity: op1,
          filter: 'blur(22px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -300,
          right: 280,
          width: 80,
          height: 2800,
          background: 'linear-gradient(transparent 0%, rgba(232,119,34,1) 50%, transparent 100%)',
          transform: 'rotate(30deg)',
          transformOrigin: 'top center',
          opacity: op2,
          filter: 'blur(28px)',
        }}
      />
    </div>
  );
};
