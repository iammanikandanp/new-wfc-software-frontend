# WFC Gym Management System - Implementation Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Database Setup](#database-setup)
4. [API Configuration](#api-configuration)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### One-Command Setup (Linux/Mac)
```bash
# Clone and setup backend
cd wfc-software-backend-main
npm install
cp .env.example .env

# In another terminal, setup frontend
cd wfc-software-frontend-main
npm install

# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in new terminal)
npm run dev
```

## 📊 Detailed Setup

### Backend Setup

#### Step 1: Install Dependencies
```bash
cd wfc-software-backend-main
npm install
```

#### Step 2: Environment Configuration
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wfc-gym
JWT_SECRET=your-super-secure-secret-key-min-32-chars-here
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NODE_ENV=development
```

#### Step 3: Start Backend
```bash
# Development with auto-reload
npm run dev

# Or production mode
npm start
```

The backend will be available at: `http://localhost:5000`

### Frontend Setup

#### Step 1: Install Dependencies
```bash
cd wfc-software-frontend-main
npm install
```

#### Step 2: Environment Setup
Create `.env` file (if needed):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

#### Step 3: Start Frontend
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🗄️ Database Setup

### MongoDB Local Installation

#### Windows
1. Download from https://www.mongodb.com/try/download/community
2. Run installer and follow setup wizard
3. MongoDB runs as a service automatically

#### Mac
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt-get update
apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Verify Installation
```bash
mongosh
# Should show MongoDB shell prompt
# Type: exit
```

### MongoDB Cloud (MongoDB Atlas)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wfc-gym?retryWrites=true&w=majority
```

## 🔑 API Configuration

### Cloudinary Setup (Optional - for image uploads)

1. Register at https://cloudinary.com
2. Get API credentials from Dashboard
3. Update `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### JWT Configuration

In production, ensure:
- `JWT_SECRET` is strong (minimum 32 characters)
- Use environment variables for all secrets
- Never commit `.env` file to version control

## 🧪 Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "member"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get all members (requires token)
curl http://localhost:5000/api/v1/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Postman Collection

1. Open Postman
2. Import collection from: `postman-collection.json` (to be created)
3. Set environment variables:
   - `base_url`: http://localhost:5000
   - `token`: Your JWT token

## 🚢 Deployment

### Deploy Backend (Heroku Example)

```bash
# Login to Heroku
heroku login

# Create new app
heroku create wfc-fitness-gym

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Deploy Frontend (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## 🛠️ Troubleshooting

### MongoDB Connection Issues

**Error**: "connect ECONNREFUSED 127.0.0.1:27017"

**Solution**:
- Ensure MongoDB is running: `mongosh`
- Check `MONGODB_URI` in `.env`
- For Windows: Check if MongoDB service is running

### Port Already in Use

**Error**: "Error: listen EADDRINUSE: address already in use :::5000"

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (Mac/Linux)
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### JWT Token Errors

**Error**: "Not authorized to access this route"

**Solution**:
- Ensure token is passed in header: `Authorization: Bearer <token>`
- Check token expiration (30 days default)
- Regenerate token by logging in again

### CORS Errors

**Error**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**:
- Check CORS configuration in `server.js`
- Ensure frontend URL is in allowed origins
- For development, `origin: "*"` is fine

## 📁 Project File Structure Explained

### Backend Structure
```
models/         → Database schemas (define data structure)
controllers/    → Business logic (process requests)
routers/        → API routes (map URLs to controllers)
middleware/     → Auth checks, file uploads, etc.
utils/          → Helper functions
database/       → Database connection
server.js       → Express app initialization
```

### Frontend Structure
```
pages/          → Full page components
components/     → Reusable UI components
hooks/          → Custom React hooks
App.jsx         → Main routing component
main.jsx        → React app entry point
```

## 🔑 Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login user |
| GET | /members | Yes | Get all members |
| POST | /members | Yes | Create member |
| GET | /payments | Yes | Get all payments |
| POST | /payments | Yes | Create payment |
| GET | /attendance/daily | Yes | Get daily attendance |
| GET | /diet-plans | Yes | Get diet plans |
| POST | /diet-plans | Yes | Create diet plan |

## 💡 Tips & Best Practices

1. **Always use environment variables** for sensitive data
2. **Test APIs** before integrating with frontend
3. **Use Postman** for API testing
4. **Keep database indexed** for performance
5. **Implement proper error handling** in all endpoints
6. **Use middleware** for authentication
7. **Follow REST conventions** for API design

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| npm install fails | Delete `node_modules` and `package-lock.json`, then reinstall |
| Port conflicts | Change PORT in `.env` file |
| Database not connecting | Ensure MongoDB is running and URI is correct |
| CORS errors | Check server.js CORS configuration |
| Image upload fails | Verify Cloudinary credentials |
| Frontend not loading | Check if `npm run dev` is running |

## 🎯 Next Steps After Setup

1. ✅ Start both servers (backend and frontend)
2. ✅ Register a new account
3. ✅ Login with credentials
4. ✅ Create a member
5. ✅ Add a payment
6. ✅ View reports and analytics
7. ✅ Test all features

---

**Need Help?** Check the README.md or contact support@wfcfitness.com
