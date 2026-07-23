import os, json, tempfile, subprocess, requests, shutil
from pathlib import Path
from flask import Flask, request, jsonify
import anthropic

app = Flask(__name__)

ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
BOT_TOKEN     = os.environ["TELEGRAM_BOT_TOKEN"]
UNSPLASH_KEY  = os.environ.get("UNSPLASH_ACCESS_KEY", "")

SCRIPT_DIR = Path(__file__).parent
GENERATOR  = SCRIPT_DIR / "generate_carousel.py"

# ── System prompt para Claude ─────────────────────────────────────────────────
SYSTEM_PROMPT = """Eres el generador de contenido de carruseles para Digital Growth, agencia de IA y Marketing Digital en Quito, Ecuador.

Tu trabajo es generar un JSON de configuración de carrusel de Instagram (1080x1350px, formato PNG). El contenido es para dueños de negocios locales en Ecuador y Latinoamérica.

ESTRUCTURA DEL JSON (responde ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown):

{
  "name": "nombre-kebab-case-del-tema",
  "theme": "dark",
  "bg_style": "mesh",
  "slides": [...]
}

TIPOS DE SLIDES Y SUS CAMPOS EXACTOS:

cover: {"type":"cover","bg_style":"...","photo_query":"...","tag":"CATEGORÍA","hook":"Frase gancho de impacto","cta_swipe":"Desliza y descúbrelo →"}
content: {"type":"content","bg_style":"...","photo_query":"...","tag":"CATEGORÍA","headline":"Título","points":["punto 1","punto 2","punto 3"]}
stat: {"type":"stat","bg_style":"...","photo_query":"...","tag":"CATEGORÍA","stat":"X%","label":"descripción del dato","context":"fuente o contexto"}
tip: {"type":"tip","bg_style":"...","tag":"CATEGORÍA","title":"Título del tip","tips":[{"icon":"🔥","text":"consejo"},{"icon":"✅","text":"consejo"}]}
quote: {"type":"quote","bg_style":"...","photo_query":"...","quote":"Frase poderosa.","author":"Digital Growth","author_role":"Quito, Ecuador"}
timeline: {"type":"timeline","bg_style":"...","tag":"CATEGORÍA","title":"Título","items":[{"year":"2020","text":"Evento"},{"year":"2024","text":"Evento"}]}
process: {"type":"process","bg_style":"...","tag":"CATEGORÍA","title":"Título del proceso","steps":[{"title":"Paso","desc":"Descripción"}]}
before_after: {"type":"before_after","bg_style":"...","tag":"CATEGORÍA","title":"Título","before":{"label":"SIN IA","points":["punto"]},"after":{"label":"CON IA","points":["punto"]}}
news: {"type":"news","bg_style":"...","photo_query":"...","tag":"ACTUALIDAD","headline":"Titular de noticia","body":"Cuerpo de 2-3 líneas","source":"Fuente"}
educational: {"type":"educational","bg_style":"...","tag":"CATEGORÍA","headline":"Título educativo","points":[{"icon":"🧠","title":"Concepto","desc":"Explicación breve"}]}
cta: {"type":"cta","bg_style":"...","photo_query":"...","tag":"TU TURNO","headline":"¿Pregunta de cierre impactante?","subtext":"Diagnóstico gratuito en 20 minutos. Sin compromisos.","cta":"Escríbenos ahora"}

ESTILOS DE FONDO (bg_style):
- "solid": fondo puro, elegante
- "mesh": gradiente naranja ambient, premium
- "cinematic": gradiente marrón oscuro cinematográfico
- "grid": cuadrícula naranja sutil
- "dots": puntos naranja sutiles
- "glow": resplandor naranja central
- "photo": foto real de Unsplash (requiere photo_query en inglés)

REGLAS OBLIGATORIAS:
1. El PRIMER slide siempre es "cover" con hook que genere curiosidad o urgencia
2. El ÚLTIMO slide siempre es "cta" con las frases exactas de Digital Growth
3. Contenido en español, directo, para dueños de negocios (restaurantes, clínicas, gimnasios, etc.)
4. El campo "tag" siempre en MAYÚSCULAS
5. Si un slide tiene bg_style "photo", DEBE tener photo_query en inglés relevante al contenido
6. No repetir el mismo tipo de slide más de 2 veces seguidas
7. Mezclar estilos de fondo para variedad visual
8. Las estadísticas deben sonar reales y relevantes para Ecuador/LATAM
9. El CTA siempre termina con "Escríbenos ahora" y "Diagnóstico gratuito en 20 minutos"

RESPONDE ÚNICAMENTE CON EL JSON. SIN EXPLICACIONES. SIN MARKDOWN. SIN TEXTO ANTES O DESPUÉS."""

# ── Generar config con Claude ─────────────────────────────────────────────────
def call_claude(topic: str, theme: str, num_slides: int) -> dict:
    bg_map   = {"photo": "photo", "light": "solid", "dark": "mesh"}
    bg_style = bg_map.get(theme, "mesh")
    theme_v  = "dark" if theme in ("dark", "photo") else "light"

    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    msg = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": (
                f"Genera un carrusel de exactamente {num_slides} slides sobre el tema: \"{topic}\"\n"
                f"Tema visual: {theme_v}\n"
                f"Estilo de fondo predominante: {bg_style}\n"
                f"{'Si el bg_style es photo, incluye photo_query en inglés en cada slide.' if bg_style == 'photo' else 'Puedes mezclar bg_style variados pero sin photo.'}\n"
                f"El nombre del carrusel en kebab-case debe reflejar el tema."
            )
        }]
    )
    raw = msg.content[0].text.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1])
    return json.loads(raw)

# ── Enviar imágenes a Telegram ────────────────────────────────────────────────
def send_images_to_telegram(chat_id: str, image_paths: list):
    tg_url = f"https://api.telegram.org/bot{BOT_TOKEN}"

    for batch_start in range(0, len(image_paths), 10):
        batch = image_paths[batch_start:batch_start + 10]
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
@app.route("/generate", methods=["POST"])
def generate():
    data       = request.json or {}
    topic      = data.get("topic", "").strip()
    theme      = data.get("theme", "dark")
    num_slides = int(data.get("num_slides", 7))
    chat_id    = str(data.get("chat_id", ""))

    if not topic or not chat_id:
        return jsonify({"error": "topic y chat_id son requeridos"}), 400

    config_path = None
    out_dir     = None

    try:
        # 1. Claude genera el JSON del carrusel
        config = call_claude(topic, theme, num_slides)
        config["unsplash_key"] = UNSPLASH_KEY

        # 2. Guardar JSON en archivo temporal
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, encoding="utf-8"
        ) as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
            config_path = f.name

        # 3. Directorio de salida temporal
        out_dir = Path(tempfile.mkdtemp())

        # 4. Correr el generador (mismo script, mismo resultado visual)
        result = subprocess.run(
            ["python3", str(GENERATOR), config_path, "--output", str(out_dir)],
            capture_output=True, text=True, timeout=180
        )
        print(result.stdout)
        if result.returncode != 0:
            raise Exception(f"Generator stderr: {result.stderr[:500]}")

        # 5. Recolectar imágenes generadas
        name       = config.get("name", "carousel").replace(" ", "-").lower()
        slide_dir  = out_dir / name
        images     = sorted(slide_dir.glob("*.png"))

        if not images:
            raise Exception(f"No se generaron imágenes en {slide_dir}")

        # 6. Enviar al chat de Telegram
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
