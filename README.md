# SocialHub - Modular Monolith

## Overview

This project now uses a modular monolith architecture.
The backend runs as a single application with internal modules:

- `auth`
- `users`
- `posts`
- `comments`
- `chat`

## Run the Project

Use the launcher from the repository root:

```bat
FINAL_START.bat
```

This starts:

- MongoDB on `27017` (if not already running)
- Modular monolith API on `4000`
- Frontend on `8081`

## API Base URL

`http://127.0.0.1:4000`

## Main Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/comments/post/:postId`
- `POST /api/comments`
- `POST /api/chat`
- `GET /api/chat/:userId1/:userId2`

## Frontend

Open:

`http://127.0.0.1:8081`

## JWT Authentication

Include token in headers:

```
Authorization: Bearer YOUR_TOKEN_HERE
```
