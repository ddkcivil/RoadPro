#!/bin/bash
# Automated Deployment Helper Script

echo "🚀 RoadPro Deployment Automation"
echo "================================="

# Check if required files exist
echo "📋 Checking deployment readiness..."

if [ -f "api/mongo-api.js" ]; then
    echo "✅ Backend API code present"
else
    echo "❌ Backend API code missing"
    exit 1
fi

if [ -f "services/apiConfig.ts" ]; then
    echo "✅ Frontend configuration present"
else
    echo "❌ Frontend configuration missing"
    exit 1
fi

if [ -f "api/package.json" ]; then
    echo "✅ Backend dependencies configured"
else
    echo "❌ Backend dependencies missing"
    exit 1
fi

echo ""
echo "🔧 Ready for deployment!"
echo "Next steps require manual actions:"
echo "1. Create MongoDB Atlas account and cluster"
echo "2. Create Railway account and deploy"
echo "3. Update apiConfig.ts with your Railway URL"
echo "4. Commit and push changes"

echo ""
echo "📦 Would you like me to:"
echo "1. Test local API (requires MongoDB)"
echo "2. Show current configuration"
echo "3. Help with specific deployment step"

read -p "Enter your choice (1-3) or press Enter to exit: " choice

case $choice in
    1)
        echo "Starting local API test..."
        cd api
        if [ -f ".env" ]; then
            npm install
            npm run dev
        else
            echo "Please configure .env file first"
        fi
        ;;
    2)
        echo "Current configuration:"
        echo "API Config File: services/apiConfig.ts"
        cat services/apiConfig.ts
        echo ""
        echo "Backend Package: api/package.json"
        cat api/package.json
        ;;
    3)
        echo "Which deployment step would you like help with?"
        echo "1. MongoDB Atlas setup"
        echo "2. Railway deployment"
        echo "3. Frontend configuration"
        read -p "Enter step number: " step
        case $step in
            1) echo "Visit: https://www.mongodb.com/atlas and follow the setup guide" ;;
            2) echo "Visit: https://railway.app and connect your GitHub repository" ;;
            3) echo "Update services/apiConfig.ts with your deployed API URL" ;;
            *) echo "Invalid step" ;;
        esac
        ;;
    *)
        echo "Exiting deployment helper"
        ;;
esac