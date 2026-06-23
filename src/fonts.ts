import { loadFont } from '@remotion/google-fonts/Montserrat';

const { fontFamily } = loadFont('normal', {
  subsets: ['latin'],
  weights: ['400', '600', '700', '800', '900'],
});

export { fontFamily };

export const COLORS = {
  bg: '#080808',
  primary: '#FFFFFF',
  orange: '#E87722',
  gray: 'rgba(255,255,255,0.40)',
  lightGray: 'rgba(255,255,255,0.12)',
  mediumGray: 'rgba(255,255,255,0.65)',
  offWhite: '#F5F5F5',
};

export const SAFE = {
  x: 80,
  y: 120,
  width: 1080 - 160,
};
