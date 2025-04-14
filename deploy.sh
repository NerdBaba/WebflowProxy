#!/bin/bash

# Deploy the Webflow Proxy to Cloudflare Pages

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare if needed
echo "Checking Cloudflare login..."
wrangler whoami || wrangler login

# Deploy to Cloudflare Pages
echo "Deploying to Cloudflare Pages..."
wrangler pages deploy --project-name=webflow-proxy .

echo "Done!" 