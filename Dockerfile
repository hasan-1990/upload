FROM python:3.12-slim

RUN useradd --create-home --uid 10001 appuser
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && mkdir -p /app/uploads /app/data \
    && chown -R appuser:appuser /app

COPY app.py .
COPY templates ./templates
COPY static ./static

USER appuser
EXPOSE 5001
CMD ["gunicorn", "-b", "0.0.0.0:5001", "-w", "2", "--timeout", "3600", "--graceful-timeout", "30", "app:app"]
