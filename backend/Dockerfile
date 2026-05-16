# Use Python 3.11 for stability with ML libraries
FROM python:3.11-slim

# Install system dependencies required by OpenCV and MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libusb-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face requires a non-root user
RUN useradd -m -u 1000 user
USER user

# Set environment variables for the user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory
WORKDIR $HOME/app

# Copy your files into the container and set ownership
COPY --chown=user . $HOME/app

# Install Python requirements
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Face Spaces expose port 7860
EXPOSE 7860

# Launch the FastAPI server on the correct port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]