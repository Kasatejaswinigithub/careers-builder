# Deployment Guide

## Deploy to Render (Recommended — free tier available)

### Backend

1. Go to https://render.com and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Set these values:
   - Name: careers-backend
   - Root directory: backend
   - Build command: npm install && npm run build
   - Start command: npm run start
   - Environment: Node

5. Add environment variables:
   - MONGODB_URI = your MongoDB Atlas URI
   - JWT_SECRET = any long random string
   - JWT_EXPIRES_IN = 7d
   - PORT = 4000
   - NODE_ENV = production

6. Click "Create Web Service"
7. Copy the URL — it will look like: https://careers-backend.onrender.com

### Frontend

1. Click "New" → "Static Site"
2. Connect your GitHub repo
3. Set these values:
   - Name: careers-frontend
   - Root directory: frontend
   - Build command: npm install && npm run build
   - Publish directory: dist

4. Add environment variable:
   - VITE_API_URL = https://careers-backend.onrender.com/api

5. Click "Create Static Site"

### After deploying

Update your frontend VITE_API_URL to point to your backend URL.
Your public careers page will be at: https://careers-frontend.onrender.com/acme/careers

---

## Deploy backend to Railway (alternative)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables same as above
5. Railway auto-detects Node.js

---

## MongoDB Atlas (required for production)

1. Go to https://cloud.mongodb.com
2. Create free M0 cluster
3. Create database user
4. Whitelist 0.0.0.0/0 in Network Access
5. Get connection string and use as MONGODB_URI

---

## Local development

```bash
docker-compose up -d
npm install
npm run seed
npm run dev
```
