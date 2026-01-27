# Simplified Deployment Guide for rajendradhakal.com.np

## 🎯 Goal
Deploy RoadPro to your custom domain with minimal complexity

## 🚨 Current Issue
Your Railway backend is not responding, causing the app to use mock data

## ✅ Simplest Solution: Re-deploy Everything

### Step 1: Deploy Backend to Railway (Simple Method)

1. **Go to Railway.app**
   - Visit: https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your "RoadPro" repository
   - Railway will automatically detect and deploy

3. **Set Environment Variables**
   - Go to "Settings" → "Environment Variables"
   - Add these variables:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     NODE_ENV=production
     PORT=3001
     ```

4. **Get the New URL**
   - Copy the URL from the "Domains" section
   - It will look like: `https://something-production.up.railway.app`

### Step 2: Update Frontend Configuration

1. **Edit the API Config File**
   - Open: `services/apiConfig.ts`
   - Replace the BASE_URL with your new Railway URL:
   ```typescript
   BASE_URL: 'https://your-new-railway-url.up.railway.app'
   ```

2. **Commit Changes**
   ```bash
   git add services/apiConfig.ts
   git commit -m "Update API configuration"
   git push origin main
   ```

### Step 3: Add Custom Domain to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find your RoadPro project

2. **Add Custom Domain**
   - Go to "Settings" → "Domains"
   - Click "Add Domain"
   - Enter: `rajendradhakal.com.np`
   - Click "Add"

3. **Update DNS Records**
   - In your domain registrar's control panel:
     - Add CNAME record: `www` → `cname.vercel-dns.com`
     - Add A records for apex domain to Vercel IPs

### Step 4: Test Your Deployment

1. **Wait for DNS propagation** (5-30 minutes)
2. **Visit**: https://rajendradhakal.com.np
3. **Test login and user management features**

## 🆘 If You Need Help with Specific Steps

If any step is unclear, let me know which one you need help with:

- Setting up MongoDB Atlas connection
- Deploying to Railway
- Adding custom domain to Vercel
- Updating DNS records

## 📞 Quick Help Commands

Run this command to check your current deployment status:
```bash
curl -s https://your-railway-url.up.railway.app/api/health
```

This should return a JSON response with "status: ok" when working properly.

## ✅ Success Criteria

When everything is working, you'll have:
- ✅ Website at https://rajendradhakal.com.np
- ✅ Working login functionality
- ✅ Persistent user data storage
- ✅ Admin panel operational
- ✅ Cross-browser data synchronization