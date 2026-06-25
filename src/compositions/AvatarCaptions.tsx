import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Video,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { fontFamily } from '../fonts';
import { LogoScreen } from '../components/LogoScreen';
import type { AvatarCaptionsProps } from '../types';

const FPS = 30;
const OUTRO_SECS = 4;
const NEON = '#FF6200';

const POWER_WORDS = [
  'ia', 'clientes', 'negocios', 'negocio', 'ventas', 'dinero',
  'automatiza', 'automatizacion', 'pierde', 'gana', 'gratis',
  'whatsapp', 'chatbot', 'agente', 'sistema', 'sistemas',
  'noche', 'primero', 'primeros', 'oportunidad', 'error', 'errores',
  'clave', 'claves', 'inteligencia', 'robots', 'cierras',
];

function isPower(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-záéíóúñü]/g, '');
  return POWER_WORDS.includes(clean);
}

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 10,
        rowGap: 4,
      }}
    >
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          style={{
            fontFamily,
            fontSize: 62,
            fontWeight: 900,
            lineHeight: 1.18,
            color: isPower(word) ? NEON : '#FFFFFF',
            textShadow: isPower(word)
              ? `0 0 24px rgba(255,98,0,0.85), 0 2px 18px rgba(0,0,0,0.98)`
              : '0 2px 18px rgba(0,0,0,0.98)',
            letterSpacing: '-0.3px',
          }}
        >
          {word}
        </span>
      ))}
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
      {/* Avatar video */}
      <Sequence from={0} durationInFrames={audioFrames}>
        <AbsoluteFill>
          <Video
            src={avatarVideoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Gradient bottom — legibilidad sin caja */}
      <Sequence from={0} durationInFrames={audioFrames}>
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.0) 38%)',
          }}
        />
      </Sequence>

      {/* Captions al fondo, sin recuadro */}
      {groups.map((group, i) => {
        const fromFrame = Math.max(0, Math.round(group.start * FPS));
        const durationFrames = Math.max(
          Math.round((group.end - group.start) * FPS),
          5,
        );

        return (
          <Sequence key={i} from={fromFrame} durationInFrames={durationFrames}>
            <AbsoluteFill
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 148,
                paddingLeft: 48,
                paddingRight: 48,
              }}
            >
              <Caption text={group.text} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Handle centrado al fondo */}
      <Sequence from={0} durationInFrames={audioFrames}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 64,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: 28,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.80)',
              letterSpacing: 2,
              textShadow: '0 1px 14px rgba(0,0,0,0.98)',
            }}
          >
            @digitalgrowth.wr
          </span>
        </AbsoluteFill>
      </Sequence>

      {/* Outro */}
      <Sequence from={audioFrames} durationInFrames={outroFrames}>
        <LogoScreen />
      </Sequence>
    </AbsoluteFill>
  );
};
