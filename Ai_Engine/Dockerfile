FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Package lives under Ai_Engine/ so local monorepo imports keep working.
COPY . /app/Ai_Engine/

WORKDIR /app

# CPU-only PyTorch keeps the image smaller for Hugging Face free tier.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r Ai_Engine/requirements-docker.txt

ENV PYTHONPATH=/app
ENV AI_ENGINE_HOST=0.0.0.0
ENV AI_ENGINE_PORT=7860

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7860/health')" || exit 1

CMD ["uvicorn", "Ai_Engine.server:app", "--host", "0.0.0.0", "--port", "7860"]
