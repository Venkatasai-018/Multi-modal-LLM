# Multi-modal LLM RAG System - Architecture Documentation

## 🏗️ Complete System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A1[React App<br/>Port 3000]
        A2[HTML Frontend<br/>frontend/index.html]
        A3[Test Frontend<br/>test_frontend.html]
    end

    subgraph "API Layer - FastAPI"
        B1[Main API Server<br/>Port 8000]
        B2[CORS Middleware]
        B3[Upload Endpoint<br/>/upload]
        B4[Query Endpoint<br/>/query]
        B5[History Endpoint<br/>/history]
        B6[Stats Endpoint<br/>/stats]
    end

    subgraph "Orchestration Layer"
        C1[Agent Orchestrator]
        C2[PDF Agent]
        C3[DOCX Agent]
        C4[Image Agent]
        C5[Audio Agent]
    end

    subgraph "Processing Layer"
        D1[Content Extraction]
        D2[Text Chunking<br/>Split by paragraphs]
        D3[Metadata Creation<br/>file path, type, timestamp]
    end

    subgraph "Embedding & Storage"
        E1[Embedding Model<br/>all-MiniLM-L6-v2<br/>384 dimensions]
        E2[Vector Store<br/>FAISS Index]
        E3[Document Metadata<br/>JSON storage]
    end

    subgraph "RAG Pipeline"
        F1[Vector Search<br/>Top-K retrieval]
        F2[Context Builder<br/>600 chars limit]
        F3[LLM Generator<br/>Qwen2.5-0.5B<br/>1GB model]
        F4[Response Formatter]
    end

    subgraph "Logging & Analytics"
        G1[Query Logger<br/>logs/queries.jsonl]
        G2[Stats Calculator<br/>document & query count]
    end

    subgraph "Storage"
        H1[Upload Directory<br/>uploads/]
        H2[Vector Database<br/>vector_store.faiss]
        H3[Logs Directory<br/>logs/]
    end

    A1 --> B2
    A2 --> B2
    A3 --> B2
    B2 --> B1
    
    B1 --> B3
    B1 --> B4
    B1 --> B5
    B1 --> B6
    
    B3 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5
    
    C2 --> D1
    C3 --> D1
    C4 --> D1
    C5 --> D1
    
    D1 --> D2
    D2 --> D3
    D3 --> E1
    E1 --> E2
    E2 --> E3
    
    B4 --> F1
    F1 --> E2
    E2 --> F2
    F2 --> F3
    F3 --> F4
    
    F1 --> G1
    F4 --> G1
    G1 --> G2
    
    B3 --> H1
    E2 --> H2
    G1 --> H3
    
    B5 --> G1
    B6 --> G2
```

---

## 📊 Data Flow Diagrams

### 1. Document Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as FastAPI
    participant O as Orchestrator
    participant A as Agent
    participant V as Vector Store
    participant S as Storage

    U->>F: Select/Drop Files
    F->>F: Validate Files
    loop For Each File
        F->>API: POST /upload
        API->>S: Save File
        API->>O: Process File
        O->>A: Route to Agent
        A->>A: Extract Content
        A->>A: Split into Chunks
        A->>V: Create Embeddings
        V->>V: Store in FAISS
        V->>API: Return Success
        API->>F: Upload Status
        F->>U: Show Progress
    end
```

### 2. Query Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as FastAPI
    participant RAG as RAG Pipeline
    participant V as Vector Store
    participant LLM as Qwen Model
    participant L as Logger

    U->>F: Enter Question
    F->>API: POST /query
    API->>RAG: Process Query
    RAG->>V: Search Similar Docs
    V->>RAG: Return Top-K Results
    RAG->>RAG: Build Context (600 chars)
    RAG->>LLM: Generate Answer
    LLM->>RAG: Return Response
    RAG->>L: Log Query
    RAG->>API: Format Response
    API->>F: Return Answer + Sources
    F->>U: Display Results
```

---

## 🔧 Component Architecture

### Backend Components

```
backend/
├── main.py                    # FastAPI Application
│   ├── CORS Configuration
│   ├── API Endpoints
│   └── Error Handling
│
├── config.py                  # Configuration Management
│   ├── Model Paths
│   ├── API Settings (Port 8000)
│   └── Directory Paths
│
├── agents/
│   ├── orchestrator.py       # File Router
│   ├── pdf_agent.py          # PDF Processing
│   ├── docx_agent.py         # DOCX Processing
│   ├── image_agent.py        # Image OCR/Description
│   └── audio_agent.py        # Audio Transcription
│
└── utils/
    ├── rag_pipeline.py       # RAG Query Engine
    ├── vector_store.py       # FAISS Wrapper
    └── logger.py             # Query Logging
