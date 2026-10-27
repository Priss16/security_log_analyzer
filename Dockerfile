FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY rules/ ./rules/
COPY config/ ./config/

EXPOSE 8000

CMD ["python", "src/cli.py", "server", "--host", "0.0.0.0", "--port", "8000"]
