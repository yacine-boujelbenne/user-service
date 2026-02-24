# Quick JSON Reference Card for Postman

Copy and paste these JSON bodies directly into Postman!

---

## 👤 USER SERVICE - Create User

### Example 1

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Example 2

```json
{
  "name": "Alice Martin",
  "email": "alice.martin@enit.tn",
  "password": "Alice@2024!"
}
```

### Example 3

```json
{
  "name": "Bob Wilson",
  "email": "bob.wilson@company.com",
  "password": "BobSecure456"
}
```

### Example 4

```json
{
  "name": "Marie Dupont",
  "email": "marie.dupont@email.fr",
  "password": "Marie#Pass789"
}
```

### Example 5

```json
{
  "name": "Ahmed Ben Ali",
  "email": "ahmed.benali@enit.tn",
  "password": "Ahmed2024!"
}
```

---

## 📝 POST SERVICE - Create Post

### Example 1 - Tech Blog

```json
{
  "title": "Introduction to Microservices",
  "content": "Microservices architecture is a design pattern where applications are structured as a collection of loosely coupled services. Each service is self-contained and implements a single business capability.",
  "userId": "user123"
}
```

### Example 2 - Tutorial

```json
{
  "title": "Getting Started with Node.js",
  "content": "Node.js is a powerful JavaScript runtime built on Chrome's V8 engine. It allows developers to build scalable network applications using JavaScript on the server side. In this tutorial, we'll cover the basics.",
  "userId": "user456"
}
```

### Example 3 - Best Practices

```json
{
  "title": "REST API Best Practices",
  "content": "When designing RESTful APIs, follow these best practices: 1) Use proper HTTP methods, 2) Implement versioning, 3) Use meaningful resource names, 4) Return appropriate status codes, 5) Implement proper error handling.",
  "userId": "user789"
}
```

### Example 4 - Database

```json
{
  "title": "MongoDB vs PostgreSQL",
  "content": "Choosing between MongoDB and PostgreSQL depends on your use case. MongoDB excels at handling unstructured data and horizontal scaling, while PostgreSQL is ideal for complex queries and ACID compliance.",
  "userId": "user101"
}
```

### Example 5 - DevOps

```json
{
  "title": "Docker Containerization Guide",
  "content": "Docker has revolutionized application deployment. This guide covers creating Dockerfiles, managing containers, working with Docker Compose, and deploying containerized applications to production.",
  "userId": "user202"
}
```

### Example 6 - Short Post

```json
{
  "title": "Quick Tip: Git Aliases",
  "content": "Save time with Git aliases! Add these to your .gitconfig file to speed up your workflow.",
  "userId": "user303"
}
```

### Example 7 - Question Post

```json
{
  "title": "How to Handle Authentication in Microservices?",
  "content": "I'm building a microservices architecture and struggling with authentication. Should I use JWT tokens? How do I handle token refresh? Any recommendations?",
  "userId": "user404"
}
```

---

## 💬 COMMENT SERVICE - Create Comment

### Example 1 - Positive

```json
{
  "text": "Great post! Very informative and well-written.",
  "postId": "post123",
  "userId": "user456"
}
```

### Example 2 - Question

```json
{
  "text": "Thanks for sharing! Could you elaborate more on the authentication part?",
  "postId": "post123",
  "userId": "user789"
}
```

### Example 3 - Helpful

```json
{
  "text": "This is exactly what I was looking for! Bookmarked for future reference.",
  "postId": "post456",
  "userId": "user101"
}
```

### Example 4 - Constructive

```json
{
  "text": "Good article, but I think you should add some code examples to make it clearer.",
  "postId": "post456",
  "userId": "user202"
}
```

### Example 5 - Appreciation

```json
{
  "text": "Thank you so much! This solved my problem that I've been struggling with for days.",
  "postId": "post789",
  "userId": "user303"
}
```

### Example 6 - Follow-up

```json
{
  "text": "I tried your approach and it worked perfectly! Looking forward to more posts like this.",
  "postId": "post789",
  "userId": "user404"
}
```

### Example 7 - Discussion

