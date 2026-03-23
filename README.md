# SocialHub - Microservices Architecture

A complete social media platform built with a **microservices architecture** using Node.js, Express, and MongoDB.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend                               │
│                    (Port 8081)                              │
│                  HTML/CSS/JavaScript                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
│                    (Port 5000)                              │
│              Routes traffic to services                      │
└──────┬────────────┬─────────────┬──────────────┬────────────┘
       │            │             │              │
       ▼            ▼             ▼              ▼
   ┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐
   │ User   │  │ Post   │  │ Comment  │  │ Chat     │
   │ Service│  │ Service│  │ Service  │  │ Service  │
   │:5001   │  │:5002   │  │:5003     │  │:5004     │
   └───┬────┘  └───┬────┘  └────┬─────┘  └────┬─────┘
       │           │            │             │
       └───────────┴────────────┴─────────────┘
                   │
                   ▼
         ┌──────────────────────┐
        │   MongoDB Instance    │
        │    (Port 27017)       │
        │  socialhub_db         │
        └──────────────────────┘
```

## Services

### 1. **API Gateway** (Port 5000)
- Routes all client requests to appropriate microservices
- Uses `http-proxy-middleware` for request forwarding
- Health checks for all downstream services
- Environment: `gateway/.env`

### 2. **User Service** (Port 5001)
- User registration and authentication
- User profile management
- JWT token generation and validation
- Routes: `/auth/register`, `/auth/login`, `/users`

### 3. **Post Service** (Port 5002)
- Create, read, update, delete posts
- Like/unlike posts
- Routes: `/posts`, `/posts/:id`, `/posts/:id/like`

### 4. **Comment Service** (Port 5003)
- Nested comments with reply threads
- Comment tree structure via `parentId/children`
- Like/unlike comments
- Routes: `/comments`, `/comments/post/:postId`, `/comments/:id/like`

### 5. **Chat Service** (Port 5004)
- Direct messaging between users
- Bidirectional message retrieval
- Routes: `/chat/:userId1/:userId2`, `/chat` (POST)

## Quick Start

### Prerequisites
- **Node.js** v14+ 
- **MongoDB** running on `localhost:27017`

### Installation & Launch

**Windows:**
```bash
FINAL_START.bat
```

**Manual Start (each service):**
```bash
# Terminal 1: API Gateway
cd gateway
npm install
node server.js

# Terminal 2: User Service
cd userservie
npm install
node server.js

# Terminal 3: Post Service
cd post-service
npm install
node server.js

# Terminal 4: Comment Service
cd comment-service
npm install
node server.js

# Terminal 5: Chat Service
cd chat-service
npm install
node server.js

# Terminal 6: Frontend
cd frontend
npm install
node server.js
```

## API Endpoints

All endpoints are accessed through the API Gateway at `http://127.0.0.1:5000`

### Authentication
```
POST   /api/auth/register     { name, email, password }
POST   /api/auth/login        { email, password }
```

### Users
```
GET    /api/users
POST   /api/users             { name, email, password }
DELETE /api/users/:id         (requires JWT)
```

### Posts
```
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts             { title, content, userId, userName }
PUT    /api/posts/:id         { title, content }
DELETE /api/posts/:id
PUT    /api/posts/:id/like    { userId }
```

### Comments
```
GET    /api/comments
GET    /api/comments/post/:postId
POST   /api/comments          { text, postId, userId, userName, parentId? }
DELETE /api/comments/:id
PUT    /api/comments/:id/like { userId }
```

### Chat
```
GET    /api/chat/:userId1/:userId2
POST   /api/chat              { senderId, receiverId, text }
```

## Environment Variables

Each service has its own `.env` file:

**gateway/.env**
```
PORT=5000
USER_SERVICE_URL=http://127.0.0.1:5001
POST_SERVICE_URL=http://127.0.0.1:5002
COMMENT_SERVICE_URL=http://127.0.0.1:5003
CHAT_SERVICE_URL=http://127.0.0.1:5004
```

**Service .env files**
```
PORT=5001 (or 5002, 5003, 5004)
MONGO_URI=mongodb://localhost:27017/socialhub_db
JWT_SECRET=0000 (User Service only)
```

## MongoDB Collections

- **users** - User accounts with hashed passwords
- **posts** - Social media posts
- **comments** - Nested comments with parentId references
- **messages** - Direct messages between users

## Frontend

Served on port **8081**
- Pure HTML/CSS/JavaScript (no frameworks)
- Responsive design
- Real-time chat polling (every 3 seconds)
- JWT authentication in localStorage

## Features

✅ User registration & authentication (JWT)
✅ Create and manage posts
✅ Like/unlike posts and comments
✅ Nested comment threads
✅ Direct messaging
✅ Real-time updates via polling

## Ports Summary

| Service | Port |
|---------|------|
| MongoDB | 27017 |
| API Gateway | 5000 |
| User Service | 5001 |
| Post Service | 5002 |
| Comment Service | 5003 |
| Chat Service | 5004 |
| Frontend | 8081 |

## Technologies

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Proxy:** http-proxy-middleware
- **Frontend:** HTML5/CSS3/Vanilla JavaScript

## Future Improvements

- [ ] WebSocket integration for real-time chat
- [ ] Message queue (RabbitMQ) for service communication
- [ ] Service-to-service authentication
- [ ] Input validation middleware (Joi/express-validator)
- [ ] Comprehensive test suite (Jest/Supertest)
- [ ] Docker & Docker Compose
- [ ] API documentation (Swagger/OpenAPI)
