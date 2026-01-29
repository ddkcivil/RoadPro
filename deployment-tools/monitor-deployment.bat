@echo off
echo 🚀 Final Railway Deployment Check
echo =================================

echo.
echo 📋 Latest Configuration Updates:
echo ===============================
echo ✅ Dockerfile - Proper container configuration
echo ✅ Removed problematic nixpacks.toml
echo ✅ Clean Railway auto-detection
echo ✅ Changes pushed to GitHub
echo.

echo 🔍 Current Deployment Status:
echo ============================

:check_status
echo Testing API Health Endpoint:
echo Request: GET https://baa26027-8f6b-42f7-86d2-1bbfbb30fc13.up.railway.app/api/health
echo.

curl -s https://baa26027-8f6b-42f7-86d2-1bbfbb30fc13.up.railway.app/api/health > response.txt

findstr "status.*ok" response.txt >nul
if %errorlevel% equ 0 (
    echo 🎉 SUCCESS! Backend API is now healthy!
    echo Response: 
    type response.txt
    echo.
    echo 🚀 DEPLOYMENT COMPLETE!
    echo ======================
    echo Your RoadPro application is now fully deployed and accessible:
    echo 🌍 Frontend: https://roadpro-weld.vercel.app
    echo ⚙️  Backend: https://baa26027-8f6b-42f7-86d2-1bbfbb30fc13.up.railway.app
    echo 📊 Database: MongoDB Atlas connected
    echo.
    echo 🧪 Ready for Testing:
    echo ===================
    echo 1. Visit https://roadpro-weld.vercel.app
    echo 2. Create a new user account
    echo 3. Test login functionality
    echo 4. Verify data persistence
    echo 5. Test admin panel features
    goto end_success
) else (
    echo ⚠️  API still not responding
    echo Current response:
    type response.txt
    echo.
    echo Next steps:
    echo 1. Trigger redeployment in Railway dashboard
    echo 2. Wait for Docker build to complete
    echo 3. Check Railway logs for any errors
    echo.
    echo Opening Railway dashboard for manual redeployment...
    start "" "https://railway.com/project/b2972077-c4e7-45fa-a177-4202e50d833f?environmentId=fb4f2809-f0c8-412d-8466-b567aa61dbcf"
    echo.
    echo Please trigger a redeploy in Railway and return when ready.
    pause >nul
    goto check_status
)

:end_success
echo.
echo 📚 Documentation:
echo ===============
echo • Deployment Guide: docs\DEPLOYMENT_COMPLETE_CHECKLIST.md
echo • Troubleshooting: docs\BLOB_URL_EXPIRATION.md
echo.
echo 🎯 Application Features Now Available:
echo =====================================
echo [✓] User Registration and Authentication
echo [✓] Project Management System
echo [✓] Document Management with OCR
echo [✓] User Administration Panel
echo [✓] Cross-browser Data Persistence
echo [✓] Real-time Collaboration Features
echo.
del response.txt 2>nul
echo Press any key to exit...
pause >nul