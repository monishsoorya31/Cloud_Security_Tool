FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if required (e.g., for building some C extensions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

# Expose Django port
EXPOSE 8000

# Run migration and then start the Django server
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"]
