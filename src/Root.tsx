import './index.css';
import { Composition } from 'remotion';
import { Stats } from './compositions/Stats';
import { Intro } from './compositions/Intro';
import { Full } from './compositions/Full';
import { Carousel } from './compositions/Carousel';
import { AvatarCaptions } from './compositions/AvatarCaptions';


const W = 1080;
const H = 1920;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DG-Stats"
        component={Stats}
        durationInFrames={Math.round(19 * FPS)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          hook: '¿Cuántos clientes pierde tu negocio [[cada noche]]?',
          stat1: { number: '73%', label: 'de clientes no regresan si no hay respuesta rápida' },
          stat2: { number: '3x', label: 'más ventas con atención automatizada 24/7' },
          insight: 'La mayoría de negocios pierden clientes [[mientras duermen]]',
          badge: 'LO QUE NADIE TE DICE',
          cta: 'Guarda este video [[antes de que desaparezca]]',
        }}
      />

      <Composition
        id="DG-Intro"
        component={Intro}
        durationInFrames={Math.round(13 * FPS)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          line1: 'DIGITAL GROWTH',
          line2: 'AI Marketing Agency · Quito, Ecuador',
          tagline: 'Sistemas de [[IA]] para negocios que quieren crecer',
          cta: 'Empieza a [[automatizar]] hoy',
        }}
      />

      <Composition
        id="DG-Full"
        component={Full}
        durationInFrames={Math.round(19 * FPS)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          hook: 'El error que cometen los negocios [[con la IA]]',
          scene1: 'Compran herramientas sin estrategia',
          scene2: 'No miden resultados reales',
          scene3: 'Ignoran la automatización de atención al cliente',
          scene4: 'Pierden clientes por no responder a tiempo',
          cta: '[[Digital Growth]] resuelve esto',
        }}
      />

      <Composition
        id="DG-Carousel"
        component={Carousel}
        durationInFrames={Math.round((5 * 4 + 4) * FPS)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          slides: [
            { headline: '¿Qué es un [[agente de IA]]?', body: 'Un sistema que trabaja por ti 24/7 sin descanso ni errores humanos.' },
            { headline: 'No es [[ciencia ficción]]', body: 'Ya funciona en negocios físicos en Ecuador con resultados reales.' },
            { headline: 'Atiende, agenda y [[vende]]', body: 'Sin contratar más personal. Sin pagar horas extra.' },
            { headline: 'Caso [[real]]', body: 'Clínica dental en Quito: +40% de citas agendadas en el primer mes.' },
            { headline: '¿Tu negocio [[está listo]]?', body: 'Diagnóstico gratuito disponible esta semana.' },
          ],
        }}
      />
      <Composition
        id="DG-AvatarCaptions"
        component={AvatarCaptions}
        durationInFrames={Math.round(40 * FPS)}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          avatarVideoUrl: '',
          groups: [],
          audioDurationSecs: 35,
        }}
      />
    </>
  );
};
