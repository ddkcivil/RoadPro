# RoadPro Deployment Guide for dharmadkunwar.com.np

## 🚀 Deployment Steps

### 1. MongoDB Setup (Required)
**Option A: MongoDB Atlas (Recommended)**
1. Go to https://cloud.mongodb.com/
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `api/.env` with your MongoDB URI

**Option B: Local MongoDB (for development)**
1. Download MongoDB Community Server
2. Install and start MongoDB service
3. Use connection string: `mongodb://localhost:27017/roadpro`

### 2. Environment Configuration
Update `api/.env` with your actual MongoDB connection string:
```env
MONGODB_URI="mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/roadpro?retryWrites=true&w=majority"
DB_NAME=roadpro
NODE_ENV=production
```

### 3. Build Process
```bash
# In the api directory
cd api
npm install
npm run build

# In the main directory
npm install
npm run build
```

### 4. Deployment to dharmadkunwar.com.np
**Frontend Deployment:**
- Build files are in `dist/` folder
- Upload contents to your web server
- Configure your web server to serve static files

**Backend API Deployment:**
- Deploy the `api/` directory to your server
- Ensure Node.js is installed on the server
- Set up environment variables on the server
- Run the API with a process manager like PM2

### 5. Server Configuration
**Apache/Nginx Configuration:**
```apache
# Enable rewrite rules
RewriteEngine On

# API routes
RewriteRule ^api/(.*)$ /api/$1 [L]

# Frontend routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### 6. Testing
1. Test API endpoints: `https://dharmadkunwar.com.np/api/health`
2. Test frontend: `https://dharmadkunwar.com.np/`
3. Verify database connection and data persistence

## 🛠️ Development Workflow

### Local Development
1. Start local MongoDB (if using local)
2. Run frontend: `npm run dev`
3. Run backend API separately if needed
4. Use localhost for development

### Production Build
1. Update environment variables
2. Run build commands
3. Test locally before deployment
4. Deploy to production server

## 🔧 Troubleshooting

### Common Issues:
- **API 404 errors**: Check server routing configuration
- **Database connection**: Verify MongoDB URI and network access
- **CORS issues**: Configure CORS headers on API server
- **Static file serving**: Ensure web server is configured for SPA

### Monitoring:
- Check server logs
- Monitor MongoDB Atlas dashboard
- Use browser developer tools for frontend debugging