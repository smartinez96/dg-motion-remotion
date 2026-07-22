# Imagen base con Playwright + Python + Chromium ya instalados
FROM mcr.microsoft.com/playwright/python:v1.45.0-noble

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Asegurar que Chromium está disponible
RUN playwright install chromium

EXPOSE 5000

CMD ["python3", "app.py"]
