import './index.css';
import { Composition } from 'remotion';
import { wordsToFrames } from './compositions/Full';
import { Stats } from './compositions/Stats';
import { Intro } from './compositions/Intro';
import { Full } from './compositions/Full';
import { Carousel } from './compositions/Carousel';
import { AvatarCaptions } from './compositions/AvatarCaptions';
import { Reel } from './compositions/Reel';
import { LightPreview } from './compositions/LightPreview';
import { Keyword } from './compositions/Keyword';


const W = 1080;
const H = 1920;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DG-Stats"
        component={Stats}
        calculateMetadata={async ({ props }) => {
          const SETTLE = 10;
          const CAP = Math.round(FPS * 7);
          const s1  = Math.min(wordsToFrames(props.hook, FPS, 4.0), CAP);
          const s2  = Math.min(wordsToFrames(props.stat1.label, FPS, 4.5), CAP);
          const s3  = Math.min(wordsToFrames(props.stat2.label, FPS, 4.5), CAP);
          const s4  = Math.min(wordsToFrames(props.insight, FPS, 4.0), CAP);
          const s5  = Math.min(wordsToFrames(props.cta, FPS, 4.0), CAP);
          const sLo = Math.round(3.0 * FPS);
          return { durationInFrames: s1 + s2 + s3 + s4 + s5 + sLo - 5 * SETTLE, props };
        }}
        durationInFrames={745}
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
        calculateMetadata={async ({ props }) => {
          const SETTLE = 10;
          const s1 = wordsToFrames(`${props.line1} ${props.line2}`, FPS, 4.0);
          const s2 = wordsToFrames(props.tagline, FPS, 4.5);
          const s3 = wordsToFrames(props.cta, FPS, 3.5);
          const sL = Math.round(3.0 * FPS);
          return { durationInFrames: s1 + s2 + s3 + sL - 3 * SETTLE, props };
        }}
        durationInFrames={495}
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
        calculateMetadata={async ({ props }) => {
          const SETTLE = 10;
          const CAP = Math.round(FPS * 7);
          const hookF = Math.min(wordsToFrames(props.hook, FPS, 4.0), CAP);
          const s1F   = Math.min(wordsToFrames(`${props.scene1_titulo} ${props.scene1_cuerpo}`, FPS, 3.8), CAP);
          const s2F   = Math.min(wordsToFrames(`${props.scene2_titulo} ${props.scene2_cuerpo}`, FPS, 3.8), CAP);
          const s3F   = Math.min(wordsToFrames(`${props.scene3_titulo} ${props.scene3_cuerpo}`, FPS, 3.8), CAP);
          const s4F   = Math.min(wordsToFrames(`${props.scene4_titulo} ${props.scene4_cuerpo}`, FPS, 3.8), CAP);
          const ctaF  = Math.min(wordsToFrames(props.cta, FPS, 4.5), CAP);
          const logoF = Math.round(3.0 * FPS);
          return {
            durationInFrames: hookF + s1F + s2F + s3F + s4F + ctaF + logoF - 6 * SETTLE,
            props,
          };
        }}
        durationInFrames={900}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          hook: 'Hay lunes en que llegas con energía — y el negocio ya tiene [[3 urgencias]] que resolver antes de las 9am',
          scene1_titulo: 'El peso recae siempre en el dueño',
          scene1_cuerpo: 'Sé lo frustrante que es ver cómo el día a día no deja espacio para lo que realmente mueve el negocio.',
          scene2_titulo: '[[He visto]] el patrón repetirse',
          scene2_cuerpo: 'Equipos que pasaban el día apagando incendios — y con solo ordenar cómo operan, cada persona empezó a enfocarse en lo que genera dinero.',
          scene3_titulo: 'Digital Growth construye ese proceso',
          scene3_cuerpo: 'Para que el negocio funcione aunque tú no estés mirando. No para reemplazar a tu equipo — para que cada uno sepa exactamente qué hacer.',
          scene4_titulo: 'El dueño pierde [[12 horas]]',
          scene4_cuerpo: 'por semana en tareas repetitivas que no deberían depender de él para resolverse.',
          cta: 'Comenta la palabra [[TIEMPO]] y te enviamos un documento con las tareas que más horas le roban a tu equipo — y cómo otros dueños las resolvieron sin contratar a nadie más.',
          dolor: 'TIEMPO',
        }}
      />

      <Composition
        id="DG-Carousel"
        component={Carousel}
        calculateMetadata={async ({ props }) => {
          const SETTLE = 10;
          const CAP = Math.round(FPS * 8);
          const slides = props.slides || [];
          const slideDs = slides.map((s: { headline: string; body: string }) =>
            Math.min(wordsToFrames(`${s.headline} ${s.body}`, FPS, 4.0), CAP)
          );
          const logoD = Math.round(3.0 * FPS);
          return {
            durationInFrames: slideDs.reduce((a: number, b: number) => a + b, 0) + logoD - slides.length * SETTLE,
            props,
          };
        }}
        durationInFrames={570}
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
        id="DG-Reel"
        component={Reel}
        calculateMetadata={async ({ props }) => {
          const SETTLE = 10;
          const CAP_BEAT = Math.round(FPS * 7);
          const CAP_CTA  = Math.round(FPS * 7);
          const b1 = Math.min(wordsToFrames(props.beat1, FPS, 2.5), CAP_BEAT);
          const b2 = Math.min(wordsToFrames(props.beat2, FPS, 2.5), CAP_BEAT);
          const b3 = Math.min(wordsToFrames(props.beat3, FPS, 2.5), CAP_BEAT);
          const b4 = Math.min(wordsToFrames(props.beat4, FPS, 2.5), CAP_BEAT);
          const ct = Math.min(wordsToFrames(props.cta, FPS, 3.5), CAP_CTA);
          const lo = Math.round(3.0 * FPS);
          return { durationInFrames: b1 + b2 + b3 + b4 + ct + lo - 5 * SETTLE, props };
        }}
        durationInFrames={520}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          beat1: '3 de cada 10 llamadas',
          beat2: 'sin respuesta al día',
          beat3: 'son [[3 clientes]] que pierdes',
          beat4: 'para siempre',
          cta: 'Nosotros lo [[resolvemos]] esta semana',
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

      <Composition
        id="DG-Keyword"
        component={Keyword}
        calculateMetadata={async ({ props }) => {
          const SETTLE = 10;
          const CAP = Math.round(FPS * 7);
          const hd = Math.min(wordsToFrames(props.hook, FPS, 3.0), CAP);
          const pd = Math.min(wordsToFrames(props.problema, FPS, 3.0), CAP);
          const rd = Math.min(wordsToFrames(props.prueba, FPS, 3.0), CAP);
          const cd = Math.min(wordsToFrames(`${props.cta} ${props.lead_magnet_label}`, FPS, 3.5), CAP);
          const ld = Math.round(3.0 * FPS);
          return { durationInFrames: hd + pd + rd + cd + ld - 4 * SETTLE, props };
        }}
        durationInFrames={485}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{
          hook: '¿Tu negocio pierde [[clientes]] mientras duermes?',
          problema: 'Cada llamada sin respuesta son [[$30]] que se van con la competencia.',
          prueba: 'Con atención automática: [[+40%]] de citas en el primer mes.',
          cta: 'Comenta [[CLIENTES]] y te mando gratis la checklist',
          lead_magnet_label: '7 automatizaciones que todo negocio en Ecuador necesita en 2026',
        }}
      />

      {/* Light theme preview — validar contraste y sombras antes de propagar */}
      <Composition
        id="DG-LightPreview"
        component={LightPreview}
        durationInFrames={120}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{}}
      />
    </>
  );
};
