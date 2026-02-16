@echo off
echo Building RoadPro for Production Deployment...

echo.
echo Step 1: Building API...
cd api
call npm install
call npm run build
cd ..

echo.
echo Step 2: Building Frontend...
call npm install
call npm run build

echo.
echo Step 3: Preparing deployment files...
echo Frontend build complete. Files are in the 'dist' folder.
echo API build complete. Files are in the 'api' folder.

echo.
echo Step 4: Next steps for dharmadkunwar.com.np:
echo 1. Update api/.env with your MongoDB Atlas connection string
echo 2. Upload 'dist' folder contents to your web server root
echo 3. Upload 'api' folder to your server's API directory
echo 4. Configure your web server for API routing
echo 5. Set environment variables on your server
echo 6. Test the deployment

echo.
echo Deployment preparation complete!
pause