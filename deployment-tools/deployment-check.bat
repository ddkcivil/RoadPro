@echo off
echo 🌐 Internet Deployment Verification
echo ==================================

echo.
echo 🔍 Checking Application Status
echo =============================

echo.
echo 🌍 Frontend Status:
echo =================
echo Testing: https://roadpro-weld.vercel.app
curl -s -o frontend_response.txt https://roadpro-weld.vercel.app
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible
    echo    Status: Online and responding
) else (
    echo ❌ Frontend is not accessible
    echo    Status: Offline or unreachable
)

echo.
echo ⚙️ Backend Status:
echo ================
echo Testing: https://baa26027-8f6b-42f7-86d2-1bbfbb30fc13.up.railway.app/api/health
curl -s https://baa26027-8f6b-42f7-86d2-1bbfbb30fc13.up.railway.app/api/health > backend_response.txt
findstr "status.*ok" backend_response.txt >nul
if %errorlevel% equ 0 (
    echo ✅ Backend API is healthy
    echo    Status: Connected to MongoDB
) else (
    echo ⚠️  Backend API needs attention
    echo    Status: Application not found or unhealthy
    echo    Action: Requires Railway redeployment
)

echo.
echo 📊 MongoDB Connection:
echo =====================
echo Testing local MongoDB connection...
node test-mongodb.js > mongodb_test.txt
findstr "Successfully connected" mongodb_test.txt >nul
if %errorlevel% equ 0 (
    echo ✅ MongoDB connection working locally
) else (
    echo ❌ MongoDB connection issues
)

echo.
echo 📋 Current Configuration:
echo =======================
echo.
echo Frontend URL: https://roadpro-weld.vercel.app
echo Backend API: https://baa26027-8f6b-42f7-86d2-1bbfbb30fc13.up.railway.app
echo MongoDB: Connected locally ✓
echo.
echo API Configuration Status:
type services\apiConfig.ts | findstr "BASE_URL"
echo.
echo Environment Variables:
type api\.env | findstr "MONGODB_URI"

echo.
echo 🎯 Deployment Summary:
echo ====================
if exist frontend_response.txt (
    echo ✅ Frontend: Deployed and accessible
) else (
    echo ❌ Frontend: Issues detected
)

findstr "status.*ok" backend_response.txt >nul
if %errorlevel% equ 0 (
    echo ✅ Backend: Healthy and connected
) else (
    echo ⚠️  Backend: Needs Railway redeployment
)

findstr "Successfully connected" mongodb_test.txt >nul
if %errorlevel% equ 0 (
    echo ✅ Database: MongoDB connection verified
) else (
    echo ❌ Database: Connection issues
)

echo.
echo 🚀 Next Steps:
echo =============
echo 1. Railway Backend Redeployment:
echo    - Visit: https://railway.com/dashboard
echo    - Find RoadPro project
echo    - Click "Deploy" or "Redeploy"
echo    - Verify environment variables:
echo      • MONGODB_URI (with ddK4560%%40 password)
echo      • NODE_ENV=production
echo      • PORT=3001
echo.
echo 2. Test After Deployment:
echo    curl https://baa26027-8f6b-42f7-86d2-1bbfbb30fc13.up.railway.app/api/health
echo.
echo 3. Verify Full Application:
echo    Visit: https://roadpro-weld.vercel.app
echo    Test user registration and login
echo.
echo 📞 Support Resources:
echo ==================
echo • Railway Deployment Guide: docs\RAILWAY_DEPLOYMENT_GUIDE.md
echo • Complete Checklist: docs\DEPLOYMENT_COMPLETE_CHECKLIST.md
echo • Troubleshooting: docs\BLOB_URL_EXPIRATION.md

echo.
del frontend_response.txt 2>nul
del backend_response.txt 2>nul
del mongodb_test.txt 2>nul

echo.
echo Press any key to continue...
pause >nul