FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    git ffmpeg wget curl \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# CPU-only PyTorch
RUN pip install --no-cache-dir \
    torch==2.0.1 torchvision==0.15.2 torchaudio==2.0.2 \
    --index-url https://download.pytorch.org/whl/cpu

# Clone Wav2Lip
RUN git clone https://github.com/Rudrabha/Wav2Lip.git .

# Install dependencies — force numpy<2 at end (PyTorch 2.0.1 incompatible with numpy 2.x)
RUN pip install --no-cache-dir \
    scipy \
    tqdm \
    Pillow \
    opencv-python-headless \
    flask \
    requests \
    "librosa==0.9.2" && \
    pip install --no-cache-dir "numpy<2" --force-reinstall

# Download Wav2Lip GAN model
RUN mkdir -p checkpoints && \
    wget -q -O checkpoints/wav2lip_gan.pth \
    "https://huggingface.co/numz/wav2lip_studio/resolve/main/Wav2lip/wav2lip_gan.pth"

# Download face detection model (s3fd) — from original source
RUN mkdir -p face_detection/detection/sfd && \
    wget -q --no-check-certificate -O face_detection/detection/sfd/s3fd-619a316812.pth \
    "https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth"

RUN mkdir -p /app/results && \
    wget -q -O /app/api.py \
    "https://raw.githubusercontent.com/smartinez96/dg-motion-remotion/main/lipsync-api/api.py?v4" && \
    sed -i "s/resize_factor', '1'/resize_factor', '2'/" /app/api.py

EXPOSE 7860

CMD ["python", "api.py"]