```json
{
  "text": "Interesting perspective! I've been using a different approach. Have you considered using Redis for caching?",
  "postId": "post101",
  "userId": "user505"
}
```

### Example 8 - Short

```json
{
  "text": "👍 Excellent!",
  "postId": "post202",
  "userId": "user606"
}
```

### Example 9 - Detailed

```json
{
  "text": "I appreciate the detailed explanation. One thing I'd add is that when implementing microservices, you should also consider the overhead of inter-service communication and implement proper circuit breakers.",
  "postId": "post303",
  "userId": "user707"
}
```

### Example 10 - Request

```json
{
  "text": "Could you write a follow-up post about deploying this to production? That would be really helpful!",
  "postId": "post404",
  "userId": "user808"
}
```

---

## 🔄 UPDATE POST - Example

```json
{
  "title": "Introduction to Microservices (Updated)",
  "content": "Microservices architecture is a design pattern where applications are structured as a collection of loosely coupled services. UPDATED: Added section on service discovery and load balancing.",
  "userId": "user123"
}
```

---

## 🎯 Complete Workflow Example

### Step 1: Create User

```json
{
  "name": "Test User",
  "email": "test.user@example.com",
  "password": "testPass123"
}
```

**→ Copy the `_id` from response (e.g., `65d1a2b3c4e5f6789abcdef0`)**

### Step 2: Create Post (use the user ID from Step 1)

```json
{
  "title": "My First Post",
  "content": "This is my first post on this platform!",
  "userId": "65d1a2b3c4e5f6789abcdef0"
}
```

**→ Copy the `_id` from response (e.g., `65d2b3c4d5e6f7890abcdef1`)**

### Step 3: Create Comment (use IDs from Steps 1 & 2)

```json
{
  "text": "Commenting on my own post!",
  "postId": "65d2b3c4d5e6f7890abcdef1",
  "userId": "65d1a2b3c4e5f6789abcdef0"
}
```

---

## 📊 Bulk Testing Data

### 5 Users at Once

```json
{"name": "User One", "email": "user1@test.com", "password": "pass1"}
{"name": "User Two", "email": "user2@test.com", "password": "pass2"}
{"name": "User Three", "email": "user3@test.com", "password": "pass3"}
{"name": "User Four", "email": "user4@test.com", "password": "pass4"}
{"name": "User Five", "email": "user5@test.com", "password": "pass5"}
```

### 5 Posts at Once

```json
{"title": "Post 1", "content": "Content for post 1", "userId": "user1"}
{"title": "Post 2", "content": "Content for post 2", "userId": "user2"}
{"title": "Post 3", "content": "Content for post 3", "userId": "user3"}
{"title": "Post 4", "content": "Content for post 4", "userId": "user4"}
{"title": "Post 5", "content": "Content for post 5", "userId": "user5"}
```

### 5 Comments at Once

```json
{"text": "Comment 1", "postId": "post1", "userId": "user1"}
{"text": "Comment 2", "postId": "post1", "userId": "user2"}
{"text": "Comment 3", "postId": "post2", "userId": "user3"}
{"text": "Comment 4", "postId": "post3", "userId": "user4"}
{"text": "Comment 5", "postId": "post4", "userId": "user5"}
```

---

## 🌐 URLs Quick Reference

| Action         | Direct URL                            | Via Gateway                           |
| -------------- | ------------------------------------- | ------------------------------------- |
| Create User    | `POST http://localhost:5000/users`    | `POST http://localhost:6000/users`    |
| Create Post    | `POST http://localhost:5001/posts`    | `POST http://localhost:6000/posts`    |
| Create Comment | `POST http://localhost:5002/comments` | `POST http://localhost:6000/comments` |
| Get Users      | `GET http://localhost:5000/users`     | `GET http://localhost:6000/users`     |
| Get Posts      | `GET http://localhost:5001/posts`     | `GET http://localhost:6000/posts`     |
| Get Comments   | `GET http://localhost:5002/comments`  | `GET http://localhost:6000/comments`  |

---

**💡 Tip**: Always set `Content-Type: application/json` header for POST/PUT requests!
