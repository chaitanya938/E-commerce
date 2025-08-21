#!/bin/bash

# Build script for Render deployment
echo "Starting frontend build process..."

# Change to frontend directory
cd frontend
echo "Changed to frontend directory: $(pwd)"

# List contents to debug
echo "Contents of current directory:"
ls -la

# Check if public folder exists
if [ -d "public" ]; then
    echo "Public folder found:"
    ls -la public/
    
    # Check if index.html exists
    if [ -f "public/index.html" ]; then
        echo "index.html found in public folder"
    else
        echo "ERROR: index.html not found in public folder"
        exit 1
    fi
else
    echo "ERROR: Public folder not found"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run build
echo "Running build command..."
npm run build

# Check if build succeeded
if [ -d "build" ]; then
    echo "Build successful! Build folder contents:"
    ls -la build/
else
    echo "ERROR: Build failed - build folder not created"
    exit 1
fi

echo "Frontend build completed successfully!"