```

### Frontend Components

```
frontend-react/
└── src/
    ├── App.js                # Main Component
    │   ├── State Management
    │   ├── API Integration
    │   ├── File Upload Handler
    │   ├── Query Handler
    │   └── UI Rendering
    │
    └── App.css               # Styling
        ├── Upload Zone
        ├── Progress Tracking
        ├── Stats Display
        └── History View
```

---

## 🔄 Processing Pipeline Architecture

### Multi-modal File Processing

```mermaid
graph LR
    A[File Upload] --> B{File Type?}
    B -->|.pdf| C[PDF Agent]
    B -->|.docx| D[DOCX Agent]
    B -->|.png/.jpg| E[Image Agent]
    B -->|.mp3/.wav| F[Audio Agent]
    
    C --> G[Extract Text]
    D --> G
    E --> H[OCR/Vision API]
    F --> I[Transcribe Audio]
    
    H --> G
    I --> G
    
    G --> J[Split into Chunks]
    J --> K[Generate Embeddings<br/>all-MiniLM-L6-v2]
    K --> L[Store in FAISS]
```

### RAG Query Pipeline

```mermaid
graph TB
    A[User Query] --> B[Embed Query<br/>all-MiniLM-L6-v2]
    B --> C[Vector Search<br/>FAISS Similarity]
    C --> D[Retrieve Top-4 Chunks]
    D --> E[Build Context<br/>Max 600 chars]
    E --> F[Create Prompt<br/>with Context]
    F --> G[LLM Generation<br/>Qwen2.5-0.5B]
    G --> H[Format Response]
    H --> I[Log Query]
    I --> J[Return Answer + Sources]
```

---

## 🗄️ Data Storage Architecture

### Vector Database Structure

```
FAISS Index
├── Embeddings (384-dim vectors)
├── Document IDs
└── Metadata
    ├── file_path
    ├── type (pdf/docx/image/audio)
    ├── chunk_id
    └── timestamp
```

### File System Structure

```
Multi-modal-LLM/
├── uploads/              # Uploaded files
│   ├── document1.pdf
│   ├── document2.docx
│   ├── image1.png
│   └── audio1.mp3
│
├── logs/                 # Query logs
│   └── queries.jsonl
│
└── vector_store.faiss    # FAISS index
```

---

## 🌐 API Architecture

### Endpoints Overview

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/` | GET | Health Check | None | Status info |
| `/upload` | POST | Upload file | multipart/form-data | Upload status |
| `/query` | POST | Ask question | JSON with question | Answer + sources |
| `/history` | GET | Get query history | None | List of queries |
| `/stats` | GET | Get statistics | None | Doc/query counts |

### Request/Response Models

```python
# Upload Response
{
    "status": "success",
    "filename": "document.pdf",
    "type": "pdf",
    "chunks_created": 15,
    "message": "✅ Successfully processed"
}

# Query Request
{
    "question": "What is ...?",
    "top_k": 4
}

# Query Response
{
    "question": "What is ...?",
    "answer": "According to the documents...",
    "sources": [
        {
            "content": "...",
            "metadata": {...},
            "score": 0.85
        }
    ],
    "processing_time": 2.5
}

# Stats Response
{
    "total_documents": 10,
    "total_queries": 25,
    "last_updated": "2025-12-19T..."
}

# History Response
{
    "history": [
        {
            "question": "...",
            "answer": "...",
            "timestamp": "..."
        }
    ],
    "total": 25
}
```

---

## 🚀 Deployment Architecture

### Local Development Setup

```
Port 8000  ←→  Backend (FastAPI + Uvicorn)
Port 3000  ←→  React Development Server
```

### Production Architecture (Recommended)

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx/Apache]
    end
    
    subgraph "Frontend Servers"
        F1[React Build<br/>Static Files]
        F2[React Build<br/>Static Files]
    end
    
    subgraph "Backend Servers"
        B1[FastAPI Instance 1]
        B2[FastAPI Instance 2]
    end
    
    subgraph "Data Layer"
        V[Shared Vector Store<br/>FAISS + Redis]
        S[Shared File Storage<br/>S3/NFS]
        L[Centralized Logging<br/>ELK Stack]
    end
    
    LB --> F1
    LB --> F2
    F1 --> B1
    F1 --> B2
    F2 --> B1
    F2 --> B2
    
    B1 --> V
    B2 --> V
    B1 --> S
    B2 --> S
    B1 --> L
    B2 --> L
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    A[User Request] --> B[CORS Validation]
    B --> C[File Type Validation]
    C --> D[File Size Check]
    D --> E[Sanitize Filename]
    E --> F[Process Request]
    F --> G[Rate Limiting]
    G --> H[Response]
