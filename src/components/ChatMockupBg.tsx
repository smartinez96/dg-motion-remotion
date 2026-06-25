import { useCurrentFrame, interpolate, Easing } from 'remotion';

export const ChatMockupBg: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delay);

  const opacity = interpolate(localFrame, [0, 22], [0, 0.28], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateY = interpolate(localFrame, [0, 22], [20, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: 'absolute',
        right: 50,
        top: '50%',
        transform: `translateY(calc(-50% + ${translateY}px))`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        filter: 'blur(1.5px)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Incoming message */}
      <div
        style={{
          alignSelf: 'flex-start',
          width: 310,
          padding: '20px 22px',
          borderRadius: '22px 22px 22px 5px',
          backgroundColor: '#1C1C1C',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ height: 12, width: 210, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 6, marginBottom: 10 }} />
        <div style={{ height: 12, width: 155, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 6 }} />
        <div style={{ marginTop: 12, fontSize: 19, color: 'rgba(255,255,255,0.18)', textAlign: 'right' }}>9:42</div>
      </div>

      {/* Outgoing — single gray check (no reply) */}
      <div
        style={{
          alignSelf: 'flex-end',
          width: 280,
          padding: '20px 22px',
          borderRadius: '22px 22px 5px 22px',
          backgroundColor: '#252525',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ height: 12, width: 190, backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: 6, marginBottom: 10 }} />
        <div style={{ height: 12, width: 120, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 6 }} />
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.22)' }}>✓</span>
          <span style={{ fontSize: 19, color: 'rgba(255,255,255,0.18)' }}>9:43</span>
        </div>
      </div>

      {/* Third bubble — incoming, no answer yet */}
      <div
        style={{
          alignSelf: 'flex-start',
          width: 260,
          padding: '20px 22px',
          borderRadius: '22px 22px 22px 5px',
          backgroundColor: '#1C1C1C',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ height: 12, width: 170, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 6 }} />
        <div style={{ marginTop: 12, fontSize: 19, color: 'rgba(255,255,255,0.18)', textAlign: 'right' }}>9:51</div>
      </div>
    </div>
  );
};
