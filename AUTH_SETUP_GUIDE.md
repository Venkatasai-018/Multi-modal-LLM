# 🔐 Authentication System - Complete Setup

## ✅ What's Implemented

### Backend (FastAPI)
- **[database.py](backend/database.py)** - Complete SQLite database with:
  - Users table (username, password hash, email, timestamps)
  - Sessions table (user sessions with activity tracking)
  - Activity logs table (every user action is recorded)
  
- **[main.py](backend/main.py)** - Updated API with:
  - `POST /signup` - Create new user account
  - `POST /login` - Login and get session ID
  - `POST /logout` - End user session
  - `GET /me` - Get current user info
  - `POST /log-activity` - Log user activities
  - `GET /my-activities` - Get user's activity history
  - Protected endpoints (require X-Session-Id header):
    - `POST /upload` - Upload files (logged)
    - `POST /query` - Query RAG system (logged)

### Frontend (React)
- **[Auth.js](notebookLLM/src/Auth.js)** - Login/Signup component
  - Beautiful purple gradient UI
  - Tab-based interface
  - Form validation
  - Error handling
  
- **[App.js](notebookLLM/src/App.js)** - Main app with:
  - Authentication state management
  - Session-based authentication
  - Activity logging integration
  - User info display with logout button
  - Activity log viewer in sidebar
  - Protected API calls with auto-logout on session expiry

## 📊 What Gets Tracked

**Every user action is automatically saved to the database:**
- 🔐 Login/Logout events
- 📁 File uploads (with filename, type, chunks)
- 💬 Queries (question and answer preview)
- 👁️ Page views
- All activities include timestamp and user ID

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
python main.py
```
Server will start on `http://localhost:8000`

### 2. Start Frontend
```bash
cd notebookLLM
npm install  # First time only
npm start
```
App will open at `http://localhost:3000`

## 💻 Usage Flow

### First Time User
1. Open app at http://localhost:3000
2. Click "Sign Up" tab
3. Enter username and password (min 6 chars)
4. Email is optional
5. Click "Create Account"
6. Switch to "Login" tab
7. Enter credentials and login

### Returning User
1. Open app (auto-login if session exists)
2. Upload documents via drag & drop
3. Ask questions in chat
4. View your activity log in sidebar
5. Logout when done (👋 button)

## 🗄️ Database

Located at: `./data/users.db` (created automatically)

**Tables:**
- `users` - User accounts with hashed passwords
- `sessions` - Active user sessions
- `activity_logs` - Complete activity history per user

**View database:**
```bash
sqlite3 ./data/users.db
SELECT * FROM users;
SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 10;
```

## 🔒 Security Features

✅ Password hashing (SHA-256)  
✅ Session-based authentication  
✅ Auto-logout on session expiry  
✅ Protected API endpoints  
✅ Activity logging for audit trail  
❌ No JWT complexity (as requested)

**Note:** This is a basic auth system. For production:
- Use bcrypt/argon2 for password hashing
- Add session expiration
- Implement rate limiting
- Use HTTPS
- Add CSRF protection

## 📁 Key Files

```
backend/
  ├── database.py          # SQLite database operations
  ├── main.py             # API with auth endpoints
  └── data/
      └── users.db        # SQLite database (auto-created)

notebookLLM/src/
  ├── Auth.js             # Login/Signup UI
  ├── Auth.css            # Auth styling
  ├── App.js              # Main app with auth integration
  └── App.css             # Main app styles
```

## 🎯 API Examples

### Signup
```javascript
POST http://localhost:8000/signup
Content-Type: application/json

{
  "username": "john",
  "password": "secret123",
  "email": "john@example.com"  // optional
}
```

### Login
```javascript
POST http://localhost:8000/login
Content-Type: application/json

{
  "username": "john",
  "password": "secret123"
}

Response:
{
  "status": "success",
  "session_id": "uuid-here",
  "username": "john"
}
```

### Upload File (Authenticated)
```javascript
POST http://localhost:8000/upload
X-Session-Id: your-session-id
Content-Type: multipart/form-data

[file data]
```

### Query (Authenticated)
```javascript
POST http://localhost:8000/query
X-Session-Id: your-session-id
Content-Type: application/json

{
  "question": "What is AI?",
  "top_k": 5
}
```

### View Activities
```javascript
GET http://localhost:8000/my-activities?limit=50
X-Session-Id: your-session-id

Response:
{
  "activities": [
    {
      "activity_type": "login",
      "activity_data": {"username": "john"},
      "timestamp": "2026-01-19T10:30:00"
    },
    {
      "activity_type": "file_upload",
      "activity_data": {
        "filename": "document.pdf",
        "type": "pdf",
        "chunks": 5
      },
      "timestamp": "2026-01-19T10:31:00"
    }
  ],
  "count": 2
}
```

## 🐛 Troubleshooting

**Can't connect to backend**
- Ensure backend is running on port 8000
- Check console for errors
- Verify CORS settings

**Session expired error**
- Just login again
- Sessions are stored in localStorage
- Backend restart clears sessions

**Database errors**
- Delete `./data/users.db` to reset
- Backend will recreate on startup

## 📝 Activity Log Features

The activity log shows in the sidebar:
- 📊 Last 10 activities per user
- 🔐 Login/Logout with timestamps
- 📁 File uploads with filenames
- 💬 Queries with question preview
- 👁️ Page views
- Auto-refreshes after each action

## 🎉 Ready to Use!

Your authentication system is fully implemented and ready. All user activities are automatically tracked in the database for each session.

**Test it:** Just run the backend and frontend, create an account, and start uploading documents and asking questions. Everything you do will be logged! 📊
