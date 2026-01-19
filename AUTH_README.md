# Authentication System - Quick Start Guide

## Overview
Simple authentication system with login/signup and session tracking. All user activities are automatically logged to a SQLite database.

## Features
- ✅ Simple username/password authentication (no JWT complexity)
- ✅ Session-based authentication using session IDs
- ✅ Automatic activity logging (logins, queries, file uploads, etc.)
- ✅ User dashboard with activity history
- ✅ Beautiful, responsive UI

## Getting Started

### 1. Start the Backend Server

```bash
cd backend
python main.py
```

The server will start on `http://localhost:8000`

### 2. Open the Frontend

Open in your browser:
```
frontend/auth.html
```

### 3. Create an Account

1. Click the "Sign Up" tab
2. Enter a username and password
3. Email is optional
4. Click "Create Account"

### 4. Login

1. Enter your username and password
2. Click "Login"
3. You'll be redirected to the dashboard

## What Gets Tracked?

Every user action is automatically saved to the database:

- **Login/Logout**: When users sign in and out
- **File Uploads**: What files are uploaded and when
- **Queries**: Questions asked and responses received
- **Page Views**: Which pages are visited

## Database Schema

The system uses SQLite with three tables:

### Users Table
- id, username, password_hash, email, created_at, last_login

### Sessions Table
- id, user_id, session_id, created_at, last_activity

### Activity Logs Table
- id, user_id, session_id, activity_type, activity_data, timestamp

## API Endpoints

### Authentication
- `POST /signup` - Create new account
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user info

### Activity Tracking
- `POST /log-activity` - Log user activity
- `GET /my-activities` - Get user's activity history

### Protected Endpoints (require session)
- `POST /upload` - Upload files
- `POST /query` - Query the RAG system

All protected endpoints require `X-Session-Id` header.

## Security Notes

⚠️ **This is a simple implementation for development/demo purposes**

- Passwords are hashed with SHA-256 (use bcrypt in production)
- No JWT tokens (using simple session IDs instead)
- CORS is open to all origins
- Sessions don't expire automatically

For production use, consider:
- Using bcrypt or argon2 for password hashing
- Implementing session expiration
- Adding rate limiting
- Using HTTPS
- Restricting CORS origins
- Adding password strength requirements

## Troubleshooting

### Can't connect to server
- Make sure the backend is running on port 8000
- Check that no other service is using that port

### Session expired error
- Your session may have been deleted
- Just login again

### Database location
The database is stored at: `./data/users.db`

To reset everything, delete this file and restart the server.

## File Structure

```
backend/
  ├── main.py              # Main API with auth endpoints
  ├── database.py          # Database operations
  └── ...

frontend/
  ├── auth.html           # Login/Signup page
  └── dashboard.html      # User dashboard with activity log
```

## Example Usage

### JavaScript (Frontend)

```javascript
// Login
const response = await fetch('http://localhost:8000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'john', password: 'secret123' })
});
const data = await response.json();
const sessionId = data.session_id;

// Make authenticated request
await fetch('http://localhost:8000/query', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
    },
    body: JSON.stringify({ question: 'What is AI?' })
});
```

## Data Privacy

All user data (credentials, activities) is stored locally in SQLite database on your machine. Nothing is sent to external servers.
