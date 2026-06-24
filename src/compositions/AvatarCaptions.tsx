import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Video,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { fontFamily, COLORS } from '../fonts';
import { LogoScreen } from '../components/LogoScreen';
import type { AvatarCaptionsProps } from '../types';

const FPS = 30;
const OUTRO_SECS = 4;

const POWER_WORDS = [
  'IA', 'WhatsApp', 'gratis', 'clientes', 'negocios',
  'automatiza', 'pierde', 'gana', 'ventas', 'dinero',
  'negocio', 'automatizacion', 'robots', 'inteligencia',
];

function hasPowerWord(text: string): boolean {
  return POWER_WORDS.some((pw) => text.toLowerCase().includes(pw.toLowerCase()));
}

const CaptionPill: React.FC<{ text: string; isPower: boolean }> = ({ text, isPower }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 4], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const scale = interpolate(frame, [0, 7], [0.93, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div style={{ opacity, transform: `scale(${scale})` }}>
      <div
        style={{
          backgroundColor: isPower ? COLORS.orange : 'rgba(0,0,0,0.78)',
          borderRadius: 14,
          padding: '12px 30px',
          maxWidth: 920,
          textAlign: 'center',
          boxShadow: isPower
            ? '0 4px 24px rgba(232,119,34,0.45)'
            : '0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 52,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.15,
            wordBreak: 'break-word',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export const AvatarCaptions: React.FC<AvatarCaptionsProps> = ({
  avatarVideoUrl,
  groups,
  audioDurationSecs,
}) => {
  const audioFrames = Math.ceil(audioDurationSecs * FPS);
  const outroFrames = OUTRO_SECS * FPS;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000', fontFamily }}>
      {/* Avatar video background */}
      <Sequence from={0} durationInFrames={audioFrames}>
        <AbsoluteFill>
          <Video
            src={avatarVideoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Karaoke caption groups */}
      {groups.map((group, i) => {
        const fromFrame = Math.max(0, Math.round(group.start * FPS));
        const durationFrames = Math.max(Math.round((group.end - group.start) * FPS), 5);
        const isPower = hasPowerWord(group.text);

        return (
          <Sequence key={i} from={fromFrame} durationInFrames={durationFrames}>
            <AbsoluteFill
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 240,
                paddingLeft: 64,
                paddingRight: 64,
              }}
            >
              <CaptionPill text={group.text} isPower={isPower} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Handle @digitalgrowth.wr */}
      <Sequence from={0} durationInFrames={audioFrames}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 100,
          }}
        >
          <div
            style={{
              fontFamily,
              fontSize: 26,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: 1,
              textShadow: '0 1px 8px rgba(0,0,0,0.9)',
              backgroundColor: 'rgba(0,0,0,0.45)',
              padding: '8px 22px',
              borderRadius: 8,
            }}
          >
            @digitalgrowth.wr
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Outro logo screen */}
      <Sequence from={audioFrames} durationInFrames={outroFrames}>
        <LogoScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
