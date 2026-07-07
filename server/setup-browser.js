// Downloads Chrome for Testing (Remotion-compatible version) at Docker build time
// and creates a wrapper script that injects --no-sandbox for container environments.
const { ensureBrowser } = require('@remotion/renderer');
const { writeFileSync } = require('fs');

ensureBrowser({ logLevel: 'verbose' })
  .then(({ command }) => {
    console.log('Chrome for Testing downloaded at:', command);
    const wrapper = [
      '#!/bin/sh',
      `exec ${command} --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu "$@"`,
      '',
    ].join('\n');
    writeFileSync('/usr/local/bin/remotion-chrome', wrapper, { mode: 0o755 });
    console.log('Wrapper created at /usr/local/bin/remotion-chrome');
  })
  .catch((e) => {
    console.error('Browser setup failed:', e.message);
    process.exit(1);
  });
