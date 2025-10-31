#!/bin/bash

# TalentFlow - Quick Deployment Setup Script
# This script helps prepare and deploy your project

echo "🏰 TalentFlow Deployment Helper 🏰"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "⚠️  Git not initialized. Initializing..."
    git init
    git add .
    git commit -m "Initial commit - TalentFlow recruitment platform"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo ""
    echo "📝 You have uncommitted changes. Would you like to commit them? (y/n)"
    read -r commit_choice
    if [ "$commit_choice" = "y" ]; then
        git add .
        echo "Enter commit message (or press Enter for default):"
        read -r commit_msg
        if [ -z "$commit_msg" ]; then
            commit_msg="Update: Ready for deployment"
        fi
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    fi
fi

echo ""
echo "🚀 Choose your deployment platform:"
echo "1. Vercel (Recommended - Easiest)"
echo "2. Netlify"
echo "3. GitHub Pages"
echo "4. Just build locally"
echo "5. Exit"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "📦 Deploying to Vercel..."
        echo ""
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        echo "Running Vercel deployment..."
        vercel --prod
        ;;
    2)
        echo ""
        echo "📦 Building for Netlify..."
        npm run build
        echo ""
        echo "✅ Build complete!"
        echo ""
        echo "Next steps:"
        echo "1. Go to https://app.netlify.com"
        echo "2. Drag and drop the 'build' folder"
        echo "3. Or connect your GitHub repo for auto-deployment"
        ;;
    3)
        echo ""
        echo "📦 Setting up GitHub Pages..."
        
        # Check if gh-pages is installed
        if ! npm list gh-pages &> /dev/null; then
            echo "Installing gh-pages..."
            npm install --save-dev gh-pages
        fi
        
        # Update package.json with deploy script (manual step required)
        echo ""
        echo "⚠️  Manual step required:"
        echo "Add these to your package.json:"
        echo ""
        echo "  \"homepage\": \"https://Shashwat-Nautiyal.github.io/talent_flow\","
        echo ""
        echo "  In scripts section, add:"
        echo "  \"predeploy\": \"npm run build\","
        echo "  \"deploy\": \"gh-pages -d build\""
        echo ""
        read -p "Press Enter when ready, then run: npm run deploy"
        ;;
    4)
        echo ""
        echo "📦 Building production bundle..."
        npm run build
        echo ""
        echo "✅ Build complete!"
        echo "📁 Built files are in the 'build' folder"
        echo ""
        echo "To preview locally:"
        echo "  npx serve -s build"
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Deployment process complete!"
echo ""
echo "📚 For more details, see DEPLOYMENT.md"
echo "🎉 Your TalentFlow app is ready to shine!"
