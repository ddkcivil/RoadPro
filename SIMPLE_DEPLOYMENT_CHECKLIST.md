# Deployment Checklist for rajendradhakal.com.np

## 🎯 Simple Step-by-Step Deployment

### Phase 1: Backend Setup (15 minutes)
- [ ] Go to https://railway.app
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your RoadPro repository
- [ ] Wait for deployment to complete
- [ ] Add environment variables:
  - [ ] MONGODB_URI = your MongoDB Atlas connection string
  - [ ] NODE_ENV = production
  - [ ] PORT = 3001
- [ ] Copy the Railway URL (e.g., https://xxxx-production.up.railway.app)

### Phase 2: Frontend Configuration (5 minutes)
- [ ] Open `services/apiConfig.ts`
- [ ] Update BASE_URL with your Railway URL
- [ ] Save the file
- [ ] Commit changes: `git add services/apiConfig.ts`
- [ ] Commit changes: `git commit -m "Update API configuration"`
- [ ] Push changes: `git push origin main`

### Phase 3: Custom Domain Setup (10 minutes)
- [ ] Go to https://vercel.com/dashboard
- [ ] Find your RoadPro project
- [ ] Go to Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter: rajendradhakal.com.np
- [ ] Click "Add"

### Phase 4: DNS Configuration (varies)
- [ ] Access your domain registrar control panel
- [ ] Add CNAME record:
  - Type: CNAME
  - Name: www
  - Value: cname.vercel-dns.com
- [ ] Add A records for apex domain:
  - Type: A, Name: @, Value: 76.76.21.21
  - Type: A, Name: @, Value: 76.76.21.22

### Phase 5: Verification (30-60 minutes)
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Visit https://rajendradhakal.com.np
- [ ] Test login functionality
- [ ] Test user registration
- [ ] Verify data persistence
- [ ] Test admin panel

## 🆘 Quick Help Commands

### Test Backend:
```bash
curl -s https://your-railway-url.up.railway.app/api/health
```
Should return: `{"status":"ok","timestamp":"...","database":"connected"}`

### Test Frontend:
```bash
curl -I https://rajendradhakal.com.np
```
Should return: `HTTP/1.1 200 OK`

## 📞 Troubleshooting

### If Backend Doesn't Work:
- Check Railway logs for errors
- Verify MongoDB Atlas connection string
- Ensure environment variables are set correctly

### If Domain Doesn't Load:
- Check DNS records are correct
- Wait longer for DNS propagation
- Clear browser cache

### If Login Doesn't Work:
- Verify API URL is correct in apiConfig.ts
- Check browser console for errors
- Test API endpoints directly

## 🎉 Success Indicators

When complete, you should see:
- ✅ Website loads at https://rajendradhakal.com.np
- ✅ Login page accessible
- ✅ User registration functional
- ✅ Data persists across sessions
- ✅ Admin panel working
- ✅ Cross-browser data sync

## ⏰ Timeline
- Backend setup: 15 minutes
- Frontend config: 5 minutes
- Domain setup: 10 minutes
- DNS propagation: 5-30 minutes
- Testing: 15 minutes
- **Total: 50-95 minutes**

## 🆘 Need Help?
Contact for help with specific steps:
1. MongoDB Atlas setup
2. Railway deployment
3. Vercel domain configuration
4. DNS records
5. Testing and verification