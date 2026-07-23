FROM python:3.12-slim

WORKDIR /app

# System deps for Chromium/Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget curl gnupg ca-certificates \
    libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
    libasound2 libx11-6 libxcb1 libxext6 fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright's Chromium
RUN playwright install chromium --with-deps

COPY . .

EXPOSE 5000

CMD ["python3", "app.py"]
