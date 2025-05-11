#!/bin/bash

# Check if input directory is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <input-recipes-directory> [registry-url]"
    exit 1
fi

# Set registry URL (default to Docker Hub)
REGISTRY=${2:-""}
IMAGE_NAME="slowback1/recipe-ssg"
TAG=latest

# Clean up any existing recipes directory
if [ -d "./recipes" ]; then
    rm -rf ./recipes
fi

# Create recipes directory and copy input files
echo "Copying recipes from $1 to ./recipes..."
mkdir -p ./recipes
cp -r "$1"/* ./recipes/

# Build the Docker image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} --push .

# Clean up
echo "Cleaning up..."
rm -rf ./recipes

echo "Build complete!"
echo "Latest: ${REGISTRY}/${IMAGE_NAME}:latest" 