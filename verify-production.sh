#!/bin/bash

# 🔍 Production Build Verification Script
# Run this script to verify your build is production-ready

echo "🔍 Elite Tech Frontend - Production Verification"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Node.js version
echo ""
echo "📋 Environment Check"
echo "-------------------"
node_version=$(node --version)
npm_version=$(npm --version)
echo "Node.js: $node_version"
echo "npm: $npm_version"

# Check if package.json exists
if [ -f "package.json" ]; then
    print_status 0 "package.json found"
else
    print_status 1 "package.json not found"
    exit 1
fi

# Check environment files
echo ""
echo "🔧 Configuration Check"
echo "---------------------"
[ -f ".env.production" ] && print_status 0 ".env.production exists" || print_status 1 ".env.production missing"
[ -f "vite.config.js" ] && print_status 0 "vite.config.js exists" || print_status 1 "vite.config.js missing"
[ -f "render.yaml" ] && print_status 0 "render.yaml exists" || print_status 1 "render.yaml missing"
[ -f "build.sh" ] && print_status 0 "build.sh exists" || print_status 1 "build.sh missing"

# Check public folder files
echo ""
echo "📁 Public Assets Check"
echo "---------------------"
[ -f "public/_redirects" ] && print_status 0 "_redirects file exists" || print_status 1 "_redirects file missing"
[ -f "public/manifest.webmanifest" ] && print_status 0 "PWA manifest exists" || print_status 1 "PWA manifest missing"
[ -f "public/sw.js" ] && print_status 0 "Service worker exists" || print_status 1 "Service worker missing"
[ -f "public/favicon.ico" ] && print_status 0 "Favicon exists" || print_status 1 "Favicon missing"
[ -d "public/icons" ] && print_status 0 "Icons directory exists" || print_status 1 "Icons directory missing"

# Install dependencies
echo ""
echo "📦 Installing Dependencies"
echo "------------------------"
npm ci --silent
if [ $? -eq 0 ]; then
    print_status 0 "Dependencies installed successfully"
else
    print_status 1 "Failed to install dependencies"
    exit 1
fi

# Run production build
echo ""
echo "🔨 Running Production Build"
echo "--------------------------"
NODE_ENV=production VITE_APP_ENV=production npm run build
if [ $? -eq 0 ]; then
    print_status 0 "Production build completed"
else
    print_status 1 "Production build failed"
    exit 1
fi

# Verify build output
echo ""
echo "📊 Build Output Verification"
echo "---------------------------"
if [ -d "dist" ]; then
    print_status 0 "dist directory created"
    
    # Check critical files
    [ -f "dist/index.html" ] && print_status 0 "index.html generated" || print_status 1 "index.html missing"
    [ -f "dist/_redirects" ] && print_status 0 "_redirects copied" || print_status 1 "_redirects missing"
    [ -f "dist/manifest.webmanifest" ] && print_status 0 "PWA manifest copied" || print_status 1 "PWA manifest missing"
    [ -f "dist/sw.js" ] && print_status 0 "Service worker copied" || print_status 1 "Service worker missing"
    [ -d "dist/assets" ] && print_status 0 "Assets directory created" || print_status 1 "Assets directory missing"
    
    # Check build size
    build_size=$(du -sh dist | cut -f1)
    print_info "Total build size: $build_size"
    
    # Count files
    file_count=$(find dist -type f | wc -l)
    print_info "Total files: $file_count"
    
    # Check for large files
    echo ""
    echo "📈 Largest Files:"
    find dist -type f -exec ls -lh {} + | sort -k5 -hr | head -5 | while read line; do
        echo "   $line"
    done
    
else
    print_status 1 "dist directory not created"
    exit 1
fi

# Test local preview
echo ""
echo "🌐 Testing Local Preview"
echo "----------------------"
print_info "Starting local preview server..."
print_info "You can test the build at: http://localhost:3001"
print_warning "Press Ctrl+C to stop the preview server"

# Start preview server in background and get its PID
npm run preview &
PREVIEW_PID=$!

# Wait a moment for server to start
sleep 3

# Test if server is running
if curl -s http://localhost:3001 > /dev/null; then
    print_status 0 "Preview server started successfully"
    print_info "Test the following URLs:"
    echo "   • http://localhost:3001/ (Landing page)"
    echo "   • http://localhost:3001/login (Staff login)"
    echo "   • http://localhost:3001/student-portal (Student portal)"
    echo "   • http://localhost:3001/dashboard (Dashboard - requires login)"
else
    print_status 1 "Preview server failed to start"
fi

# API Configuration Check
echo ""
echo "🔗 API Configuration Check"
echo "-------------------------"
if grep -q "https://school-report-saas.onrender.com/api" .env.production; then
    print_status 0 "Production API URL configured"
else
    print_status 1 "Production API URL not configured"
fi

# Security Headers Check
echo ""
echo "🔒 Security Configuration Check"
echo "------------------------------"
if grep -q "X-Frame-Options" public/_redirects; then
    print_status 0 "Security headers configured"
else
    print_status 1 "Security headers missing"
fi

# PWA Check
echo ""
echo "📱 PWA Configuration Check"
echo "-------------------------"
if grep -q "Elite Tech" public/manifest.webmanifest; then
    print_status 0 "PWA manifest configured"
else
    print_status 1 "PWA manifest not properly configured"
fi

# Final Summary
echo ""
echo "🎉 Verification Complete!"
echo "========================"
print_info "Your frontend is ready for production deployment on Render!"
print_info "Next steps:"
echo "   1. Push your code to GitHub"
echo "   2. Create a new Static Site on Render"
echo "   3. Connect your repository"
echo "   4. Use the build command: chmod +x build.sh && ./build.sh"
echo "   5. Set publish directory to: dist"
echo ""
print_warning "Don't forget to stop the preview server (Ctrl+C) when done testing!"

# Keep the preview server running until user stops it
wait $PREVIEW_PID