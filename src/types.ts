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
  scene1: string;
  scene2: string;
  scene3: string;
  scene4: string;
  cta: string;
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
