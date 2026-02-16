# Deployment Checklist for dharmadkunwar.com.np

## 📋 Pre-Deployment Tasks

### 1. MongoDB Setup
- [ ] Create MongoDB Atlas account at cloud.mongodb.com
- [ ] Create a new cluster (free tier available)
- [ ] Get connection string and update in `api/.env`
- [ ] Add your server IP to database access list
- [ ] Create database user with read/write permissions

### 2. Environment Configuration
- [ ] Update `api/.env` with production MongoDB URI
- [ ] Set `NODE_ENV=production` in environment
- [ ] Update any domain-specific configurations

### 3. Build Process
- [ ] Run `npm run build-prod` to create production build
- [ ] Verify build completes without errors
- [ ] Test locally before deployment

### 4. Server Preparation
- [ ] Ensure Node.js is installed on server
- [ ] Verify sufficient disk space and memory
- [ ] Check firewall settings for required ports
- [ ] Set up SSL certificate (if using HTTPS)

## 🚀 Deployment Steps

### 5. Upload Files
- [ ] Upload frontend build files to web server root
- [ ] Upload API files to server's API directory
- [ ] Set correct file permissions
- [ ] Configure environment variables on server

### 6. Server Configuration
- [ ] Update web server configuration (Apache/Nginx)
- [ ] Configure reverse proxy for API requests
- [ ] Set up process manager (PM2) for API server
- [ ] Configure SSL/TLS certificates

### 7. Service Setup
- [ ] Start API server using PM2 or systemd
- [ ] Configure auto-start on boot
- [ ] Test API endpoints directly
- [ ] Test frontend-backend communication

## ✅ Post-Deployment Verification

### 8. Functionality Tests
- [ ] Visit https://dharmadkunwar.com.np
- [ ] Test login with various user roles
- [ ] Create a test project
- [ ] Verify data persists in MongoDB
- [ ] Test all major modules

### 9. Performance Checks
- [ ] Verify page load speeds
- [ ] Check for console errors
- [ ] Monitor server resource usage
- [ ] Test concurrent users if applicable

### 10. Security Verification
- [ ] Verify HTTPS is working properly
- [ ] Check that sensitive data is not exposed
- [ ] Verify authentication is working
- [ ] Test unauthorized access attempts

## 🛠️ Maintenance Tasks

### 11. Monitoring Setup
- [ ] Set up uptime monitoring
- [ ] Configure error logging
- [ ] Set up database backup procedures
- [ ] Plan for regular updates

## 📞 Support Information

If you encounter issues during deployment:

1. Check server logs in `/var/log/`
2. Verify environment variables are set correctly
3. Confirm MongoDB connection string is accurate
4. Review web server configuration
5. Test API endpoints independently

For ongoing support, contact the development team with specific error messages and logs.