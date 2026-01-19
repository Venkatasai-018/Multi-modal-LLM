# NotebookLLM React App - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd notebookLLM
npm install
```

### 2. Start the Backend

In a separate terminal:
```bash
cd backend
python main.py
```

The backend should be running on `http://localhost:8000`

### 3. Start the React App

```bash
npm start
```

The app will open automatically at `http://localhost:3000`

## Features

### 🔐 Authentication
- **Login/Signup** - Simple username/password authentication
- **Session Management** - Automatic session handling
- **User Display** - Shows logged-in username in sidebar

### 📊 Activity Tracking
All user activities are automatically logged:
- Login/Logout events
- File uploads with filename
- Queries asked
- Page views

View your recent activities in the sidebar's "Activity Log" section.

### 📁 Document Management
- Drag & drop file upload
- Support for PDF, DOCX, images, and audio
- Track upload progress
- View uploaded documents

### 💬 Interactive Chat
- Ask questions about your documents
- Get AI-powered answers with sources
- Export chat history
- Copy questions/answers to clipboard
- Favorite important conversations

### ⚙️ Additional Features
- Dark/Light theme toggle
- Keyboard shortcuts (Ctrl+K to focus input)
- Search query history
- Document sorting options

## How It Works

1. **First Time Users**
   - Click "Sign Up" tab
   - Enter username and password
   - Click "Create Account"
   - Login with your credentials

2. **Upload Documents**
   - Drag files to the upload area, or
   - Click to browse and select files
   - Wait for processing to complete

3. **Ask Questions**
   - Type your question in the input box
   - Press Enter or click "Send"
   - View AI-generated answers with sources

4. **View Activity**
   - Check "Activity Log" section to see what you've done
   - All actions are automatically tracked in the database

## Session Management

- Sessions are stored in `localStorage`
- Automatically logs out on session expiry
- Click the 👋 button to logout manually

## API Integration

The app communicates with the backend using authenticated requests:
- All API calls include `X-Session-Id` header
- Automatic logout on 401 (unauthorized) responses
- Activity logging for all major actions

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running on port 8000
- Check console for CORS errors
- Verify `API_URL` in `src/App.js`

### Session expired
- Just login again
- Sessions may expire if backend restarts

### Files not uploading
- Check file format is supported
- Ensure backend has write permissions to upload directory
- Check backend logs for errors

## Development

### File Structure
```
notebookLLM/
  ├── src/
  │   ├── App.js          # Main app with auth
  │   ├── App.css         # Main styles
  │   ├── Auth.js         # Login/Signup component
  │   └── Auth.css        # Auth styles
  ├── public/
  │   └── index.html
  └── package.json
```

### Key Components

- **Auth.js** - Handles login and signup UI
- **App.js** - Main application with:
  - Authentication state
  - Document upload
  - Chat interface
  - Activity tracking

## Available Scripts

- `npm start` - Run development server
- `npm build` - Create production build
- `npm test` - Run tests

## Environment

- React 18.2.0
- No additional dependencies needed
- Works with existing backend API

Enjoy your intelligent document assistant! 🤖
