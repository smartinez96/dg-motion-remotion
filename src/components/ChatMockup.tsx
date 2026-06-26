import React from 'react';
import { useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion';
import { TOKENS } from './tokens';

export type ChatMessage = {
  text: string;
  sent?: boolean;
  check?: 'none' | 'single' | 'double'; // 'none' = sin respuesta, 'double' = respondido (azul)
};

type Props = {
  messages: ChatMessage[];
  delay?: number;
  stagger?: number;  // frames entre burbujas, default 14
  width?: number;
};

const BUBBLE_FONT = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';

const Bubble: React.FC<{
  msg: ChatMessage;
  startFrame: number;
}> = ({ msg, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = Math.max(0, frame - startFrame);

  const opacity = interpolate(lf, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const ty = spring({
    frame: lf,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.7 },
    from: 18,
    to: 0,
  });

  const sent = msg.sent ?? false;
  const bgColor   = sent ? 'rgba(255,107,26,0.13)' : TOKENS.bgCard;
  const border    = sent
    ? '1px solid rgba(255,107,26,0.22)'
    : `1px solid ${TOKENS.bgCardBorder}`;
  const textColor = sent ? TOKENS.textPrimary : TOKENS.textSecondary;

  const check = msg.check ?? 'none';
  const checkEl = check === 'double'
    ? <span style={{ fontSize: 11, color: '#53bdeb', marginLeft: 5 }}>✓✓</span>
    : check === 'single'
    ? <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginLeft: 5 }}>✓</span>
    : null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: sent ? 'flex-end' : 'flex-start',
        opacity,
        transform: `translateY(${ty}px)`,
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          backgroundColor: bgColor,
          border,
          borderRadius: sent ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '10px 14px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: textColor,
            lineHeight: 1.45,
            fontFamily: BUBBLE_FONT,
            fontWeight: 400,
          }}
        >
          {msg.text}
        </div>
        {sent && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
            {checkEl}
          </div>
        )}
      </div>
    </div>
  );
};

export const ChatMockup: React.FC<Props> = ({
  messages,
  delay = 0,
  stagger = 14,
  width = 600,
}) => {
  return (
    <div
      style={{
        width,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {messages.map((msg, i) => (
        <Bubble key={i} msg={msg} startFrame={delay + i * stagger} />
      ))}
    </div>
  );
};
