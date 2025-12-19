# React App - Working Instructions

## ✅ Current Status
- All React code is clean and error-free
- App.js is a single-file component (no complex structure)
- Hardcoded to use backend at `http://localhost:8000`
- No unused dependencies or files

## 🚀 To Run

1. **Start Backend First:**
```bash
cd backend
python main.py
```
Backend will run on: `http://localhost:8000`

2. **Start React App:**
```bash
cd frontend-react
npm install   # Only first time
npm start
```
React will run on: `http://localhost:3000`

## ✅ Features Working

1. **Statistics Display** - Shows document and query counts
2. **File Upload** - Upload PDF, DOCX, images, audio
3. **Query Interface** - Ask questions and get answers with sources
4. **History** - View past queries (expandable Q&A)
5. **Auto-refresh** - Stats/history refresh every 30 seconds
6. **Connection Test** - Tests backend on startup, shows alert if down

## 📝 Files Structure

```
frontend-react/
├── public/
│   └── index.html
├── src/
│   ├── index.js       # Entry point
│   ├── index.css      # Global styles
│   ├── App.js         # Main component (ALL logic here)
│   └── App.css        # App styles
├── package.json       # Dependencies
└── README.md          # This file
```

## 🔧 Troubleshooting

**If backend data not showing:**
1. Check browser console (F12) for errors
2. Verify backend is running: http://localhost:8000/docs
3. Check console logs show: "✅ Backend connected successfully"

**If connection fails:**
- Make sure backend is on port 8000
- Check CORS is enabled in backend
- Clear browser cache and reload

## 📊 Console Logs

You should see:
```
✅ Backend connected successfully
📊 Stats: {total_documents: X, total_queries: Y}
📜 History: X items
✅ Upload success: {...}
✅ Query success: {...}
```

All systems are GO! 🎯
