#!/usr/bin/env python3
"""
Digital Growth — Carousel Generator v2
Slides PNG 1080x1350px para Instagram.

Tipos: cover | content | stat | tip | quote | timeline | process | before_after | news | educational | cta
Temas: dark | light
Fondos: solid | mesh | cinematic | grid | dots | glow | photo

Uso: python3 generate_carousel.py <config.json> [--output ./dir]
"""
import json, base64, sys, time, urllib.request, urllib.parse, mimetypes, hashlib, os
from pathlib import Path
from playwright.sync_api import sync_playwright

# ── Constants ──────────────────────────────────────────────────────────────────
W, H      = 1080, 1350
ORANGE    = "#E87722"
HANDLE    = "@digitalgrowth.wr"
FONTS_URL = "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"

# ── Unsplash API ───────────────────────────────────────────────────────────────
# Obtén tu clave gratuita en: https://unsplash.com/developers → "New Application"
# Luego ponla aquí O en variable de entorno UNSPLASH_ACCESS_KEY
UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")

_PHOTO_CACHE = Path(__file__).parent / ".photo_cache"

def _search_unsplash(query: str, key: str) -> str:
    """Busca en Unsplash y devuelve data URI de la mejor foto portrait."""
    if not key:
        return ""
    _PHOTO_CACHE.mkdir(exist_ok=True)
    # Cache por query para no re-descargar
    cache_key  = hashlib.md5(query.lower().encode()).hexdigest()[:10]
    cache_file = _PHOTO_CACHE / f"{cache_key}.jpg"
    if cache_file.exists():
        print(f"  📷  Usando foto cacheada para: '{query}'")
        return _resolve_photo(str(cache_file))
    # Buscar en Unsplash
    search_url = (f"https://api.unsplash.com/search/photos"
                  f"?query={urllib.parse.quote(query)}"
                  f"&per_page=3&orientation=portrait&client_id={key}")
    try:
        req = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            results = json.loads(r.read()).get("results", [])
        if not results:
            print(f"  ⚠️  Sin resultados en Unsplash para: '{query}'")
            return ""
        # Tomar la primera foto, descargar en calidad alta portrait
        photo_url = results[0]["urls"]["regular"] + "&w=1080&h=1350&fit=crop"
        print(f"  📷  Descargando foto Unsplash para: '{query}'")
        time.sleep(1.2)  # evitar burst rate limit (50 req/h free tier)
        req2 = urllib.request.Request(photo_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req2, timeout=15) as r:
            raw = r.read()
        cache_file.write_bytes(raw)
        return f"data:image/jpeg;base64,{base64.b64encode(raw).decode()}"
    except Exception as e:
        print(f"  ⚠️  Error Unsplash ({e})")
        return ""
_LOGO_DIR = Path(__file__).parent / "logos"

