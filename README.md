# 🤖 Multi-modal RAG System

A complete offline Multi-modal Retrieval-Augmented Generation (RAG) system that supports PDF, DOCX, images, and audio files with natural language querying.

## 🌟 Features

- **Multi-modal Data Ingestion**: Process PDF, DOCX, images (OCR), and audio (speech-to-text)
- **Offline Operation**: Works completely offline using local LLMs (Mistral/LLaMA)
- **RAG Architecture**: Retrieval-Augmented Generation for accurate, evidence-based answers
- **Agent-Based System**: Modular agents handle different file types
- **Vector Search**: FAISS-powered semantic search across all document types
- **Cross-Format Evidence**: Link answers to documents, images, and audio timestamps
- **Query History**: Audit logs for traceability
- **Simple UI**: Clean web interface for uploads and queries

## 🛠️ Tech Stack

- **Python** - Core programming language
- **Local LLM** - Mistral 7B / LLaMA 2 (offline text generation)
- **FAISS** - Vector database for similarity search
- **Sentence-Transformers** - Text embeddings (all-MiniLM-L6-v2)
- **Whisper** - Offline speech-to-text conversion
- **Tesseract OCR** - Text extraction from images
- **FastAPI** - Backend API server
- **Vanilla HTML/CSS/JS** - Simple frontend

## 📁 Project Structure

```
Multi-modal-LLM/
├── backend/
│   ├── agents/              # Processing agents for each file type
│   │   ├── base_agent.py    # Base agent class
│   │   ├── pdf_agent.py     # PDF processing
│   │   ├── docx_agent.py    # DOCX processing
│   │   ├── image_agent.py   # Image OCR processing
│   │   ├── audio_agent.py   # Audio transcription
│   │   └── orchestrator.py  # Agent coordination
│   ├── utils/
│   │   ├── vector_store.py  # FAISS vector database
│   │   ├── rag_pipeline.py  # RAG query processing
│   │   └── logger.py        # Query logging
│   ├── config.py            # Configuration
│   └── main.py             # FastAPI application
├── frontend/
│   └── index.html          # Web interface
├── data/                   # Created at runtime
│   ├── uploads/           # Uploaded files
│   └── vector_db/         # FAISS index
├── logs/                  # Query logs
├── models/                # LLM models (download separately)
├── requirements.txt
└── .env.example

```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.8+
- Tesseract OCR installed on your system

**Windows:**
```powershell
# Install Tesseract via chocolatey
choco install tesseract

# Or download from: https://github.com/UB-Mannheim/tesseract/wiki
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

**macOS:**
```bash
brew install tesseract
```

### 2. Installation

```powershell
# Clone or navigate to the project
cd Multi-modal-LLM

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Download Model (Optional but Recommended)

Download a quantized model for better responses:

```powershell
# Create models directory
mkdir models

# Download Mistral 7B Instruct (4-bit quantized, ~4GB)
# Visit: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF
# Download: mistral-7b-instruct-v0.1.Q4_K_M.gguf
# Place in: ./models/
```

### 4. Configuration

```powershell
# Copy example config
copy .env.example .env

# Edit .env if needed (default values work fine)
```

### 5. Run the System

```powershell
# Start backend server
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

### 6. Open Frontend

Simply open `frontend/index.html` in your web browser, or:

```powershell
# Serve with Python
cd frontend
python -m http.server 3000
```

Then visit `http://localhost:3000`

## 📖 Usage

### Upload Files
1. Open the web interface
2. Drag and drop files or click to browse
3. Supported formats: PDF, DOCX, PNG, JPG, MP3, WAV
4. Wait for processing confirmation

### Query System
1. Type your question in natural language
2. Click "Search" or press Ctrl+Enter
3. View the AI-generated answer with source citations
4. Check linked documents and similarity scores

### View History
- Recent queries appear at the bottom
- Shows timestamps, processing time, and sources used

## 🔧 API Endpoints

- `POST /upload` - Upload and process files
- `POST /query` - Ask questions (RAG)
- `GET /history` - Get query history
- `GET /stats` - System statistics
- `GET /` - Health check

## 🎯 Architecture

### Agent System
Each file type has a dedicated agent:
- **PDFAgent**: Extracts text from PDF pages
- **DOCXAgent**: Parses Word documents
- **ImageAgent**: OCR text extraction from images
- **AudioAgent**: Speech-to-text transcription
- **Orchestrator**: Routes files to appropriate agents

### RAG Pipeline
1. **Ingestion**: Files → Agents → Text chunks
2. **Embedding**: Text → Sentence-Transformers → Vectors
3. **Storage**: Vectors → FAISS index
4. **Retrieval**: Query → Top-K similar chunks
5. **Generation**: Context + Query → LLM → Answer

### Vector Store
- Uses FAISS for efficient similarity search
- Stores embeddings with metadata (file type, source, timestamps)
- Persists index to disk for offline operation

## ⚙️ Configuration Options

Edit `.env` file:

```bash
# Model paths
MODEL_PATH=./models/mistral-7b-instruct-v0.1.Q4_K_M.gguf
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Storage
UPLOAD_DIR=./data/uploads
VECTOR_DB_PATH=./data/vector_db
LOGS_DIR=./logs

# API
API_HOST=0.0.0.0
API_PORT=8000

# Generation
MAX_TOKENS=512
TEMPERATURE=0.7
TOP_K=5
```

## 🐛 Troubleshooting

### Tesseract not found
```powershell
# Windows: Add to PATH
$env:PATH += ";C:\Program Files\Tesseract-OCR"

# Or set in Python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### Whisper model download fails
```powershell
# Pre-download models
python -c "import whisper; whisper.load_model('base')"
```

### Out of memory
- Use smaller LLM model (tiny or base Whisper)
- Reduce `MAX_TOKENS` in config
- Process fewer files at once

### No model responses
- System works without LLM but gives mock responses
- Download a GGUF model and update `MODEL_PATH`

## 🔒 Privacy & Security

- **Fully Offline**: No data sent to external servers
- **Local Processing**: All AI runs on your machine
- **Data Control**: All files stored locally
- **Audit Logs**: Complete query history tracking

## 📝 Example Queries

After uploading documents:
- "What are the main topics discussed in the uploaded documents?"
- "Summarize the key findings from the PDF"
- "What did the speaker say about [topic] in the audio file?"
- "Extract information about [topic] from the images"

## 🚀 Future Enhancements

- [ ] GPU acceleration support
- [ ] Multi-language support
- [ ] Advanced chunking strategies
- [ ] Document comparison features
- [ ] Export query results
- [ ] Real-time audio processing

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Contributing

Contributions welcome! This is a simplified implementation focused on core RAG functionality.

---

**Note**: This is a simplified version for learning and prototyping. For production use, add error handling, authentication, rate limiting, and proper testing.
Multi-modal-LLM
