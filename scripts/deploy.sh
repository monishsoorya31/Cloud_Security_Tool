#!/bin/bash
# scripts/deploy.sh
# This script is executed on the GCP VM by Jenkins via SSH.

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting Deployment..."

# 1. Update the code from GitHub
# Ensure you are on the correct branch (e.g., main)
echo "Pulling latest code from GitHub..."
git pull origin main

# 2. Rebuild and restart services using Docker Compose
# If your docker-compose.yml is in a specific directory (like backend/), navigate there first.
# cd backend/ 

echo "Rebuilding and starting Docker containers..."
# Use docker-compose or docker compose depending on your installation
docker compose up -d --build

# Optional: Clean up unused Docker images to save space on the VM
echo "Cleaning up dangling images..."
docker image prune -f

echo "Deployment Successful!"