def _b64(path):
    with open(path, "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()

LOGO_FULL        = _b64(f"{_LOGO_DIR}/01_full_logo_ds_filled_white_cropped.png")
LOGO_ICON_WHITE  = _b64(f"{_LOGO_DIR}/04_ds_icon_filled_white_cropped.png")
LOGO_ICON_BLACK  = _b64(f"{_LOGO_DIR}/08_ds_icon_black_cropped.png")

# ── Theme tokens ───────────────────────────────────────────────────────────────
THEMES = {
    "dark": {
        "bg"          : "#080808",
        "text"        : "#FFFFFF",
        "text_dim"    : "rgba(255,255,255,0.55)",
        "text_faint"  : "rgba(255,255,255,0.28)",
        "card_bg"     : "rgba(255,255,255,0.04)",
        "card_border" : "rgba(255,255,255,0.07)",
        "prog_off"    : "rgba(255,255,255,0.14)",
        "foot_border" : "rgba(255,255,255,0.08)",
        "divider"     : "rgba(255,255,255,0.10)",
        "logo_icon"   : "white",
        "bad_bg"      : "rgba(255,75,75,0.10)",
        "bad_border"  : "rgba(255,75,75,0.28)",
        "bad_color"   : "#FF5C5C",
        "good_bg"     : "rgba(232,119,34,0.10)",
        "good_border" : "rgba(232,119,34,0.28)",
        "good_color"  : ORANGE,
    },
    "light": {
        "bg"          : "#F5F4F2",
        "text"        : "#0A0A0A",
        "text_dim"    : "rgba(10,10,10,0.58)",
        "text_faint"  : "rgba(10,10,10,0.30)",
        "card_bg"     : "rgba(0,0,0,0.03)",
        "card_border" : "rgba(0,0,0,0.07)",
        "prog_off"    : "rgba(0,0,0,0.12)",
        "foot_border" : "rgba(0,0,0,0.07)",
        "divider"     : "rgba(0,0,0,0.10)",
        "logo_icon"   : "black",
        "bad_bg"      : "rgba(220,50,50,0.07)",
        "bad_border"  : "rgba(220,50,50,0.22)",
        "bad_color"   : "#D03030",
        "good_bg"     : "rgba(232,119,34,0.08)",
        "good_border" : "rgba(232,119,34,0.22)",
        "good_color"  : ORANGE,
    }
}

def logo_icon(T):
    return LOGO_ICON_BLACK if T["logo_icon"] == "black" else LOGO_ICON_WHITE

# ── Background styles ──────────────────────────────────────────────────────────
def get_bg(style: str, T: dict, photo_url: str = ""):
    """Returns (body_bg_css, overlay_html)"""
    bg = T["bg"]
    if style in ("solid", "dark", "light"):
        return f"background:{bg};", ""
    if style == "mesh":
        if T["logo_icon"] == "black":
            return (f"background:radial-gradient(at 5% 10%, rgba(232,119,34,0.28) 0px, transparent 44%),"
                    f"radial-gradient(at 92% 88%, rgba(232,119,34,0.12) 0px, transparent 44%),{bg};", "")
        return (f"background:radial-gradient(at 5% 10%, rgba(232,119,34,0.60) 0px, transparent 42%),"
                f"radial-gradient(at 92% 88%, rgba(232,119,34,0.28) 0px, transparent 42%),"
                f"radial-gradient(at 50% 50%, rgba(232,119,34,0.04) 0px, transparent 65%),{bg};", "")
    if style == "cinematic":
        return "background:linear-gradient(155deg,#0D0906 0%,#1E1208 38%,#100B05 65%,#080808 100%);", ""
    if style == "grid":
        return (f"background-color:{bg};"
                f"background-image:linear-gradient(rgba(232,119,34,0.07) 1px,transparent 1px),"
                f"linear-gradient(90deg,rgba(232,119,34,0.07) 1px,transparent 1px);"
                f"background-size:72px 72px;", "")
    if style == "dots":
        return (f"background-color:{bg};"
                f"background-image:radial-gradient(rgba(232,119,34,0.20) 1.5px,transparent 1.5px);"
                f"background-size:36px 36px;", "")
    if style == "glow":
        return (f"background:radial-gradient(ellipse at 50% 38%, rgba(232,119,34,0.40) 0px, transparent 58%),{bg};", "")
    if style == "photo" and photo_url:
        # Si ya es data URI (devuelto por Unsplash), usarlo directo
        img_src = photo_url if photo_url.startswith("data:") else _resolve_photo(photo_url)
        body_css = f"background-image:url('{img_src}');background-size:cover;background-position:center;"
        overlay  = ('<div style="position:absolute;inset:0;z-index:1;pointer-events:none;'
                    'background:linear-gradient(180deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.28) 30%,'
                    'rgba(0,0,0,0.55) 65%,rgba(0,0,0,0.90) 100%);"></div>')
        return body_css, overlay
    return f"background:{bg};", ""

def _resolve_photo(src: str) -> str:
    """Convierte ruta local o URL a data URI para embed confiable."""
    p = Path(src)
    if p.exists():
        # Archivo local en el Mac
        mime = mimetypes.guess_type(str(p))[0] or "image/jpeg"
        with open(p, "rb") as f:
            return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"
    if src.startswith("http"):
        # URL remota — descargar y embeber
        try:
            req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                data = r.read()
                ct   = r.headers.get_content_type() or "image/jpeg"
                return f"data:{ct};base64,{base64.b64encode(data).decode()}"
        except Exception as e:
            print(f"  ⚠️  No se pudo descargar la foto ({e}), usando fondo sólido")
            return ""
    return src  # fallback: usar como está

# ── Base CSS ───────────────────────────────────────────────────────────────────
def base_css(T, bg_css):
    return f"""@import url('{FONTS_URL}');
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0;}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;{bg_css}
  font-family:'Montserrat',system-ui,sans-serif;color:{T['text']};-webkit-font-smoothing:antialiased;}}"""

# ── Shared components ──────────────────────────────────────────────────────────
def dots(cur, tot, T):
    out = []
    for i in range(tot):
        if i == cur:
            out.append(f'<div style="width:30px;height:5px;border-radius:3px;background:{ORANGE};box-shadow:0 0 8px {ORANGE}AA;flex-shrink:0;"></div>')
        elif i < cur:
            out.append(f'<div style="width:7px;height:5px;border-radius:3px;background:{ORANGE};opacity:0.35;flex-shrink:0;"></div>')
        else:
            out.append(f'<div style="width:7px;height:5px;border-radius:3px;background:{T["prog_off"]};flex-shrink:0;"></div>')
    return f'<div style="display:flex;align-items:center;gap:7px;">{"".join(out)}</div>'

def footer(T, accent=False):
    icon   = logo_icon(T)
    color  = ORANGE if accent else T["text_faint"]
    border = f"border-top:1px solid {'rgba(232,119,34,0.22)' if accent else T['foot_border']};"
    bg_f   = "background:rgba(232,119,34,0.05);" if accent else ""
    return (f'<div style="display:flex;align-items:center;justify-content:space-between;'
            f'padding:24px 72px;{border}{bg_f}position:relative;z-index:2;">'
            f'<span style="font-size:20px;font-weight:700;letter-spacing:2.5px;color:{color};">{HANDLE}</span>'
            f'<img src="{icon}" style="height:38px;opacity:{0.85 if accent else 0.30};">'
            f'</div>')

def badge(tag, T, sm=False):
    fs = "17px" if sm else "19px"
    py = "7px" if sm else "9px"
    px = "18px" if sm else "22px"
    return (f'<div style="display:inline-flex;align-items:center;padding:{py} {px};border-radius:100px;'
            f'background:rgba(232,119,34,0.10);border:1px solid rgba(232,119,34,0.28);'
            f'font-size:{fs};font-weight:700;letter-spacing:2.5px;color:{ORANGE};">{tag}</div>')

def accent_bar(w=56):
    return f'<div style="width:{w}px;height:3px;border-radius:2px;background:{ORANGE};box-shadow:0 0 12px {ORANGE}88;"></div>'

def wrap(css_str, body_str, overlay=""):
    return f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{css_str}</style></head><body>{overlay}{body_str}</body></html>'

# ── COVER ──────────────────────────────────────────────────────────────────────
def slide_cover(s, i, tot, T, bg, ov):
    hook    = s.get("hook", s.get("title", ""))
    sub     = s.get("subtitle", "")
    tag     = s.get("tag", "")
    swipe   = s.get("cta_swipe", "Desliza para descubrirlo →")
    sub_h   = f'<p style="font-size:35px;font-weight:400;line-height:1.55;color:{T["text_dim"]};max-width:820px;">{sub}</p>' if sub else ""
    css = base_css(T, bg)
    body = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="display:flex;align-items:center;justify-content:space-between;">
    {dots(i,tot,T)}
    <img src="{LOGO_FULL}" style="height:50px;opacity:0.90;">
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:32px;padding:16px 0;">
    {badge(tag,T) if tag else ""}
    <h1 style="font-size:98px;font-weight:900;line-height:1.06;letter-spacing:-2px;color:{T["text"]};">{hook}</h1>
    {sub_h}
    <div style="display:flex;align-items:center;gap:16px;">
      {accent_bar(52)}
      <span style="font-size:25px;font-weight:600;color:{T["text_dim"]};">{swipe}</span>
    </div>
  </div>
  {footer(T, accent=True)}
</div>'''
    return wrap(css, body, ov)

# ── CONTENT ────────────────────────────────────────────────────────────────────
def slide_content(s, i, tot, T, bg, ov):
    num  = s.get("number", f"{i:02d}")
    h    = s.get("headline", "")
    body = s.get("body", "")
    tag  = s.get("tag", "")
    css  = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="margin-bottom:58px;">{dots(i,tot,T)}</div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
    {badge(tag,T)+"<div style='height:28px;'></div>" if tag else ""}
    <div style="display:flex;align-items:flex-start;gap:20px;margin-bottom:26px;">
      <div style="width:5px;height:82px;border-radius:3px;flex-shrink:0;margin-top:8px;
        background:linear-gradient(180deg,{ORANGE},{ORANGE}44);box-shadow:0 0 14px {ORANGE}55;"></div>
      <div style="font-size:118px;font-weight:900;line-height:1;color:{ORANGE};letter-spacing:-5px;
        text-shadow:0 0 40px {ORANGE}55;">{num}</div>
    </div>
    <h2 style="font-size:66px;font-weight:900;line-height:1.12;letter-spacing:-1px;color:{T["text"]};margin-bottom:30px;">{h}</h2>
    <p style="font-size:34px;font-weight:400;line-height:1.62;color:{T["text_dim"]};max-width:880px;">{body}</p>
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── STAT ───────────────────────────────────────────────────────────────────────
def slide_stat(s, i, tot, T, bg, ov):
    stat = s.get("stat", "")
    lbl  = s.get("label", "")
    ctx  = s.get("context", "")
    tag  = s.get("tag", "DATO REAL")
    ctx_h = f'<p style="font-size:30px;font-weight:400;line-height:1.55;color:{T["text_dim"]};max-width:760px;margin-top:4px;">{ctx}</p>' if ctx else ""
    css  = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  {dots(i,tot,T)}
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:26px;">
    {badge(tag,T)}
    <div style="font-size:200px;font-weight:900;line-height:0.88;letter-spacing:-8px;color:{ORANGE};
      text-shadow:0 0 60px {ORANGE}55,0 0 120px {ORANGE}28;">{stat}</div>
    <h2 style="font-size:42px;font-weight:800;line-height:1.3;color:{T["text"]};max-width:820px;">{lbl}</h2>
    {ctx_h}
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── TIP ────────────────────────────────────────────────────────────────────────
def slide_tip(s, i, tot, T, bg, ov):
    h    = s.get("headline", "")
    tips = s.get("tips", [])
    tag  = s.get("tag", "TIPS")
    rows = ""
    for t in tips:
        bad   = t.get("bad", False)
        c     = T["bad_color"] if bad else T["good_color"]
        tb    = T["bad_bg"] if bad else T["good_bg"]
        tbr   = T["bad_border"] if bad else T["good_border"]
        rows += (f'<div style="display:flex;align-items:center;gap:20px;padding:18px 24px;'
                 f'border-radius:14px;background:{T["card_bg"]};border:1px solid {T["card_border"]};">'
                 f'<div style="width:42px;height:42px;border-radius:50%;flex-shrink:0;background:{tb};'
                 f'border:1px solid {tbr};display:flex;align-items:center;justify-content:center;'
                 f'font-size:19px;font-weight:900;color:{c};">{t.get("icon","✓")}</div>'
                 f'<p style="font-size:29px;font-weight:500;line-height:1.4;color:{T["text"]};">{t.get("text","")}</p>'
                 f'</div>')
    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="margin-bottom:50px;">{dots(i,tot,T)}</div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="margin-bottom:26px;">{badge(tag,T)}</div>
    <h2 style="font-size:58px;font-weight:900;line-height:1.15;color:{T["text"]};margin-bottom:34px;">{h}</h2>
    <div style="display:flex;flex-direction:column;gap:13px;">{rows}</div>
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── QUOTE ──────────────────────────────────────────────────────────────────────
def slide_quote(s, i, tot, T, bg, ov):
    q    = s.get("quote", "")
    auth = s.get("author", "")
    role = s.get("author_role", "")
    tag  = s.get("tag", "")
    auth_h = ""
    if auth:
        role_h = f'<span style="font-size:23px;font-weight:500;color:{T["text_dim"]};display:block;margin-top:3px;">{role}</span>' if role else ""
        auth_h = (f'<div style="display:flex;align-items:center;gap:18px;margin-top:18px;">'
                  f'<div style="width:44px;height:2px;background:{ORANGE};box-shadow:0 0 10px {ORANGE}88;"></div>'
                  f'<div><span style="font-size:27px;font-weight:700;color:{T["text"]};">{auth}</span>{role_h}</div></div>')
    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  {dots(i,tot,T)}
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:0;">
    {badge(tag,T)+"<div style='height:32px;'></div>" if tag else ""}
    <div style="font-size:170px;font-weight:900;line-height:0.55;color:{ORANGE};opacity:0.45;
      font-family:Georgia,serif;margin-bottom:12px;">"</div>
    <blockquote style="font-size:56px;font-weight:700;line-height:1.24;color:{T["text"]};
      letter-spacing:-0.3px;border:none;margin:0;font-style:italic;">{q}</blockquote>
    {auth_h}
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── TIMELINE ───────────────────────────────────────────────────────────────────
def slide_timeline(s, i, tot, T, bg, ov):
    h      = s.get("headline", "")
    tag    = s.get("tag", "TIMELINE")
    events = s.get("events", [])
    rows   = ""
    for j, ev in enumerate(events):
        hl   = ev.get("highlight", False)
        dc   = ORANGE if hl else T["prog_off"]
        glow = f"box-shadow:0 0 14px {ORANGE}AA;" if hl else ""
        lc   = ORANGE if hl else T["text_dim"]
        conn = (f'<div style="width:2px;height:28px;background:{T["divider"]};margin-left:11px;"></div>'
                if j < len(events)-1 else "")
        rows += (f'<div style="display:flex;align-items:flex-start;gap:22px;">'
                 f'<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">'
                 f'<div style="width:24px;height:24px;border-radius:50%;background:{dc};{glow}"></div>{conn}</div>'
                 f'<div style="padding-bottom:22px;">'
                 f'<div style="font-size:21px;font-weight:800;letter-spacing:2px;color:{lc};margin-bottom:5px;">{ev.get("label","")}</div>'
                 f'<div style="font-size:29px;font-weight:500;line-height:1.45;color:{T["text"]};">{ev.get("text","")}</div>'
                 f'</div></div>')
    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="margin-bottom:48px;">{dots(i,tot,T)}</div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="margin-bottom:24px;">{badge(tag,T)}</div>
    <h2 style="font-size:56px;font-weight:900;line-height:1.15;color:{T["text"]};margin-bottom:40px;">{h}</h2>
    <div style="display:flex;flex-direction:column;">{rows}</div>
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── PROCESS ────────────────────────────────────────────────────────────────────
def slide_process(s, i, tot, T, bg, ov):
    h     = s.get("headline", "")
    tag   = s.get("tag", "PROCESO")
    steps = s.get("steps", [])
    rows  = ""
    for j, st in enumerate(steps):
        conn = (f'<div style="width:2px;height:22px;background:linear-gradient({ORANGE},{ORANGE}22);margin-top:3px;"></div>'
                if j < len(steps)-1 else "")
        rows += (f'<div style="display:flex;align-items:flex-start;gap:18px;">'
                 f'<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">'
                 f'<div style="width:44px;height:44px;border-radius:50%;background:{ORANGE};'
                 f'display:flex;align-items:center;justify-content:center;'
                 f'font-size:19px;font-weight:900;color:#FFF;box-shadow:0 0 14px {ORANGE}66;">{j+1:02d}</div>{conn}</div>'
                 f'<div style="padding-bottom:{0 if j==len(steps)-1 else 16}px;padding-top:6px;">'
                 f'<div style="font-size:27px;font-weight:800;color:{T["text"]};margin-bottom:3px;">{st.get("title","")}</div>'
                 f'<div style="font-size:26px;font-weight:400;line-height:1.45;color:{T["text_dim"]};">{st.get("text","")}</div>'
                 f'</div></div>')
    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="margin-bottom:46px;">{dots(i,tot,T)}</div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="margin-bottom:22px;">{badge(tag,T)}</div>
    <h2 style="font-size:54px;font-weight:900;line-height:1.15;color:{T["text"]};margin-bottom:36px;">{h}</h2>
    <div style="display:flex;flex-direction:column;">{rows}</div>
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── BEFORE / AFTER ─────────────────────────────────────────────────────────────
def slide_before_after(s, i, tot, T, bg, ov):
    h      = s.get("headline", "")
    tag    = s.get("tag", "COMPARACIÓN")
    before = s.get("before", [])
    after  = s.get("after", [])

    def col(title, items, good):
        c   = ORANGE if good else T["bad_color"]
        hb  = "rgba(232,119,34,0.07)" if good else "rgba(255,75,75,0.07)"
        hbr = "rgba(232,119,34,0.20)" if good else "rgba(255,75,75,0.20)"
        ic  = "✓" if good else "✗"
        rows = "".join(
            f'<div style="display:flex;align-items:flex-start;gap:11px;padding:12px 0;'
            f'border-bottom:1px solid {T["card_border"]};">'
            f'<span style="color:{c};font-size:17px;font-weight:900;flex-shrink:0;margin-top:2px;">{ic}</span>'
            f'<span style="font-size:24px;font-weight:500;line-height:1.38;color:{T["text"]};">{it}</span>'
            f'</div>' for it in items
        )
        return (f'<div style="flex:1;border-radius:18px;overflow:hidden;border:1px solid {hbr};">'
                f'<div style="background:{hb};padding:16px 20px;text-align:center;border-bottom:1px solid {hbr};">'
                f'<span style="font-size:19px;font-weight:800;letter-spacing:2px;color:{c};">{title}</span></div>'
                f'<div style="padding:6px 18px;">{rows}</div></div>')

    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="margin-bottom:46px;">{dots(i,tot,T)}</div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="margin-bottom:20px;">{badge(tag,T)}</div>
    <h2 style="font-size:54px;font-weight:900;line-height:1.15;color:{T["text"]};margin-bottom:32px;">{h}</h2>
    <div style="display:flex;gap:14px;flex:1;">{col("ANTES", before, False)}{col("DESPUÉS", after, True)}</div>
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── NEWS ───────────────────────────────────────────────────────────────────────
def slide_news(s, i, tot, T, bg, ov):
    h    = s.get("headline", "")
    body = s.get("body", "")
    q    = s.get("quote", "")
    src  = s.get("source", "")
    date = s.get("date", "")
    tag  = s.get("tag", "ACTUALIDAD IA")
    q_h  = (f'<div style="border-left:3px solid {ORANGE};padding-left:22px;margin:12px 0;">'
            f'<p style="font-size:29px;font-weight:600;line-height:1.45;color:{T["text"]};font-style:italic;">{q}</p></div>') if q else ""
    src_h = (f'<div style="display:flex;align-items:center;gap:11px;margin-top:8px;">'
             f'<div style="width:4px;height:4px;border-radius:50%;background:{ORANGE};"></div>'
             f'<span style="font-size:21px;font-weight:600;color:{T["text_dim"]};letter-spacing:1px;">{src}</span></div>') if src else ""
    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="margin-bottom:42px;">{dots(i,tot,T)}</div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;">
      {badge(tag,T,sm=True)}
      {"<span style='font-size:20px;font-weight:600;color:"+T["text_faint"]+";letter-spacing:1px;'>"+date+"</span>" if date else ""}
    </div>
    <div style="border-left:5px solid {ORANGE};padding-left:26px;margin-bottom:30px;box-shadow:-2px 0 0 0 {ORANGE}44;">
      <h2 style="font-size:56px;font-weight:900;line-height:1.14;color:{T["text"]};">{h}</h2>
    </div>
    <p style="font-size:32px;font-weight:400;line-height:1.58;color:{T["text_dim"]};margin-bottom:22px;">{body}</p>
    {q_h}{src_h}
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── EDUCATIONAL ────────────────────────────────────────────────────────────────
def slide_educational(s, i, tot, T, bg, ov):
    h    = s.get("headline", "")
    defn = s.get("definition", "")
    tag  = s.get("tag", "APRENDE")
    pts  = s.get("points", [])
    def_h = ""
    if defn:
        def_h = (f'<div style="padding:22px 26px;border-radius:14px;background:{T["card_bg"]};'
                 f'border:1px solid {T["card_border"]};border-left:4px solid {ORANGE};margin-bottom:26px;">'
                 f'<div style="font-size:16px;font-weight:700;letter-spacing:2px;color:{ORANGE};margin-bottom:8px;">DEFINICIÓN</div>'
                 f'<p style="font-size:29px;font-weight:500;line-height:1.50;color:{T["text"]};">{defn}</p></div>')
    pts_h = ""
    for pt in pts:
        if isinstance(pt, dict):
            pts_h += (f'<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">'
                      f'<div style="width:8px;height:8px;border-radius:50%;background:{ORANGE};flex-shrink:0;margin-top:10px;'
                      f'box-shadow:0 0 8px {ORANGE}88;"></div><div>'
                      f'<span style="font-size:27px;font-weight:700;color:{T["text"]};">{pt.get("title","")}: </span>'
                      f'<span style="font-size:27px;font-weight:400;color:{T["text_dim"]};">{pt.get("text","")}</span>'
                      f'</div></div>')
        else:
            pts_h += (f'<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">'
                      f'<div style="width:8px;height:8px;border-radius:50%;background:{ORANGE};flex-shrink:0;margin-top:10px;'
                      f'box-shadow:0 0 8px {ORANGE}88;"></div>'
                      f'<p style="font-size:27px;font-weight:400;line-height:1.45;color:{T["text"]};margin:0;">{pt}</p></div>')
    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  <div style="margin-bottom:46px;">{dots(i,tot,T)}</div>
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="margin-bottom:22px;">{badge(tag,T)}</div>
    <h2 style="font-size:56px;font-weight:900;line-height:1.15;color:{T["text"]};margin-bottom:30px;">{h}</h2>
    {def_h}{pts_h}
  </div>
  {footer(T)}
</div>'''
    return wrap(css, html, ov)

# ── CTA ────────────────────────────────────────────────────────────────────────
def slide_cta(s, i, tot, T, bg, ov):
    h   = s.get("headline", "")
    sub = s.get("subtext", "")
    cta = s.get("cta", "Escríbenos ahora")
    tag = s.get("tag", "¿Y TÚ?")
    sub_h = f'<p style="font-size:31px;font-weight:400;line-height:1.55;color:{T["text_dim"]};max-width:720px;">{sub}</p>' if sub else ""
    css = base_css(T, bg)
    html = f'''
<div style="position:relative;z-index:2;display:flex;flex-direction:column;height:{H}px;padding:68px 84px 0;">
  {dots(i,tot,T)}
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:32px;">
    <img src="{LOGO_FULL}" style="height:84px;object-fit:contain;">
    {accent_bar(56)}
    {badge(tag,T)}
    <h2 style="font-size:70px;font-weight:900;line-height:1.12;letter-spacing:-1px;color:{T["text"]};max-width:860px;">{h}</h2>
    {sub_h}
    <div style="padding:22px 54px;border-radius:100px;font-size:29px;font-weight:800;color:#FFF;letter-spacing:0.5px;
      background:linear-gradient(135deg,{ORANGE},{ORANGE}CC);
      box-shadow:0 0 40px {ORANGE}55,0 0 80px {ORANGE}22;">{cta}</div>
  </div>
  <div style="display:flex;align-items:center;justify-content:center;padding:26px;
    border-top:1px solid rgba(232,119,34,0.22);background:rgba(232,119,34,0.05);">
    <span style="font-size:25px;font-weight:800;letter-spacing:3px;color:{ORANGE};">{HANDLE}</span>
  </div>
</div>'''
    return wrap(css, html, ov)

# ── Dispatcher ─────────────────────────────────────────────────────────────────
RENDERERS = {
    "cover"        : slide_cover,
    "content"      : slide_content,
    "stat"         : slide_stat,
    "tip"          : slide_tip,
    "quote"        : slide_quote,
    "timeline"     : slide_timeline,
    "process"      : slide_process,
    "before_after" : slide_before_after,
    "news"         : slide_news,
    "educational"  : slide_educational,
    "cta"          : slide_cta,
}

def render(slide, idx, total, config):
    stype = slide.get("type", "content")
    if stype not in RENDERERS:
        raise ValueError(f"Tipo desconocido: '{stype}'. Opciones: {list(RENDERERS)}")
    T_name    = slide.get("theme",     config.get("theme",     "dark"))
    bg_style  = slide.get("bg_style",  config.get("bg_style",  "solid"))
    photo_url = slide.get("photo_url", config.get("photo_url", ""))
    T         = THEMES.get(T_name, THEMES["dark"])

    # Auto-foto desde Unsplash si bg_style=photo y no hay photo_url
    if bg_style == "photo" and not photo_url:
        key = config.get("unsplash_key", UNSPLASH_KEY)
        # query: campo photo_query del slide > del config > tag del slide > headline del slide
        query = (slide.get("photo_query")
                 or config.get("photo_query")
                 or slide.get("tag", "")
                 or slide.get("headline", "")
                 or slide.get("hook", "negocios tecnologia"))
        photo_url = _search_unsplash(query, key)
        if not photo_url:
            # Sin clave o sin resultado → fallback a mesh
            print(f"  ↩️  Fallback a fondo mesh (sin foto disponible)")
            bg_style = "mesh"

    bg_css, overlay = get_bg(bg_style, T, photo_url)
    return RENDERERS[stype](slide, idx, total, T, bg_css, overlay)

# ── Screenshot runner ──────────────────────────────────────────────────────────
def run(config, output_dir: Path):
    slides = config.get("slides", [])
    if not slides:
        print("❌ No hay slides."); return
    output_dir.mkdir(parents=True, exist_ok=True)
    name  = config.get("name", "carousel").replace(" ", "-").lower()
    total = len(slides)
    print(f"\n🎨  {total} slides — '{config.get('name','carousel')}'\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page    = browser.new_context(viewport={"width": W, "height": H}).new_page()
        for i, slide in enumerate(slides):
            html = render(slide, i, total, config)
            page.set_content(html, wait_until="domcontentloaded")
            page.wait_for_load_state("networkidle")
            time.sleep(0.25)
            stype = slide.get("type", "slide")
            out   = output_dir / f"{name}_{i+1:02d}_{stype}.png"
            page.screenshot(path=str(out))
            print(f"  ✅ {i+1:02d}/{total}  [{stype:<14}]  {out.name}")
        browser.close()
    print(f"\n📁 {output_dir.resolve()}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    cfg_path = Path(sys.argv[1])
    if not cfg_path.exists():
        print(f"❌ No se encontró: {cfg_path}"); sys.exit(1)
    with open(cfg_path, "r", encoding="utf-8") as f:
        config = json.load(f)
    out_dir = Path("output") / config.get("name","carousel").replace(" ","-").lower()
    if "--output" in sys.argv:
        out_dir = Path(sys.argv[sys.argv.index("--output")+1])
    run(config, out_dir)
