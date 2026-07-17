const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://digital-growth-dg-remotion.fgb9uu.easypanel.host';
const PORT = process.env.PORT || 3333;

const AVATARES_DIR = path.join(__dirname, '..', 'public', 'avatares');
const FILES_DIR = path.join(__dirname, '..', 'public', 'files');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(AVATARES_DIR)) fs.mkdirSync(AVATARES_DIR, { recursive: true });
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR, { recursive: true });

app.use('/output', express.static(OUTPUT_DIR));
app.use('/avatares', express.static(AVATARES_DIR));
app.use('/files', express.static(FILES_DIR));

// Use the pre-built bundle baked into the Docker image (build/ is created by `npx remotion bundle`
// during docker build). Falls back to runtime bundling in local dev when build/ doesn't exist.
const PREBUNDLE_PATH = path.join(__dirname, '..', 'build');
let bundleLocation = fs.existsSync(PREBUNDLE_PATH) ? PREBUNDLE_PATH : null;

if (bundleLocation) {
  console.log('Using pre-built bundle:', bundleLocation);
}

async function getBundle() {
  if (bundleLocation) return bundleLocation;

  console.log('Pre-built bundle not found. Bundling Remotion project at runtime (dev mode)...');
  bundleLocation = await bundle({
    entryPoint: path.join(__dirname, '..', 'src', 'index.ts'),
    webpackOverride: (config) => config,
  });
  console.log('Bundle ready:', bundleLocation);
  return bundleLocation;
}

const BROWSER_EXECUTABLE = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';
const CHROMIUM_OPTIONS = {
  disableWebSecurity: true,
  gl: 'swangle',
  enableMultiProcessOnLinux: false,
};

const COMP_MAP = {
  stats: 'DG-Stats',
  intro: 'DG-Intro',
  full: 'DG-Full',
  carousel: 'DG-Carousel',
  reel: 'DG-Reel',
  keyword: 'DG-Keyword',
  lightpreview: 'DG-LightPreview',
};

const avatarJobs = {};

function buildInputProps(type, content) {
  const theme = content.theme === 'light' ? 'light' : 'dark';

  if (type === 'stats') {
    return {
      hook: content.hook || '',
      stat1: content.stat1 || { number: '0', label: '' },
      stat2: content.stat2 || { number: '0', label: '' },
      insight: content.insight || '',
      cta: content.cta || '',
      theme,
    };
  }

  if (type === 'intro') {
    return {
      line1: content.line1 || 'DIGITAL GROWTH',
      line2: content.line2 || 'AI Marketing Agency',
      tagline: content.tagline || '',
      cta: content.cta || '',
      theme,
    };
  }

  if (type === 'full') {
    return {
      hook: content.hook || '',
      scene1_titulo: content.scene1_titulo || '',
      scene1_cuerpo: content.scene1_cuerpo || '',
      scene2_titulo: content.scene2_titulo || '',
      scene2_cuerpo: content.scene2_cuerpo || '',
      scene3_titulo: content.scene3_titulo || '',
      scene3_cuerpo: content.scene3_cuerpo || '',
      scene4_titulo: content.scene4_titulo || '',
      scene4_cuerpo: content.scene4_cuerpo || '',
      cta: content.cta || '',
      dolor: content.dolor || '',
      theme,
    };
  }

  if (type === 'reel') {
    return {
      beat1: content.beat1 || '',
      beat2: content.beat2 || '',
      beat3: content.beat3 || '',
      beat4: content.beat4 || '',
      cta: content.cta || '',
      theme,
    };
  }

  if (type === 'keyword') {
    return {
      hook: content.hook || '',
      problema: content.problema || '',
      prueba: content.prueba || '',
      cta: content.cta || '',
      lead_magnet_label: content.lead_magnet_label || '',
      theme,
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
      theme,
    };
  }

  return content;
}

