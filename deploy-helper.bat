@echo off
echo 🚀 RoadPro Deployment Automation
echo =================================

echo 📋 Checking deployment readiness...

if exist "api\mongo-api.js" (
    echo ✅ Backend API code present
) else (
    echo ❌ Backend API code missing
    pause
    exit /b 1
)

if exist "services\apiConfig.ts" (
    echo ✅ Frontend configuration present
) else (
    echo ❌ Frontend configuration missing
    pause
    exit /b 1
)

if exist "api\package.json" (
    echo ✅ Backend dependencies configured
) else (
    echo ❌ Backend dependencies missing
    pause
    exit /b 1
)

echo.
echo 🔧 Ready for deployment!
echo Next steps require manual actions:
echo 1. Create MongoDB Atlas account and cluster
echo 2. Create Railway account and deploy
echo 3. Update apiConfig.ts with your Railway URL
echo 4. Commit and push changes

echo.
echo 📦 What would you like to do?
echo 1. Show current configuration
echo 2. Open deployment guides
echo 3. Exit

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Current configuration:
    echo API Config File: services\apiConfig.ts
    type services\apiConfig.ts
    echo.
    echo Backend Package: api\package.json
    type api\package.json
) else if "%choice%"=="2" (
    echo Opening deployment resources...
    start "" "https://www.mongodb.com/atlas"
    start "" "https://railway.app"
    start "" "DEPLOYMENT_CHECKLIST.md"
) else (
    echo Exiting deployment helper
)

pause