```

### Security Features

1. **CORS Configuration**: Allow specific origins only
2. **File Validation**: Accept only PDF, DOCX, Images, Audio
3. **File Size Limits**: Prevent DoS attacks
4. **Filename Sanitization**: Prevent path traversal
5. **Input Validation**: Validate all user inputs
6. **Error Handling**: No sensitive data in errors

---

## ⚡ Performance Architecture

### Optimization Strategies

```mermaid
graph LR
    A[Request] --> B[Cache Check]
    B -->|Hit| C[Return Cached]
    B -->|Miss| D[Process]
    D --> E[Store in Cache]
    E --> F[Return Result]
    C --> F
```

### Current Optimizations

| Component | Optimization | Benefit |
|-----------|--------------|---------|
| Model | Qwen2.5-0.5B (1GB) | Fast CPU inference |
| Embeddings | all-MiniLM-L6-v2 | Lightweight, 384-dim |
| Context | 600 char limit | Faster generation |
| Top-K | 4 sources | Balanced accuracy/speed |
| Max Tokens | 200 | Quick responses |
| Temperature | 0.7 | Good quality |
| Decoding | Greedy (do_sample=False) | Deterministic |

---

## 📈 Monitoring Architecture

### Metrics Tracked

1. **Upload Metrics**
   - Files uploaded per type
   - Chunks created per file
   - Processing time per file
   - Success/failure rates

2. **Query Metrics**
   - Queries per minute
   - Average response time
   - Vector search time
   - LLM generation time
   - Cache hit rate

3. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk space
   - API response time

### Logging Structure

```json
// Query Log Entry
{
    "timestamp": "2025-12-19T10:30:00",
    "question": "What is...?",
    "answer": "According to...",
    "sources_count": 4,
    "processing_time": 2.5,
    "success": true
}
```

---

## 🧩 Technology Stack

### Backend Stack
- **Framework**: FastAPI 0.100+
- **Server**: Uvicorn
- **LLM**: Qwen2.5-0.5B-Instruct (1GB)
- **Embeddings**: all-MiniLM-L6-v2 (sentence-transformers)
- **Vector DB**: FAISS
- **File Processing**: PyPDF2, python-docx, PIL, speech_recognition
- **ML Libraries**: transformers, torch

### Frontend Stack
- **Framework**: React 18.2.0
- **Build Tool**: react-scripts 5.0.1
- **Styling**: CSS3 with animations
- **HTTP Client**: Fetch API with CORS

### Infrastructure
- **Python**: 3.8+
- **Node.js**: 16+ (for React)
- **OS**: Cross-platform (Windows/Linux/Mac)

---

## 🔮 Extension Points

### Future Architecture Enhancements

1. **Caching Layer**
   ```
   Redis Cache → Reduce duplicate queries
   ```

2. **Authentication**
   ```
   JWT Tokens → Secure API access
   ```

3. **Database Layer**
   ```
   PostgreSQL → Store user data, documents metadata
   ```

4. **Message Queue**
   ```
   RabbitMQ/Celery → Async file processing
   ```

5. **Microservices**
   ```
   Separate services for:
   - File processing
   - Vector search
   - LLM inference
   ```

6. **API Gateway**
   ```
   Kong/AWS API Gateway → Centralized routing, auth, rate limiting
   ```

---

## 📝 Configuration Architecture

### Environment Variables

```bash
# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# Model Configuration
MODEL_PATH=Qwen/Qwen2.5-0.5B-Instruct
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Generation Parameters
MAX_TOKENS=200
TEMPERATURE=0.7
TOP_K_SOURCES=4
MAX_CONTEXT_LENGTH=600

# Storage Paths
UPLOAD_DIR=./uploads
VECTOR_DB_PATH=./vector_store.faiss
LOGS_DIR=./logs
```

---

## 🎯 Summary

This architecture provides:
- ✅ **Scalable**: Easy to add new agents/features
- ✅ **Modular**: Clear separation of concerns
- ✅ **Performant**: Optimized for CPU inference
- ✅ **Maintainable**: Well-organized codebase
- ✅ **Extensible**: Multiple extension points
- ✅ **User-friendly**: Multiple frontend options
- ✅ **Production-ready**: Proper logging, error handling, CORS

Use this as a reference to create specific diagrams for:
- Deployment diagrams
- Component diagrams
- Sequence diagrams
- Class diagrams
- Database schemas
- Network architecture
