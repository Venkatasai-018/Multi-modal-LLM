# Quick Start Guide

## Backend Setup (Port 8000 - HARDCODED)

### Start Backend:
```bash
# Option 1: Double-click
start_backend.bat

# Option 2: Manual
cd backend
python main.py
```

**Backend will run on:** `http://localhost:8000`

---

## Frontend Options

### Option 1: HTML Test Page (Simplest)
1. Open `test_frontend.html` in your browser
2. Tests all API endpoints automatically
3. Shows stats, history, upload, and query

### Option 2: React App (Professional UI)
```bash
cd frontend-react
npm install
npm start
```
**React app runs on:** `http://localhost:3000`

---

## Ports (HARDCODED - DO NOT CHANGE)
- Backend API: `8000`
- React Frontend: `3000` (default)
- HTML Test: Open directly in browser

---

## API Endpoints
- `http://localhost:8000/stats` - Get statistics
- `http://localhost:8000/history` - Get query history
- `http://localhost:8000/query` - Ask questions
- `http://localhost:8000/upload` - Upload documents
- `http://localhost:8000/docs` - API documentation