app.post('/render', async (req, res) => {
  const { type, content } = req.body;

  if (!type || !content) {
    return res.status(400).json({ error: 'type and content are required' });
  }

  const compositionId = COMP_MAP[type];
  if (!compositionId) {
    return res.status(400).json({ error: `Unknown type: ${type}. Valid: stats, intro, full, carousel, lightpreview` });
  }

  const filename = `dg-${type}-${Date.now()}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  const inputProps = buildInputProps(type, content);

  const RENDER_TIMEOUT_MS = 890_000; // just under n8n's 900s limit
  const timeoutHandle = setTimeout(() => {
    if (!res.headersSent) res.status(500).json({ error: 'Render timed out after 14.8 minutes' });
  }, RENDER_TIMEOUT_MS);

  try {
    const serveUrl = await getBundle();
    console.log(`[render] bundle=${serveUrl} type=${type}`);

    const withTimeout = (promise, label, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
        ),
      ]);

    console.log('[render] calling selectComposition...');
    const composition = await withTimeout(
      selectComposition({
        serveUrl,
        id: compositionId,
        inputProps,
        browserExecutable: BROWSER_EXECUTABLE,
        chromiumOptions: CHROMIUM_OPTIONS,
      }),
      'selectComposition',
      45_000
    );
    console.log(`[render] composition selected: ${compositionId} (${composition.durationInFrames}f)`);

    console.log('[render] calling renderMedia...');
    await withTimeout(
      renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps,
        imageFormat: 'jpeg',
        jpegQuality: 90,
        browserExecutable: BROWSER_EXECUTABLE,
        chromiumOptions: CHROMIUM_OPTIONS,
        onProgress: ({ progress }) => {
          if (Math.round(progress * 100) % 10 === 0) {
            console.log(`[render] progress: ${Math.round(progress * 100)}%`);
          }
        },
      }),
      'renderMedia',
      870_000
    );

    clearTimeout(timeoutHandle);
    const videoUrl = `${PUBLIC_BASE_URL}/output/${filename}`;
    console.log('Rendered:', videoUrl);
    if (!res.headersSent) res.json({ url: videoUrl, filename });

    // Cleanup old files (keep last 20)
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter((f) => f.endsWith('.mp4'))
      .map((f) => ({ name: f, time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    files.slice(20).forEach((f) => {
      try { fs.unlinkSync(path.join(OUTPUT_DIR, f.name)); } catch (_) {}
    });
  } catch (err) {
    clearTimeout(timeoutHandle);
    console.error('Render error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

app.post('/render-avatar', async (req, res) => {
  const { content } = req.body;
  if (!content || !content.avatarVideoUrl || !content.groups || !content.audioDurationSecs) {
    return res.status(400).json({ error: 'content.avatarVideoUrl, content.groups, content.audioDurationSecs required' });
  }

  const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  avatarJobs[jobId] = { status: 'processing' };
  res.json({ id: jobId, status: 'processing' });

  setImmediate(async () => {
    try {
      const serveUrl = await getBundle();
      const OUTRO_SECS = 4;
      const FPS = 30;
      const durationInFrames = Math.round((content.audioDurationSecs + OUTRO_SECS) * FPS);

      const inputProps = {
        avatarVideoUrl: content.avatarVideoUrl,
        groups: content.groups,
        audioDurationSecs: content.audioDurationSecs,
      };

      const composition = await selectComposition({
        serveUrl,
        id: 'DG-AvatarCaptions',
        inputProps,
        browserExecutable: BROWSER_EXECUTABLE,
        chromiumOptions: CHROMIUM_OPTIONS,
      });
      composition.durationInFrames = durationInFrames;

      const filename = `dg-avatar-${Date.now()}.mp4`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps,
        browserExecutable: BROWSER_EXECUTABLE,
        chromiumOptions: CHROMIUM_OPTIONS,
      });

      const videoUrl = `${PUBLIC_BASE_URL}/output/${filename}`;
      avatarJobs[jobId] = { status: 'succeeded', url: videoUrl };
      console.log('Avatar render done:', videoUrl);

      // Keep only last 10 avatar renders
      const avatarFiles = fs.readdirSync(OUTPUT_DIR)
        .filter((f) => f.startsWith('dg-avatar-') && f.endsWith('.mp4'))
        .map((f) => ({ name: f, time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time);
      avatarFiles.slice(10).forEach((f) => {
        try { fs.unlinkSync(path.join(OUTPUT_DIR, f.name)); } catch (_) {}
      });
    } catch (err) {
      console.error('Avatar render error:', err);
      avatarJobs[jobId] = { status: 'failed', error: err.message };
    }
  });
});

app.get('/render-avatar-status/:id', (req, res) => {
  const job = avatarJobs[req.params.id];
  if (!job) return res.status(404).json({ error: 'not found' });
  res.json(job);
});

// Upload a static file to /files/ — accepts { filename, content } (content = base64 or utf8 string)
app.post('/files/upload', (req, res) => {
  const { filename, content, encoding } = req.body;
  if (!filename || !content) return res.status(400).json({ error: 'filename and content required' });
  const safe = path.basename(filename);
  const dest = path.join(FILES_DIR, safe);
  try {
    const buf = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8');
    fs.writeFileSync(dest, buf);
    const url = `${PUBLIC_BASE_URL}/files/${safe}`;
    console.log('File saved:', url);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Diagnostic: launch Chrome directly and return version + exit info
app.get('/debug/chrome', (req, res) => {
  const { execFile } = require('child_process');
  const chromePath = BROWSER_EXECUTABLE;
  const args = ['--version', '--no-sandbox', '--disable-setuid-sandbox'];

  res.setTimeout(15000);
  execFile(chromePath, args, { timeout: 10000 }, (err, stdout, stderr) => {
    res.json({
      chromePath,
      exists: fs.existsSync(chromePath),
      stdout: stdout?.trim(),
      stderr: stderr?.trim().slice(0, 500),
      exitCode: err?.code ?? 0,
      error: err?.message,
    });
  });
});

// Diagnostic: render only first 30 frames to measure rendering speed
app.get('/debug/render-speed', async (req, res) => {
  res.setTimeout(120000);
  try {
    const serveUrl = await getBundle();
    const testProps = { hook: 'test', stat1: { number: '1%', label: 't' }, stat2: { number: '2x', label: 't' }, insight: 'test', cta: 'test', theme: 'dark' };
    const composition = await selectComposition({
      serveUrl, id: 'DG-Stats', inputProps: testProps,
      browserExecutable: BROWSER_EXECUTABLE, chromiumOptions: CHROMIUM_OPTIONS,
    });
    composition.durationInFrames = 30;

    const t0 = Date.now();
    const tmpOut = path.join(OUTPUT_DIR, `debug-speed-${Date.now()}.mp4`);
    await renderMedia({
      composition, serveUrl, codec: 'h264', outputLocation: tmpOut,
      inputProps: testProps, imageFormat: 'jpeg',
      browserExecutable: BROWSER_EXECUTABLE, chromiumOptions: CHROMIUM_OPTIONS,
    });
    const elapsed = Date.now() - t0;
    try { fs.unlinkSync(tmpOut); } catch (_) {}
    res.json({ frames: 30, elapsedMs: elapsed, msPerFrame: Math.round(elapsed / 30), estimatedFullStats: `${Math.round((elapsed / 30 * 745) / 1000)}s` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Diagnostic: test selectComposition with 12s timeout
app.get('/debug/select', async (req, res) => {
  res.setTimeout(20000);
  try {
    const serveUrl = await getBundle();
    const result = await Promise.race([
      selectComposition({
        serveUrl,
        id: 'DG-Stats',
        inputProps: { hook: 'test', stat1: { number: '1%', label: 'test' }, stat2: { number: '2x', label: 'test' }, insight: 'test', cta: 'test', theme: 'dark' },
        browserExecutable: BROWSER_EXECUTABLE,
        chromiumOptions: CHROMIUM_OPTIONS,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('selectComposition timed out 12s')), 12000)),
    ]);
    res.json({ success: true, fps: result.fps, durationInFrames: result.durationInFrames });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack?.slice(0, 800) });
  }
});

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  bundleReady: !!bundleLocation,
  bundlePath: bundleLocation,
  prebundleExists: fs.existsSync(PREBUNDLE_PATH),
}));

app.listen(PORT, async () => {
  console.log(`DG Render Server running on port ${PORT}`);
  // Pre-warm the bundle on startup
  try {
    await getBundle();
  } catch (err) {
    console.error('Bundle pre-warm failed:', err.message);
  }
});
