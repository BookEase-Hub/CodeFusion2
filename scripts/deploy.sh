#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building the application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

# Deploy Supabase migrations
echo "🔄 Running Supabase migrations..."
supabase db push

# Deploy Cloudflare Workers
echo "☁️ Deploying Cloudflare Workers..."
wrangler publish

echo "✅ Deployment completed successfully!" 