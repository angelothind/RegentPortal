#!/usr/bin/env bash
# Render build script for Regent Portal

echo "🚀 Starting Render build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build the client
echo "🔨 Building client application..."
cd client
npm install
npm run build
echo "✅ Client build complete"

# Go back to root and install server dependencies
echo "📦 Installing server dependencies..."
cd ../server
npm install
echo "✅ Server dependencies installed"

# Create a .env file for production if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating production .env file..."
    echo "MONGO_URI=$MONGO_URI" > .env
    echo "PORT=$PORT" >> .env
    echo "NODE_ENV=production" >> .env
fi

echo "🎉 Build process complete!"
echo "📁 Client built in: client/dist"
echo "📁 Server ready in: server/" 