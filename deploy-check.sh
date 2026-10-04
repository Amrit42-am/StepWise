#!/bin/bash

# StepWise DSA - Deployment Checklist
# Use this script to verify everything is ready before deploying

echo "🚀 StepWise DSA - Pre-Deployment Checklist"
echo "=========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  Node.js: $NODE_VERSION"
else
    echo "  ✗ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

# Check Git
echo "✓ Checking Git..."
if command -v git &> /dev/null; then
    echo "  Git: $(git --version)"
else
    echo "  ✗ Git not found. Install from https://git-scm.com"
    exit 1
fi

# Check required files
echo ""
echo "✓ Checking required files..."
FILES=("package.json" "server.js" ".env.example" "README.md" "client/public/index.html" "render.yaml")
MISSING=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ Missing: $file"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    echo ""
    echo "❌ Missing $MISSING files. Cannot deploy."
    exit 1
fi

# Check .env
echo ""
echo "✓ Checking environment setup..."
if [ -f ".env" ]; then
    echo "  ✓ .env file exists"
    if grep -q "MONGODB_URI" .env && grep -q "GOOGLE_API_KEY" .env; then
        echo "  ✓ Required env variables configured"
    else
        echo "  ⚠ Warning: Some env variables may be missing"
    fi
else
    echo "  ⚠ No .env file found (required for local testing)"
    echo "    Copy from .env.example: cp .env.example .env"
fi

# Check dependencies
echo ""
echo "✓ Checking npm dependencies..."
if [ ! -d "node_modules" ]; then
    echo "  ⚠ node_modules not found. Run: npm install"
else
    echo "  ✓ Dependencies installed"
fi

# Check Git status
echo ""
echo "✓ Checking Git status..."
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --short | wc -l)
    if [ $UNCOMMITTED -gt 0 ]; then
        echo "  ⚠ Uncommitted changes ($UNCOMMITTED files)"
        echo "    Run: git add . && git commit -m 'message'"
    else
        echo "  ✓ All changes committed"
    fi
else
    echo "  ⚠ Git repo not initialized"
    echo "    Run: git init && git add . && git commit -m 'Initial commit'"
fi

echo ""
echo "=========================================="
echo "✅ Pre-deployment check complete!"
echo ""
echo "Next steps:"
echo "1. Ensure all env variables are set (.env file)"
echo "2. Commit all changes to Git"
echo "3. Push to GitHub: git push origin main"
echo "4. Deploy to Render (follow QUICKSTART.md)"
echo ""
