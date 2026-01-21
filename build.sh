#!/bin/bash

# Production Build Script for Render Deployment
echo "🚀 Starting production build for School Report SaaS Frontend..."

# Set production environment
export NODE_ENV=production
export VITE_APP_ENV=production
export VITE_BUILD_SOURCEMAP=false
export VITE_BUILD_MINIFY=true

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf node_modules/.cache/

# Install dependencies with production optimizations
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit --no-fund --silent

# Build the application with optimizations
echo "🔨 Building application..."
npm run build

# Verify build
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build size:"
    du -sh dist/
    echo "📁 Build contents:"
    ls -la dist/
    
    # Check for critical files
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html found"
    else
        echo "❌ index.html missing!"
        exit 1
    fi
    
    if [ -d "dist/assets" ]; then
        echo "✅ Assets directory found"
        echo "📄 Asset files:"
        find dist/assets -type f | head -10
    else
        echo "⚠️  No assets directory found"
    fi
    
    # Optimize for static hosting
    echo "🔧 Optimizing for static hosting..."
    
    # Ensure _redirects file exists for SPA routing
    if [ ! -f "dist/_redirects" ]; then
        echo "Creating _redirects file..."
        cp public/_redirects dist/_redirects 2>/dev/null || echo "/* /index.html 200" > dist/_redirects
    fi
    
    # Copy PWA files
    if [ -f "public/manifest.webmanifest" ]; then
        cp public/manifest.webmanifest dist/
        echo "✅ PWA manifest copied"
    fi
    
    if [ -f "public/sw.js" ]; then
        cp public/sw.js dist/
        echo "✅ Service worker copied"
    fi
    
    # Copy icons
    if [ -d "public/icons" ]; then
        cp -r public/icons dist/
        echo "✅ Icons copied"
    fi
    
    # Copy favicon files
    for favicon in favicon.ico favicon.svg favicon.txt; do
        if [ -f "public/$favicon" ]; then
            cp "public/$favicon" "dist/$favicon"
            echo "✅ $favicon copied"
        fi
    done
    
    # Optimize HTML for production
    if [ -f "dist/index.html" ]; then
        # Add preconnect for API domain
        sed -i 's|</head>|  <link rel="preconnect" href="https://school-report-saas.onrender.com">\n  <link rel="dns-prefetch" href="https://school-report-saas.onrender.com">\n</head>|' dist/index.html
        echo "✅ HTML optimized with preconnect"
    fi
    
    echo "📈 Final build statistics:"
    echo "Total files: $(find dist -type f | wc -l)"
    echo "Total size: $(du -sh dist | cut -f1)"
    echo "Largest files:"
    find dist -type f -exec ls -lh {} + | sort -k5 -hr | head -5
    
    # Verify critical files
    echo "🔍 Verifying critical files:"
    [ -f "dist/index.html" ] && echo "✅ index.html" || echo "❌ index.html missing"
    [ -f "dist/_redirects" ] && echo "✅ _redirects" || echo "❌ _redirects missing"
    [ -f "dist/manifest.webmanifest" ] && echo "✅ manifest.webmanifest" || echo "⚠️ manifest.webmanifest missing"
    [ -d "dist/assets" ] && echo "✅ assets directory" || echo "❌ assets directory missing"
    
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Frontend ready for deployment!"
echo "🌐 Deploy this 'dist' folder to Render Static Site"