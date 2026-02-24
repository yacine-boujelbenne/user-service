# Microservices Architecture - Quick Start Guide

## 🚀 Start All Services

Run these commands in **4 separate terminals**:

```bash
# Terminal 1: User Service (Port 5000)
cd user-service
node server.js

# Terminal 2: Post Service (Port 5001)
cd user-service/post-service
node server.js

# Terminal 3: Comment Service (Port 5002)
cd user-service/comment-service
node server.js

# Terminal 4: API Gateway (Port 3000)
cd user-service/gateway
node server.js
```

## 🌐 Open Frontend

Open `user-service/frontend/index.html` in your browser.

## ✅ Test the App

1. **Register** a new user
2. **Login** with your credentials
3. **Create a post**
4. View users and posts with comments

## 📡 API Endpoints

All requests go through the Gateway at `http://localhost:3000/api`

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/users` - Get users
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create post (JWT required)
- `GET /api/comments/post/:postId` - Get comments
- `POST /api/comments` - Create comment

## 🔑 JWT Authentication

Include token in headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```
