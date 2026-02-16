# RoadPro Deployment Package for dharmadkunwar.com.np

## 📦 Deployment Files Structure

### Frontend (Static Files)
```
dist/
├── assets/           # All compiled JavaScript and CSS
├── pdfjs-worker/     # PDF processing worker
├── sql.js/          # SQLite WASM files
├── index.html       # Main HTML file
├── favicon.ico      # Site icon
├── manifest.json    # PWA manifest
└── sw.js           # Service worker
```

### Backend (API Server)
```
api/
├── _utils/          # Database and utility functions
├── auth/           # Authentication endpoints
├── projects/       # Project management endpoints
├── users/          # User management endpoints
├── pending-registrations/ # Registration endpoints
├── health.ts       # Health check endpoint
├── package.json    # Backend dependencies
└── .env           # Environment configuration
```

## 🚀 Deployment Steps

### 1. Frontend Deployment
Upload the entire `dist/` folder contents to your web server root directory.

### 2. Backend API Deployment
Upload the `api/` folder to your server's API directory.

### 3. Environment Configuration
On your server, create the following environment variables:
```
MONGODB_URI="mongodb+srv://Vercel-Admin-ddk:ddK4560@ddk.ag4riax.mongodb.net/roadpro?retryWrites=true&w=majority"
DB_NAME=roadpro
NODE_ENV=production
```

### 4. Server Requirements
- Node.js (v18 or higher)
- npm or yarn
- Web server (Apache/Nginx)
- SSL certificate (recommended)

### 5. Server Configuration
Use the provided `apache-config.conf` for proper routing:
- Frontend files served statically
- API requests proxied to backend
- SPA routing handled correctly

## ✅ Verification Checklist

After deployment:
- [ ] Visit https://dharmadkunwar.com.np
- [ ] Test login functionality
- [ ] Create a test project
- [ ] Verify data saves to MongoDB
- [ ] Test all major application features

## 🆘 Support
If you encounter issues:
1. Check server logs
2. Verify MongoDB connection
3. Confirm environment variables
4. Test API endpoints directly