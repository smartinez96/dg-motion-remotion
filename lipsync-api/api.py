import os, uuid, json, glob, threading, subprocess, requests
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)
jobs = {}

def get_audio_duration(wav_path):
    result = subprocess.run(
        ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', wav_path],
        capture_output=True, text=True
    )
    return float(json.loads(result.stdout)['format']['duration'])

def run_inference(job_id, image_url, audio_url):
    jobs[job_id] = {"status": "processing"}
    d = f"/app/results/{job_id}"
    os.makedirs(d, exist_ok=True)

    img = f"{d}/avatar.jpg"
    mp3 = f"{d}/audio.mp3"
    wav = f"{d}/audio.wav"
    loop = f"{d}/loop.mp4"
    out = f"{d}/output.mp4"

    try:
        r = requests.get(image_url, timeout=30)
        with open(img, 'wb') as f: f.write(r.content)

        r = requests.get(audio_url, timeout=30)
        with open(mp3, 'wb') as f: f.write(r.content)

        # MP3 → WAV (Wav2Lip needs WAV)
        subprocess.run(
            ['ffmpeg', '-y', '-i', mp3, '-ar', '16000', '-ac', '1', wav],
            check=True, capture_output=True
        )

        # Static image → looping video
        duration = min(get_audio_duration(wav) + 0.5, 120)
        subprocess.run([
            'ffmpeg', '-y', '-loop', '1', '-i', img,
            '-t', str(duration), '-r', '25',
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', loop
        ], check=True, capture_output=True)

        # Wav2Lip inference — small batches to avoid OOM on CPU
        result = subprocess.run([
            'python', '/app/inference.py',
            '--checkpoint_path', '/app/checkpoints/wav2lip_gan.pth',
            '--face', loop,
            '--audio', wav,
            '--outfile', out,
            '--resize_factor', '2',
            '--nosmooth',
            '--face_det_batch_size', '4',
            '--wav2lip_batch_size', '32',
        ], capture_output=True, text=True, timeout=1800, cwd='/app')

        if result.returncode == 0 and os.path.exists(out):
            jobs[job_id] = {"status": "succeeded", "video_path": out}
        else:
            jobs[job_id] = {"status": "failed", "error": result.stderr[-2000:] + result.stdout[-500:]}
    except Exception as e:
        jobs[job_id] = {"status": "failed", "error": str(e)}


@app.route('/generate', methods=['POST'])
def generate():
    data = request.json or {}
    image_url = data.get('image_url')
    audio_url = data.get('audio_url')
    if not image_url or not audio_url:
        return jsonify({"error": "image_url and audio_url required"}), 400
    job_id = uuid.uuid4().hex[:12]
    threading.Thread(target=run_inference, args=(job_id, image_url, audio_url), daemon=True).start()
    return jsonify({"id": job_id, "status": "processing"})


@app.route('/status/<job_id>', methods=['GET'])
def get_status(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"status": "not_found"}), 404
    if job["status"] == "succeeded":
        host = request.host
        return jsonify({"status": "succeeded", "output": f"https://{host}/video/{job_id}"})
    return jsonify({k: v for k, v in job.items() if k != "video_path"})


@app.route('/video/<job_id>', methods=['GET'])
def serve_video(job_id):
    job = jobs.get(job_id)
    if not job or job.get("status") != "succeeded":
        return "Not found", 404
    return send_file(job["video_path"], mimetype='video/mp4')


@app.route('/health')
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860, threaded=True)
