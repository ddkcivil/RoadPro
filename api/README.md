# RoadPro Backend API

This is a simple backend API for the RoadPro application that provides persistent storage for user accounts and projects.

## Features

- User management (create, read, update, delete)
- User registration with approval workflow
- Project management
- Cross-browser data persistence
- RESTful API endpoints

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Start the API Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will run on port 3001 by default.

### 3. API Endpoints

#### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `POST /api/auth/login` - User login

#### Pending Registrations
- `GET /api/pending-registrations` - Get pending registrations
- `POST /api/pending-registrations` - Submit new registration
- `POST /api/pending-registrations/:id/approve` - Approve registration
- `DELETE /api/pending-registrations/:id` - Reject registration

#### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Health Check
- `GET /api/health` - API health status

## Integration with Frontend

The frontend components have been updated to use the API service instead of localStorage:

1. `UserRegistration.tsx` - Submits registrations to API
2. `UserManagement.tsx` - Manages users through API
3. `apiService.ts` - Handles all API communications

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)
Deploy the API to Vercel using Serverless Functions.

### Option 2: Heroku
```bash
heroku create roadpro-api
git push heroku main
```

### Option 3: Railway
Connect your GitHub repo to Railway for automatic deployments.

## Environment Variables

Create a `.env` file in the api directory:

```env
PORT=3001
NODE_ENV=production
```

## Current Limitations

- Data is stored in-memory (resets on server restart)
- No authentication middleware
- No database persistence
- No rate limiting

## Future Improvements

- [ ] Add MongoDB/PostgreSQL database
- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Implement data validation
- [ ] Add logging
- [ ] Add automated tests
- [ ] Implement caching

## Testing

Test the API endpoints:

```bash
# Get all users
curl http://localhost:3001/api/users

# Create a new user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+1234567890","role":"SITE_ENGINEER"}'

# Health check
curl http://localhost:3001/api/health
```