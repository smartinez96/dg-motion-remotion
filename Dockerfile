FROM node:20-bookworm-slim

# Install Chrome dependencies for Remotion renderer
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  wget \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Wrapper that injects required Docker flags — Remotion's ChromiumOptions has no 'args' field
RUN printf '#!/bin/sh\nexec /usr/bin/chromium --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu "$@"\n' \
    > /usr/local/bin/chromium-docker && chmod +x /usr/local/bin/chromium-docker

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/local/bin/chromium-docker
ENV REMOTION_CHROME_EXECUTABLE=/usr/local/bin/chromium-docker

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev 2>/dev/null || npm install

COPY . .

RUN mkdir -p output

EXPOSE 3333

CMD ["node", "server/render-server.js"]
