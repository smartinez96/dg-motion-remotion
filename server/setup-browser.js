// Downloads Chrome for Testing at Docker build time and creates a --no-sandbox wrapper.
// ensureBrowser() returns BrowserStatus: { type, path } — not { command }.
const { ensureBrowser } = require('@remotion/renderer');
const { writeFileSync, existsSync } = require('fs');

ensureBrowser({ logLevel: 'verbose' })
  .then((result) => {
    console.log('Browser status:', JSON.stringify(result));

    if (!result.path) {
      throw new Error('No browser path in result: ' + JSON.stringify(result));
    }
    if (!existsSync(result.path)) {
      throw new Error('Binary not found at path: ' + result.path);
    }

    console.log('Chrome binary at:', result.path);

    // --disable-gpu disables Chrome's GPU process, forcing the native CSS software compositor.
    // Our compositions are pure CSS/React — no WebGL needed. The CSS compositor is much faster
    // than SwiftShader (software GPU emulator) for HTML/CSS rendering in a Docker container.
    const wrapper = [
      '#!/bin/sh',
      `exec ${result.path} --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu "$@"`,
      '',
    ].join('\n');

    writeFileSync('/usr/local/bin/remotion-chrome', wrapper, { mode: 0o755 });
    console.log('Wrapper created at /usr/local/bin/remotion-chrome');
  })
  .catch((e) => {
    console.error('Browser setup failed:', e.message);
    process.exit(1);
  });
