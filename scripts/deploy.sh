#!/bin/bash

# Deployment script
echo "Starting deployment of Yet Another Anonymous GitHub..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler CLI not found"
    echo "Please install first: npm install -g wrangler"
    exit 1
fi

# Build project
echo "Building project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed, please check error messages"
    exit 1
fi

# Deploy to Cloudflare Workers
echo "Deploying to Cloudflare Workers..."
wrangler deploy

echo "Deployment completed!" 