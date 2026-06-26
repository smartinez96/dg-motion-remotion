import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';

// ─── Shared UI primitives ────────────────────────────────────────────────────

const StatusBar: React.FC<{ time?: string; dark?: boolean }> = ({
  time = '9:41',
  dark = true,
}) => {
  const c = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 18px 0', fontFamily: SF, fontSize: 12.5, fontWeight: 600, color: c,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 11 }}>
        <svg width="15" height="11" viewBox="0 0 15 11" fill={c}>
          {[0,1,2,3].map(i => <rect key={i} x={i*4} y={10-(i+1)*2.5} width="3" height={(i+1)*2.5} rx="0.8" opacity={i < 3 ? 1 : 0.35} />)}
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill={c}>
          <path d="M7 7.5a1.3 1.3 0 0 1 1.3 1.3H5.7A1.3 1.3 0 0 1 7 7.5z"/>
          <path d="M3.8 5.2a4.5 4.5 0 0 1 6.4 0l-.9.9a3.2 3.2 0 0 0-4.6 0z"/>
          <path d="M1.2 3a8 8 0 0 1 11.6 0l-.9.9a6.7 6.7 0 0 0-9.8 0z"/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{ width: 20, height: 10, borderRadius: 2.5, border: `1px solid ${c}`, padding: 1.5, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '78%', height: '100%', backgroundColor: '#30d158', borderRadius: 1 }} />
          </div>
          <div style={{ width: 2, height: 5, borderRadius: 1, backgroundColor: c }} />
        </div>
      </div>
    </div>
  );
};

const WAHeader: React.FC<{
  name: string; sub: string; avatar: string; avatarBg?: string;
}> = ({ name, sub, avatar, avatarBg = '#128c7e' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '7px 12px 9px 8px',
    backgroundColor: '#202c33',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }}>
    <div style={{ fontSize: 15, color: '#8696a0', marginRight: -3 }}>‹</div>
    <div style={{
      width: 34, height: 34, borderRadius: '50%',
      backgroundColor: avatarBg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 17, flexShrink: 0,
    }}>{avatar}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e9edef', fontFamily: SF, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
      <div style={{ fontSize: 11.5, color: '#8696a0', fontFamily: SF }}>{sub}</div>
    </div>
    <div style={{ fontSize: 14, color: '#8696a0', marginLeft: 6 }}>📞</div>
    <div style={{ fontSize: 14, color: '#8696a0', marginLeft: 8 }}>⋯</div>
  </div>
);

const Bubble: React.FC<{
  text: string; time: string;
  sent?: boolean; delay?: number; read?: boolean;
  alert?: boolean;
}> = ({ text, time, sent = false, delay = 0, read = false, alert = false }) => {
  const frame = useCurrentFrame();
  const lf = Math.max(0, frame - delay);
  const opacity = interpolate(lf, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const ty = interpolate(lf, [0, 10], [12, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ display: 'flex', justifyContent: sent ? 'flex-end' : 'flex-start', opacity, transform: `translateY(${ty}px)` }}>
      <div style={{
        maxWidth: '82%', position: 'relative',
        backgroundColor: sent ? '#005c4b' : '#202c33',
        borderRadius: sent ? '15px 4px 15px 15px' : '4px 15px 15px 15px',
        padding: '6px 10px 5px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
      }}>
        {alert && (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            width: 14, height: 14, borderRadius: '50%',
            backgroundColor: '#ff3b30',
            fontSize: 8.5, color: '#fff', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>!</div>
        )}
        <div style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.45, fontFamily: SF }}>{text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
          <span style={{ fontSize: 10, color: '#8696a0', fontFamily: SF }}>{time}</span>
          {sent && <span style={{ fontSize: 11.5, color: read ? '#53bdeb' : '#8696a0' }}>✓✓</span>}
        </div>
      </div>
    </div>
  );
};

