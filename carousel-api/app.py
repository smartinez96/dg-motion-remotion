import os, json, tempfile, subprocess, requests, shutil
from pathlib import Path
from flask import Flask, request, jsonify

app = Flask(__name__)

BOT_TOKEN    = os.environ["TELEGRAM_BOT_TOKEN"]
UNSPLASH_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "")

SCRIPT_DIR = Path(__file__).parent
GENERATOR  = SCRIPT_DIR / "generate_carousel.py"

# ── Enviar imágenes a Telegram ────────────────────────────────────────────────
def send_images_to_telegram(chat_id: str, image_paths: list):
    tg_url = f"https://api.telegram.org/bot{BOT_TOKEN}"
    for batch_start in range(0, len(image_paths), 10):
        batch     = image_paths[batch_start:batch_start + 10]
        media_list = []
        files_map  = {}
        for i, path in enumerate(batch):
            key = f"photo{i}"
            media_list.append({"type": "photo", "media": f"attach://{key}"})
            files_map[key] = (Path(path).name, open(path, "rb"), "image/png")
        resp = requests.post(
            f"{tg_url}/sendMediaGroup",
            data={"chat_id": chat_id, "media": json.dumps(media_list)},
            files=files_map
        )
        for f in files_map.values():
            f[1].close()
        if not resp.ok:
            raise Exception(f"Telegram error {resp.status_code}: {resp.text[:200]}")

# ── Endpoint principal ────────────────────────────────────────────────────────
# Recibe el JSON del carrusel ya generado por Claude (desde n8n)
# Body: { "carousel": {...config completa...}, "chat_id": "123456" }
@app.route("/generate", methods=["POST"])
def generate():
    data     = request.json or {}
    carousel = data.get("carousel")   # JSON completo generado por Claude en n8n
    chat_id  = str(data.get("chat_id", ""))

    if not carousel or not chat_id:
        return jsonify({"error": "carousel (JSON) y chat_id son requeridos"}), 400

    config_path = None
    out_dir     = None

    try:
        # Inyectar Unsplash key si no viene en el JSON
        if UNSPLASH_KEY and not carousel.get("unsplash_key"):
            carousel["unsplash_key"] = UNSPLASH_KEY

        # Guardar JSON en archivo temporal
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, encoding="utf-8"
        ) as f:
            json.dump(carousel, f, ensure_ascii=False, indent=2)
            config_path = f.name

        out_dir = Path(tempfile.mkdtemp())

        # Correr el mismo generador que ya funciona perfecto
        result = subprocess.run(
            ["python3", str(GENERATOR), config_path, "--output", str(out_dir)],
            capture_output=True, text=True, timeout=180
        )
        print(result.stdout)
        if result.returncode != 0:
            raise Exception(f"Generator error: {result.stderr[:500]}")

        name      = carousel.get("name", "carousel").replace(" ", "-").lower()
        slide_dir = out_dir / name
        images    = sorted(slide_dir.glob("*.png"))

        if not images:
            raise Exception(f"No se generaron imágenes en {slide_dir}")

        send_images_to_telegram(chat_id, [str(p) for p in images])

        return jsonify({"status": "ok", "slides": len(images), "name": name})

    except Exception as e:
        print(f"❌ Error: {e}")
        requests.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={"chat_id": chat_id, "text": f"❌ Error generando el carrusel:\n{str(e)[:300]}"}
        )
        return jsonify({"error": str(e)}), 500

    finally:
        if config_path:
            try: os.unlink(config_path)
            except: pass
        if out_dir:
            shutil.rmtree(out_dir, ignore_errors=True)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
