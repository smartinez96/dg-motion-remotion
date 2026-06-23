const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3333';
const PORT = process.env.PORT || 3333;

const AVATARES_DIR = path.join(__dirname, '..', 'public', 'avatares');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(AVATARES_DIR)) fs.mkdirSync(AVATARES_DIR, { recursive: true });

app.use('/output', express.static(OUTPUT_DIR));
app.use('/avatares', express.static(AVATARES_DIR));

let bundleLocation = null;

async function getBundle() {
  if (bundleLocation) return bundleLocation;

  console.log('Bundling Remotion project...');
  bundleLocation = await bundle({
    entryPoint: path.join(__dirname, '..', 'src', 'index.ts'),
    webpackOverride: (config) => config,
  });
  console.log('Bundle ready:', bundleLocation);
  return bundleLocation;
}

const COMP_MAP = {
  stats: 'DG-Stats',
  intro: 'DG-Intro',
  full: 'DG-Full',
  carousel: 'DG-Carousel',
};

function buildInputProps(type, content) {
  if (type === 'stats') {
    return {
      hook: content.hook || '',
      stat1: content.stat1 || { number: '0', label: '' },
      stat2: content.stat2 || { number: '0', label: '' },
      insight: content.insight || '',
      cta: content.cta || '',
    };
  }

  if (type === 'intro') {
    return {
      line1: content.line1 || 'DIGITAL GROWTH',
      line2: content.line2 || 'AI Marketing Agency',
      tagline: content.tagline || '',
      cta: content.cta || '',
    };
  }

  if (type === 'full') {
    return {
      hook: content.hook || '',
      scene1: content.scene1 || '',
      scene2: content.scene2 || '',
      scene3: content.scene3 || '',
      scene4: content.scene4 || '',
      cta: content.cta || '',
    };
  }

  if (type === 'carousel') {
    const slides = content.slides || content.slide_content || content.cards || [];
    return {
      slides: slides.map((s) => ({
        headline: s.headline || s.title || '',
        body: s.body || s.text || s.content || '',
      })),
      title: content.title,
    };
  }

  return content;
}

function getCarouselDuration(slides, fps = 30) {
  const count = Array.isArray(slides) ? slides.length : 0;
  if (count === 0) return Math.round(10 * fps);
  return Math.round((count * 4 + 4) * fps);
}

app.post('/render', async (req, res) => {
  const { type, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: 'type and content are required' });
  }

  const compositionId = COMP_MAP[type];
  if (!compositionId) {
    return res.status(400).json({ error: `Unknown type: ${type}. Valid: stats, intro, full, carousel` });
  }

  const filename = `dg-${type}-${Date.now()}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  const inputProps = buildInputProps(type, content);

  try {
    const serveUrl = await getBundle();

    const durationOverride =
      type === 'carousel' ? getCarouselDuration(inputProps.slides) : undefined;

    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps,
    });

    if (durationOverride) {
      composition.durationInFrames = durationOverride;
    }

    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
      chromiumOptions: {
        disableWebSecurity: true,
      },
    });

    const videoUrl = `${PUBLIC_BASE_URL}/output/${filename}`;
    console.log('Rendered:', videoUrl);
    res.json({ url: videoUrl, filename });

    // Cleanup old files (keep last 20)
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter((f) => f.endsWith('.mp4'))
      .map((f) => ({ name: f, time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    files.slice(20).forEach((f) => {
      try { fs.unlinkSync(path.join(OUTPUT_DIR, f.name)); } catch (_) {}
    });
  } catch (err) {
    console.error('Render error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, async () => {
  console.log(`DG Render Server running on port ${PORT}`);
  // Pre-warm the bundle on startup
  try {
    await getBundle();
  } catch (err) {
    console.error('Bundle pre-warm failed:', err.message);
  }
});
