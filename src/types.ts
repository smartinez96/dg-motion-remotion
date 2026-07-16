export type StatItem = {
  number: string;
  label: string;
};

export type StatsProps = {
  hook: string;
  stat1: StatItem;
  stat2: StatItem;
  insight: string;
  cta: string;
  badge?: string;
  theme?: 'dark' | 'light';
};

export type IntroProps = {
  line1: string;
  line2: string;
  tagline: string;
  cta: string;
  theme?: 'dark' | 'light';
};

export type FullProps = {
  hook: string;
  scene1_titulo: string;
  scene1_cuerpo: string;
  scene2_titulo: string;
  scene2_cuerpo: string;
  scene3_titulo: string;
  scene3_cuerpo: string;
  scene4_titulo: string;
  scene4_cuerpo: string;
  cta: string;
  dolor?: string;
  theme?: 'dark' | 'light';
};

export type SlideItem = {
  headline: string;
  body: string;
};

export type CarouselProps = {
  slides: SlideItem[];
  title?: string;
  theme?: 'dark' | 'light';
};

export type ReelProps = {
  beat1: string;
  beat2: string;
  beat3: string;
  beat4: string;
  cta: string;
  theme?: 'dark' | 'light';
};

export type KeywordProps = {
  hook: string;
  problema: string;
  prueba: string;
  cta: string;
  lead_magnet_label: string;
  theme?: 'dark' | 'light';
};

export type CaptionGroup = {
  text: string;
  start: number;
  end: number;
};

export type AvatarCaptionsProps = {
  avatarVideoUrl: string;
  groups: CaptionGroup[];
  audioDurationSecs: number;
};
