@echo off
echo MongoDB Connection String Setup for dharmadkunwar.com.np

echo.
echo Please follow these steps to get your MongoDB Atlas connection string:
echo.
echo 1. Go to your MongoDB Atlas dashboard:
echo    https://cloud.mongodb.com/v2#/org/698de5a0365ff9aee4f011ec/projects
echo.
echo 2. Select your project and cluster
echo 3. Click the "Connect" button
echo 4. Choose "Connect your application"
echo 5. Copy the connection string
echo.
echo Example connection string format:
echo mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/roadpro?retryWrites=true^&w=majority
echo.
echo IMPORTANT: Replace "username" and "password" with your actual database credentials
echo.
echo Current placeholder in api/.env:
echo MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/roadpro?retryWrites=true&w=majority"
echo.
echo After getting your connection string, update the api/.env file with your actual credentials.
echo.
pause