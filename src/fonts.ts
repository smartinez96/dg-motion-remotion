import { loadFont } from '@remotion/google-fonts/Montserrat';
export { COLORS, TOKENS } from './components/tokens';

const { fontFamily } = loadFont('normal', {
  subsets: ['latin'],
  weights: ['400', '600', '700', '800', '900'],
});

export { fontFamily };

export const SAFE = {
  x: 80,
  y: 120,
  width: 1080 - 160,
};
