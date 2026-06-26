import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ThemeProvider } from '../ThemeContext';
import { lightTheme } from '../themes';
import { Background } from '../components/Background';
import { Badge, SceneText } from '../components/SceneText';
import { GlowText } from '../components/GlowText';
import { ChatMockup } from '../components/ChatMockup';
import type { ChatMessage } from '../components/ChatMockup';
import { fontFamily } from '../fonts';

const SAFE_X = 80;

const PREVIEW_MESSAGES: ChatMessage[] = [
  { text: '¿Cómo puedo automatizar mi negocio?', sent: false, check: 'none' },
  { text: '¡Hola! Te explico en 2 minutos 😊',   sent: true,  check: 'double' },
  { text: 'Tenemos el sistema perfecto para ti',  sent: true,  check: 'single' },
];

const PreviewScene: React.FC = () => (
  <AbsoluteFill style={{ fontFamily }}>
    <Background />
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        gap: 36,
      }}
    >
      <Badge text="AUTOMATIZACIÓN IA" delay={0} />

      <SceneText
        text="Tu negocio trabaja"
        fontSize={72}
        color={lightTheme.textPrimary}
        fontWeight={800}
        delay={8}
        textAlign="center"
        lineHeight={1.1}
      />

      {/* GlowText → en light theme actúa como ShadowText (sombra que se mueve) */}
      <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
        <GlowText fontSize={72} fontWeight={800} seed="preview-shadow">
          mientras duermes
        </GlowText>
      </div>

      <ChatMockup
        messages={PREVIEW_MESSAGES}
        delay={18}
        stagger={16}
        width={680}
      />
    </AbsoluteFill>
  </AbsoluteFill>
);

export const LightPreview: React.FC = () => (
  <ThemeProvider theme={lightTheme}>
    <PreviewScene />
  </ThemeProvider>
);
