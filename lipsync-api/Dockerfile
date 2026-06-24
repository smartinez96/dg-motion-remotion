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

# Install dependencies (pin librosa to 0.9.x — 0.10+ broke positional args in filters.mel)
RUN sed -i '/opencv-python/d' requirements.txt && \
    sed -i 's/librosa.*/librosa==0.9.2/' requirements.txt && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir opencv-python-headless flask requests "librosa==0.9.2"

# Download Wav2Lip GAN model
RUN mkdir -p checkpoints && \
    wget -q -O checkpoints/wav2lip_gan.pth \
    "https://huggingface.co/numz/wav2lip_studio/resolve/main/Wav2lip/wav2lip_gan.pth"

# Download face detection model (s3fd)
RUN mkdir -p face_detection/detection/sfd && \
    wget -q -O face_detection/detection/sfd/s3fd-619a316812.pth \
    "https://huggingface.co/numz/wav2lip_studio/resolve/main/face_detection/s3fd-619a316812.pth"

RUN mkdir -p /app/results && \
    wget -q -O /app/api.py \
    "https://raw.githubusercontent.com/smartinez96/dg-motion-remotion/main/lipsync-api/api.py"

EXPOSE 7860

CMD ["python", "api.py"]
