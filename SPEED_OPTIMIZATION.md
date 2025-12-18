# ⚡ Speed Optimization Guide

## Why is the response slow (1-2 minutes)?

### Main Reasons:
1. **First-time model loading** - Downloads Qwen2.5-0.5B model (~500MB) on first run
2. **CPU inference** - AI model runs on CPU (no GPU acceleration)
3. **Text generation** - Small models are slower at generating answers
4. **Embedding creation** - Converting text to vectors takes time

---

## ✅ Optimizations Applied:

### Backend (rag_pipeline.py):
- ✅ Reduced context from 500 → 300 characters per source
- ✅ Using only top 3 results instead of top 5
- ✅ Reduced max tokens from 256 → 150
- ✅ Disabled beam search (faster greedy decoding)
- ✅ Set `do_sample=False` for speed
- ✅ Added prompt truncation to 1024 tokens

### Backend (main.py):
- ✅ Split documents into smaller 500-char chunks
- ✅ Better chunking strategy for faster indexing

### Frontend (QueryInterface.js):
- ✅ Added loading warning for first query
- ✅ Reduced `top_k` from 5 → 3
- ✅ Added processing time display

---

## 🚀 Further Speed Improvements:

### Option 1: Use smaller model (FASTEST)
```bash
# In backend/utils/rag_pipeline.py, change model to:
MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"  # Faster than Qwen
```

### Option 2: GPU acceleration (if you have GPU)
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
# Change device_map in rag_pipeline.py from "cpu" to "cuda"
```

### Option 3: Reduce max tokens even more
```python
# In backend/utils/rag_pipeline.py:
max_new_tokens=min(self.max_tokens, 100),  # Even shorter answers
```

### Option 4: Cache model in memory
The model stays loaded after first query, so:
- **First query**: 60-120 seconds (model loading)
- **Subsequent queries**: 5-15 seconds (much faster!)

---

## ⏱️ Expected Response Times:

| Scenario | Time |
|----------|------|
| First query (cold start) | 60-120s |
| Subsequent queries | 5-20s |
| With GPU | 2-5s |
| With TinyLlama | 30-60s first, 3-10s after |

---

## 💡 Tips:
1. **Keep backend running** - Don't restart between queries
2. **Upload once** - Files stay indexed
3. **Wait for "Model loaded"** message in backend terminal
4. **Shorter questions** = faster responses
5. **Use PDF/DOCX** - Image OCR and audio transcription add 10-30s extra

---

## 🔍 Monitor Performance:
Check backend terminal for:
```
✅ Qwen2.5-0.5B loaded successfully!
Processing query...
Retrieved 3 relevant documents
Generated answer in 8.2s
```
