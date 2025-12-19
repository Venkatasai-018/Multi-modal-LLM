# 🐛 React Frontend Debugging Guide

## Problem: Questions and Answers Not Displaying

### ✅ What I Fixed:

1. **Added Console Logging** - All components now log data to browser console
2. **Better Error Handling** - Components check for null/undefined data
3. **Debug Tools Created**:
   - `test_frontend.html` - Simple HTML page to test backend
   - `test_backend_api.py` - Python script to test API endpoints

---

## 🔍 Step-by-Step Debugging:

### **Step 1: Test Backend is Running**

Open terminal and run:
```powershell
cd backend
python main.py
```

You should see:
```
Loading Qwen2.5-1.5B model...
✅ Qwen2.5-1.5B loaded successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### **Step 2: Test Backend API (Simple HTML)**

1. Open `test_frontend.html` in your browser
2. It will automatically fetch stats
3. Check the console (F12 → Console tab)
4. You should see numbers displayed

**If this works but React doesn't** → React component issue
**If this doesn't work** → Backend API issue

### **Step 3: Test Backend API (Python Script)**

```powershell
cd c:\Users\Venkatasai.Kommu\Multi-modal-LLM
python test_backend_api.py
```

This will test all endpoints and show results.

### **Step 4: Check React Console**

1. Start React app:
```powershell
cd frontend-react
npm start
```

2. Open http://localhost:3000
3. Press F12 → Console tab
4. You should see logs like:
   - `Stats fetched: {total_documents: 0, total_queries: 0}`
   - `History fetched: {history: []}`
   - `Statistics received: {total_documents: 0, total_queries: 0}`

### **Step 5: Check Network Tab**

1. Press F12 → Network tab
2. Filter by "Fetch/XHR"
3. Refresh page
4. You should see requests to:
   - `http://localhost:8000/stats` → Status 200
   - `http://localhost:8000/history` → Status 200

5. Click on each request → Preview tab → Check response format

---

## 🔧 Common Issues & Fixes:

### Issue 1: CORS Error in Console

**Error:**
```
Access to fetch at 'http://localhost:8000/stats' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Fix:** Backend should already have CORS enabled, but verify:
```python
# In backend/main.py - should already be there
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Numbers Show as 0 Even After Uploading

**Possible causes:**
1. Files not being saved to vector store
2. Stats API not counting documents correctly

**Debug:**
- Check backend terminal for errors when uploading
- Verify `data/vector_db/` folder exists and has files
- Check `logs/query_history.jsonl` file exists

### Issue 3: Answer Not Displaying After Query

**Possible causes:**
1. Response doesn't have `answer` field
2. Response format is wrong
3. Model returning mock responses

**Debug:**
- Check console: `Query response: {...}`
- Verify response has `answer`, `sources`, `processing_time` fields
- Check backend terminal for "Mock Response" warnings

### Issue 4: History Not Loading

**Possible causes:**
1. No queries have been made yet
2. Log file doesn't exist
3. Response format is wrong (should be `{history: [...]`)

**Debug:**
- Check console: `History fetched: {...}`
- Verify `logs/query_history.jsonl` file exists
- Each line should be valid JSON with `question` and `answer` fields

---

## 📊 Expected Console Output (React):

### On Page Load:
```
Stats fetched: {total_documents: 5, total_queries: 3, index_size: 5}
Statistics received: {total_documents: 5, total_queries: 3, index_size: 5}
History fetched: {history: [{question: "...", answer: "...", timestamp: "..."}]}
History received: [{question: "...", answer: "...", timestamp: "..."}]
```

### After Submitting Query:
```
Query response: {
  question: "What is AI?",
  answer: "Artificial Intelligence is...",
  sources: [{file: "doc.pdf", type: "pdf", similarity: 0.89, excerpt: "..."}],
  processing_time: 12.5
}
Setting response: {question: "...", answer: "...", sources: [...], processing_time: 12.5}
```

---

## 🎯 Quick Checks:

**Backend Running?**
```powershell
curl http://localhost:8000/
```
Should return: `{"status":"online",...}`

**Stats Endpoint Working?**
```powershell
curl http://localhost:8000/stats
```
Should return: `{"total_documents":0,"total_queries":0,"index_size":0}`

**Frontend Running?**
- Visit http://localhost:3000
- Should see "Multi-modal RAG System" header
- Should see two stat boxes with numbers (even if 0)

---

## 🚨 If Still Not Working:

1. **Clear browser cache** - Hard refresh with Ctrl+Shift+R
2. **Clear React cache**:
   ```powershell
   cd frontend-react
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force .cache
   npm install
   npm start
   ```

3. **Check browser compatibility** - Use Chrome/Edge (not IE)

4. **Check firewall** - Ensure ports 3000 and 8000 aren't blocked

5. **Restart both servers**:
   ```powershell
   # Kill all node and python processes
   Get-Process node | Stop-Process -Force
   Get-Process python | Stop-Process -Force
   
   # Restart backend
   cd backend
   python main.py
   
   # New terminal - restart frontend
   cd frontend-react
   npm start
   ```

---

## 📝 What to Send Me for Further Help:

1. Screenshot of browser console (F12 → Console)
2. Screenshot of network tab showing API calls
3. Copy of console logs showing "Stats fetched", "History fetched", etc.
4. Backend terminal output showing any errors
5. Result of running `test_backend_api.py`