const WAInput: React.FC = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 10px', backgroundColor: '#1f2c33',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  }}>
    <div style={{ fontSize: 16, color: '#8696a0' }}>😊</div>
    <div style={{ flex: 1, height: 33, borderRadius: 20, backgroundColor: '#2a3942', display: 'flex', alignItems: 'center', paddingLeft: 13 }}>
      <span style={{ fontSize: 13, color: '#8696a0', fontFamily: SF }}>Mensaje</span>
    </div>
    <div style={{ width: 33, height: 33, borderRadius: '50%', backgroundColor: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🎤</div>
  </div>
);

const WA_CHAT_BG = '#0b141a';

// ─── Screen 1: WhatsApp — mensajes sin respuesta (problema) ─────────────────

export const WhatsAppUnanswered: React.FC = () => (
  <div style={{ width: '100%', height: '100%', backgroundColor: WA_CHAT_BG, display: 'flex', flexDirection: 'column' }}>
    <StatusBar time="2:51" />
    <WAHeader name="María López" sub="visto hace 8 horas" avatar="👩" avatarBg="#6b6b8a" />

    <div style={{ flex: 1, overflowY: 'hidden', padding: '10px 9px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgba(11,20,26,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '3px 10px', fontSize: 10.5, color: '#8696a0', fontFamily: SF }}>Hoy</div>
      </div>

      <Bubble text="Hola! Quisiera reservar una cita para mañana" time="12:52" delay={0} alert />
      <Bubble text="¿Tienen disponibilidad? Es para mi empresa" time="01:15" delay={14} alert />
      <Bubble text="Por favor, es urgente 🙏" time="02:31" delay={28} alert />
      <Bubble text="Buscaré otro proveedor entonces..." time="02:49" delay={42} alert />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <div style={{
          backgroundColor: 'rgba(255,59,48,0.13)',
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: 12, padding: '5px 14px',
          fontSize: 11, color: '#ff6b6b', fontWeight: 600, fontFamily: SF,
        }}>
          4 mensajes sin respuesta · cliente perdido
        </div>
      </div>
    </div>

    <WAInput />
  </div>
);

// ─── Screen 2: WhatsApp — bot respondiendo automático (solución) ─────────────

export const WhatsAppAutoReply: React.FC = () => (
  <div style={{ width: '100%', height: '100%', backgroundColor: WA_CHAT_BG, display: 'flex', flexDirection: 'column' }}>
    <StatusBar time="23:58" />
    <WAHeader name="🤖 DG Asistente" sub="responde en segundos · 24/7" avatar="🤖" avatarBg="#E87722" />

    <div style={{ flex: 1, overflowY: 'hidden', padding: '10px 9px', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgba(11,20,26,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '3px 10px', fontSize: 10.5, color: '#8696a0', fontFamily: SF }}>Hoy · 23:58</div>
      </div>

      <Bubble text="Hola, necesito reservar urgente para mañana" time="23:58" sent={false} delay={0} />
      <Bubble text="¡Hola! Soy el asistente 😊 ¿Para qué hora?" time="23:58" sent delay={12} read />
      <Bubble text="Para las 10am si es posible" time="23:59" sent={false} delay={24} />
      <Bubble text="Perfecto! 10am disponible ✅ ¿Tu nombre?" time="23:59" sent delay={36} read />
      <Bubble text="Carlos Mendoza" time="00:00" sent={false} delay={48} />
      <Bubble text="¡Listo Carlos! Cita confirmada mañana 10am. Te envío recordatorio 🌙" time="00:00" sent delay={60} read />
    </div>

    <WAInput />
  </div>
);

// ─── Screen 3: Google Reviews ────────────────────────────────────────────────

export const GoogleReviewsScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const ratingPct = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const REVIEWS = [
    { name: 'Carlos M.', stars: 5, text: 'Responden al instante, increíble servicio', time: 'hace 2 días', color: '#4285f4' },
    { name: 'Ana Pérez', stars: 5, text: 'El chatbot resolvió todo sin esperar', time: 'hace 5 días', color: '#34a853' },
    { name: 'Luis V.', stars: 5, text: 'Superaron mis expectativas totalmente', time: 'hace 1 sem', color: '#ea4335' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', fontFamily: SF }}>
      <StatusBar time="10:24" dark={false} />

      {/* Google header */}
      <div style={{ padding: '8px 13px 11px', borderBottom: '1px solid #f1f3f4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #4285f4 0%, #ea4335 40%, #fbbc04 70%, #34a853 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 800, flexShrink: 0 }}>G</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#202124' }}>Digital Growth</div>
            <div style={{ fontSize: 10.5, color: '#5f6368' }}>Agencia de marketing · Quito, EC</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: '#202124', lineHeight: 1 }}>4.9</span>
          <div>
            <div style={{ fontSize: 17, color: '#fbbc04', lineHeight: 1 }}>★★★★★</div>
            <div style={{ fontSize: 10.5, color: '#5f6368' }}>247 reseñas</div>
          </div>
        </div>

        {[[5, 91], [4, 7], [3, 2]].map(([stars, pct], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2.5 }}>
            <span style={{ fontSize: 9.5, color: '#5f6368', width: 7 }}>{stars}</span>
            <div style={{ flex: 1, height: 5, backgroundColor: '#e8eaed', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${i === 0 ? ratingPct * pct : pct}%`, backgroundColor: '#fbbc04', borderRadius: 3, transition: 'none' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Reviews list */}
      <div style={{ flex: 1, overflowY: 'hidden' }}>
        {REVIEWS.map((r, i) => {
          const lf = Math.max(0, frame - (i * 14 + 22));
          const opacity = interpolate(lf, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
          const ty = interpolate(lf, [0, 10], [8, 0], { extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{ padding: '8px 13px', borderBottom: '1px solid #f1f3f4', opacity, transform: `translateY(${ty}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{r.name[0]}</div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: '#202124' }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: '#5f6368' }}>{r.time}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#fbbc04', marginBottom: 2 }}>{'★'.repeat(r.stars)}</div>
              <div style={{ fontSize: 11.5, color: '#3c4043', lineHeight: 1.4 }}>{r.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Screen 4: Analytics de crecimiento ─────────────────────────────────────

export const GrowthAnalyticsScreen: React.FC<{ mode?: 'growth' | 'flat' }> = ({ mode = 'growth' }) => {
  const frame = useCurrentFrame();

  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'];
  const GROWTH_VAL = [22, 34, 45, 61, 84, 127];
  const FLAT_VAL   = [45, 43, 46, 44, 43, 45];
  const VALUES = mode === 'growth' ? GROWTH_VAL : FLAT_VAL;
  const MAX = mode === 'growth' ? 127 : 50;

  const counterEnd = mode === 'growth' ? 127 : 45;
  const counterVal = Math.round(interpolate(frame, [30, 60], [0, counterEnd], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) }));
  const trendColor = mode === 'growth' ? '#30d158' : '#ff453a';
  const trendText = mode === 'growth' ? '+127% este mes' : 'Sin crecimiento';

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#1c1c1e', display: 'flex', flexDirection: 'column', fontFamily: SF }}>
      <StatusBar time="9:41" />

      <div style={{ flex: 1, padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10.5, color: '#636366', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase' as const }}>Clientes nuevos / mes</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>{counterVal}</span>
            <span style={{ fontSize: 12, color: trendColor, fontWeight: 600 }}>{trendText}</span>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 7 }}>
          {VALUES.map((v, i) => {
            const barDelay = i * 6 + 8;
            const barLf = Math.max(0, frame - barDelay);
            const barPct = interpolate(barLf, [0, 38], [0, v / MAX], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            const isLast = i === VALUES.length - 1;
            const barColor = mode === 'growth'
              ? (isLast ? 'linear-gradient(180deg, #E87722 0%, #ff9f50 100%)' : 'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%)')
              : 'linear-gradient(180deg, #48484a 0%, #3a3a3c 100%)';

            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 140 }}>
                  <div style={{
                    width: '100%', borderRadius: '5px 5px 2px 2px',
                    height: `${Math.max(barPct * 100, barPct > 0 ? 3 : 0)}%`,
                    background: barColor,
                    boxShadow: isLast && mode === 'growth' ? '0 0 14px rgba(232,119,34,0.45)' : 'none',
                  }} />
                </div>
                <div style={{ fontSize: 8.5, color: isLast && mode === 'growth' ? '#E87722' : '#636366', fontWeight: isLast ? 700 : 400, letterSpacing: 0.5 }}>{MONTHS[i]}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom callout */}
        <div style={{
          padding: '8px 11px', borderRadius: 10,
          backgroundColor: mode === 'growth' ? 'rgba(232,119,34,0.12)' : 'rgba(255,69,58,0.10)',
          border: `1px solid ${mode === 'growth' ? 'rgba(232,119,34,0.28)' : 'rgba(255,69,58,0.25)'}`,
        }}>
          <div style={{ fontSize: 11.5, color: mode === 'growth' ? '#E87722' : '#ff453a', fontWeight: 700 }}>
            {mode === 'growth' ? 'Con automatización IA' : 'Sin datos medibles'}
          </div>
          <div style={{ fontSize: 10.5, color: '#aeaeb2', marginTop: 1.5 }}>
            {mode === 'growth' ? '3× más conversiones vs. atención manual' : 'No sabes qué funciona y qué no'}
          </div>
        </div>
      </div>
    </div>
  );
};
