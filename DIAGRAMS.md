# Multi-modal LLM RAG System - Architecture Diagrams

## 📋 Table of Contents
1. [System Overview Architecture](#1-system-overview-architecture)
2. [Component Interaction Diagram](#2-component-interaction-diagram)
3. [Data Flow Diagram](#3-data-flow-diagram)
4. [Agent Processing Pipeline](#4-agent-processing-pipeline)
5. [RAG Pipeline Architecture](#5-rag-pipeline-architecture)
6. [Authentication & Security Flow](#6-authentication--security-flow)
7. [Database Schema](#7-database-schema)
8. [Deployment Architecture](#8-deployment-architecture)
9. [File Processing Workflow](#9-file-processing-workflow)
10. [Vector Store Architecture](#10-vector-store-architecture)

---

## 1. System Overview Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Port 3000]
        B[HTML Dashboard]
        C[Landing Page]
    end
    
    subgraph "API Gateway"
        D[FastAPI Server<br/>Port 8000]
        E[CORS Middleware]
        F[Auth Middleware]
    end
    
    subgraph "Business Logic"
        G[Agent Orchestrator]
        H[RAG Pipeline]
        I[Vector Store Manager]
        J[Query Logger]
    end
    
    subgraph "Data Agents"
        K[PDF Agent]
        L[DOCX Agent]
        M[Image Agent<br/>Tesseract OCR]
        N[Audio Agent<br/>Whisper]
    end
    
    subgraph "AI/ML Layer"
        O[Embedding Model<br/>all-MiniLM-L6-v2<br/>384 dims]
        P[LLM Generator<br/>Qwen2.5-0.5B<br/>1GB model]
        Q[FAISS Vector DB]
    end
    
    subgraph "Storage Layer"
        R[(SQLite DB<br/>Users & Auth)]
        S[File Storage<br/>uploads/]
        T[Logs<br/>JSON Lines]
    end
    
    A --> E
    B --> E
    C --> E
    E --> D
    D --> F
    F --> G
    F --> H
    
    G --> K
    G --> L
    G --> M
    G --> N
    
    K --> O
    L --> O
    M --> O
    N --> O
    
    H --> I
    I --> Q
    H --> P
    H --> J
    
    O --> Q
    
    G --> S
    D --> R
    J --> T
    
    style A fill:#e1f5ff
    style D fill:#fff4e1
    style G fill:#ffe1f5
    style O fill:#e1ffe1
    style P fill:#e1ffe1
    style Q fill:#ffe1e1
```

---

## 2. Component Interaction Diagram

```mermaid
sequenceDiagram
    participant U as User/Frontend
    participant API as FastAPI Server
    participant Auth as Auth System
    participant Orch as Orchestrator
    participant Agent as File Agents
    participant Embed as Embedding Model
    participant VS as Vector Store
    participant RAG as RAG Pipeline
    participant LLM as Qwen2.5 LLM
    participant DB as Database
    
    Note over U,DB: File Upload Flow
    U->>API: POST /upload (files)
    API->>Auth: Verify Token
    Auth-->>API: Token Valid
    API->>Orch: process_files()
    
    loop For each file
        Orch->>Agent: process(file_path)
        Agent->>Agent: Extract content
        Agent-->>Orch: {text, metadata}
    end
    
    Orch->>Embed: encode(text)
    Embed-->>Orch: embeddings[384]
    Orch->>VS: add_documents()
    VS->>DB: save metadata
    VS-->>API: success
    API-->>U: {status: uploaded}
    
    Note over U,DB: Query Flow
    U->>API: POST /query (question)
    API->>Auth: Verify Token
    Auth-->>API: Token Valid
    API->>RAG: query(question, top_k=5)
    RAG->>VS: search_similar(question)
    VS->>Embed: encode(question)
    Embed-->>VS: query_embedding[384]
    VS->>VS: FAISS similarity search
    VS-->>RAG: top_k documents
    
    RAG->>RAG: build_context(docs)
    RAG->>LLM: generate(prompt + context)
    LLM-->>RAG: answer text
    RAG->>DB: log_query()
    RAG-->>API: {answer, sources}
    API-->>U: Display answer
```

---

## 3. Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input
        A1[PDF Files]
        A2[DOCX Files]
        A3[Images]
        A4[Audio Files]
    end
    
    subgraph Extraction
        B1[PyPDF2<br/>Text Extraction]
        B2[python-docx<br/>Text Extraction]
        B3[Tesseract OCR<br/>Image to Text]
        B4[Whisper<br/>Speech to Text]
    end
    
    subgraph Preprocessing
        C1[Text Chunking<br/>Paragraph Split]
        C2[Metadata Creation<br/>file, type, timestamp]
        C3[Text Normalization]
    end
    
    subgraph Embedding
        D1[Sentence Transformer<br/>all-MiniLM-L6-v2]
        D2[Vector Conversion<br/>384 dimensions]
    end
    
    subgraph Storage
        E1[FAISS Index<br/>Similarity Search]
        E2[Document Store<br/>Original Text]
        E3[Metadata Store<br/>JSON]
    end
    
    subgraph Query
        F1[User Question]
        F2[Question Embedding]
        F3[Vector Search<br/>Cosine Similarity]
        F4[Top-K Retrieval]
    end
    
    subgraph Generation
        G1[Context Builder<br/>600 char limit]
        G2[Prompt Template]
        G3[Qwen2.5-0.5B LLM]
        G4[Response Formatting]
    end
    
    subgraph Output
        H1[Answer Text]
        H2[Source Citations]
        H3[Confidence Score]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    
    B1 --> C1
    B2 --> C1
    B3 --> C1
    B4 --> C1
    
    C1 --> C2
    C2 --> C3
    C3 --> D1
    D1 --> D2
    D2 --> E1
    D2 --> E2
    C2 --> E3
    
    F1 --> F2
    F2 --> F3
    E1 --> F3
    F3 --> F4
    
    F4 --> G1
    E2 --> G1
    G1 --> G2
    G2 --> G3
    G3 --> G4
    
    G4 --> H1
    E3 --> H2
    F4 --> H3
    
    style D1 fill:#90EE90
    style E1 fill:#FFB6C1
    style G3 fill:#87CEEB
```

---

## 4. Agent Processing Pipeline

```mermaid
graph TD
    Start([File Upload]) --> Router{File Type?}
    
    Router -->|.pdf| PDF[PDF Agent]
    Router -->|.docx/.doc| DOCX[DOCX Agent]
    Router -->|.png/.jpg| IMG[Image Agent]
    Router -->|.mp3/.wav| AUD[Audio Agent]
    
    PDF --> PDF1[PyPDF2<br/>Extract Text]
    PDF1 --> PDF2[Split Pages]
    PDF2 --> Merge
    
    DOCX --> DOCX1[python-docx<br/>Read Document]
    DOCX1 --> DOCX2[Extract Paragraphs]
    DOCX2 --> DOCX3[Preserve Formatting]
    DOCX3 --> Merge
    
    IMG --> IMG1[Tesseract OCR<br/>Image Preprocessing]
    IMG1 --> IMG2[Text Recognition]
    IMG2 --> IMG3[Confidence Check]
    IMG3 --> Merge
    
    AUD --> AUD1[Load Audio File]
    AUD1 --> AUD2[Whisper Model<br/>Speech Recognition]
    AUD2 --> AUD3[Transcription]
    AUD3 --> Merge
    
    Merge[Merge Results] --> Meta[Add Metadata<br/>filename, type, timestamp]
    Meta --> Chunk[Chunk Text<br/>By Paragraphs]
    Chunk --> Embed[Generate Embeddings<br/>384d vectors]
    Embed --> Store[Store in Vector DB]
    Store --> End([Processing Complete])
    
    style PDF fill:#FFE5E5
    style DOCX fill:#E5F5FF
    style IMG fill:#FFE5FF
    style AUD fill:#FFFFE5
    style Embed fill:#E5FFE5
    style Store fill:#FFE5D5
```

---

## 5. RAG Pipeline Architecture

```mermaid
graph TB
    subgraph "Input Phase"
        A[User Query] --> B[Query Preprocessing]
        B --> C[Generate Query Embedding<br/>384 dimensions]
    end
    
    subgraph "Retrieval Phase"
        C --> D[FAISS Vector Search]
        D --> E{Search Algorithm}
        E -->|L2 Distance| F[Calculate Similarity]
        E -->|Cosine Similarity| F
        F --> G[Rank Documents]
        G --> H[Top-K Selection<br/>k=5 default]
    end
    
    subgraph "Context Building"
        H --> I[Retrieve Document Text]
        I --> J[Context Aggregation<br/>max 600 chars]
        J --> K{Context Valid?}
        K -->|No| L[Use Fallback]
        K -->|Yes| M[Build Prompt]
    end
    
    subgraph "Generation Phase"
        M --> N[Prompt Template<br/>System + User + Context]
        N --> O[Qwen2.5-0.5B LLM]
        O --> P[Token Generation<br/>max 512 tokens]
        P --> Q[Temperature 0.7<br/>Controlled Randomness]
    end
    
    subgraph "Post Processing"
        Q --> R[Response Formatting]
        R --> S[Add Source Citations]
        S --> T[Calculate Confidence]
        T --> U[Log Query & Response]
    end
    
    subgraph "Output"
        U --> V[Final Answer]
        U --> W[Source Documents]
        U --> X[Metadata]
    end
    
    L --> M
    
    style C fill:#FFE5E5
    style D fill:#E5FFE5
    style O fill:#E5E5FF
    style V fill:#FFE5FF
```

---

## 6. Authentication & Security Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Server
    participant Auth as Auth Module
    participant DB as SQLite DB
    participant Hash as Bcrypt
    
    Note over U,Hash: Signup Flow
    U->>FE: Enter credentials
    FE->>API: POST /signup
    API->>Auth: create_user(username, password)
    Auth->>Hash: hash_password(password)
    Hash-->>Auth: password_hash
    Auth->>DB: INSERT user
    DB-->>Auth: user_id
    Auth->>Auth: generate_token(user_id)
    Auth-->>API: token
    API-->>FE: {token, user_id}
    FE->>FE: Store in localStorage
    
    Note over U,Hash: Login Flow
    U->>FE: Enter credentials
    FE->>API: POST /login
    API->>Auth: verify_user(username, password)
    Auth->>DB: SELECT user WHERE username
    DB-->>Auth: user_record
    Auth->>Hash: verify_password(input, stored_hash)
    Hash-->>Auth: valid=True
    Auth->>Auth: generate_token(user_id)
    Auth-->>API: {token, user_data}
    API-->>FE: {token, username}
    
    Note over U,Hash: Protected Request Flow
    U->>FE: Upload file / Query
    FE->>API: POST /upload<br/>Header: Authorization: Bearer <token>
    API->>Auth: verify_token(token)
    Auth->>Auth: decode & validate
    Auth-->>API: user_id
    API->>API: Process request
    API-->>FE: Response
    
    Note over U,Hash: Invalid Token
    FE->>API: Request with bad token
    API->>Auth: verify_token(bad_token)
    Auth-->>API: None (invalid)
    API-->>FE: 401 Unauthorized
    FE->>FE: Redirect to login
```

---

## 7. Database Schema

```mermaid
erDiagram
    USERS ||--o{ ACTIVITY_LOGS : has
    USERS ||--o{ DOCUMENTS : owns
    DOCUMENTS ||--o{ VECTORS : embedded_as
    USERS ||--o{ QUERIES : performs
    
    USERS {
        int id PK
        string username UK
        string password_hash
        string email
        datetime created_at
        datetime last_login
    }
    
    DOCUMENTS {
        int id PK
        int user_id FK
        string filename
        string file_type
        string file_path
        int file_size
        datetime uploaded_at
        string status
    }
    
    VECTORS {
        int id PK
        int document_id FK
        blob embedding
        string text_chunk
        int chunk_index
        json metadata
    }
    
    ACTIVITY_LOGS {
        int id PK
        int user_id FK
        string action
        string resource
        datetime timestamp
        json details
    }
    
    QUERIES {
        int id PK
        int user_id FK
        string question
        string answer
        float response_time
        int documents_retrieved
        datetime timestamp
    }
```

---

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph "Local Development"
        A[Developer Machine<br/>Windows/Linux/Mac]
        B[Python 3.8+ venv]
        C[Node.js for React]
        D[Tesseract OCR]
    end
    
    subgraph "Backend Services"
        E[FastAPI Server<br/>uvicorn :8000]
        F[SQLite Database<br/>rag_system.db]
        G[File System Storage<br/>uploads/]
        H[FAISS Index<br/>vector_store.faiss]
    end
    
    subgraph "Frontend Services"
        I[React Dev Server<br/>:3000]
        J[Static HTML<br/>dashboard.html]
    end
    
    subgraph "ML Models"
        K[Sentence Transformers<br/>~400MB]
        L[Qwen2.5-0.5B<br/>~1GB]
        M[Whisper Base<br/>~500MB]
    end
    
    subgraph "Production Deployment"
        N[Nginx Reverse Proxy<br/>:80/:443]
        O[Gunicorn + Uvicorn<br/>Workers: 4]
        P[React Build<br/>Static Files]
        Q[SSL/TLS Certificates]
    end
    
    A --> B
    B --> E
    A --> C
    C --> I
    A --> D
    
    E --> F
    E --> G
    E --> H
    E --> K
    E --> L
    E --> M
    
    I --> E
    J --> E
    
    N --> O
    N --> P
    O --> E
    N --> Q
    
    style E fill:#FFE5E5
    style I fill:#E5F5FF
    style K fill:#E5FFE5
    style L fill:#E5FFE5
    style N fill:#FFE5FF
```

---

## 9. File Processing Workflow

```mermaid
stateDiagram-v2
    [*] --> UploadInitiated
    UploadInitiated --> FileValidation
    
    FileValidation --> TypeCheck
    TypeCheck --> Supported: Valid Type
    TypeCheck --> Rejected: Invalid Type
    
    Supported --> SaveToDisk
    SaveToDisk --> ScheduleProcessing
    
    ScheduleProcessing --> PDFProcessing: .pdf
    ScheduleProcessing --> DOCXProcessing: .docx
    ScheduleProcessing --> ImageProcessing: .png/.jpg
    ScheduleProcessing --> AudioProcessing: .mp3/.wav
    
    PDFProcessing --> TextExtraction
    DOCXProcessing --> TextExtraction
    ImageProcessing --> OCRProcessing
    AudioProcessing --> SpeechRecognition
    
    OCRProcessing --> TextExtraction
    SpeechRecognition --> TextExtraction
    
    TextExtraction --> TextChunking
    TextChunking --> MetadataCreation
    MetadataCreation --> EmbeddingGeneration
    
    EmbeddingGeneration --> VectorStoreUpdate
    VectorStoreUpdate --> DatabaseUpdate
    DatabaseUpdate --> ProcessingComplete
    
    Rejected --> [*]
    ProcessingComplete --> [*]
    
    note right of FileValidation
        Max size: 100MB
        Allowed types: pdf, docx, 
        png, jpg, mp3, wav
    end note
    
    note right of EmbeddingGeneration
        Model: all-MiniLM-L6-v2
        Dimensions: 384
        Batch size: 32
    end note
```

---

## 10. Vector Store Architecture

```mermaid
graph TB
    subgraph "Document Input"
        A[Raw Documents] --> B[Text Chunks]
        B --> C[Chunk Metadata]
    end
    
    subgraph "Embedding Layer"
        D[Sentence Transformer<br/>all-MiniLM-L6-v2]
        E[Tokenizer<br/>512 max tokens]
        F[Neural Network<br/>6 layers]
        G[Mean Pooling]
    end
    
    subgraph "FAISS Index"
        H[Index Factory]
        I{Index Type}
        I -->|Small < 1M| J[FlatL2<br/>Exact Search]
        I -->|Large > 1M| K[IVF<br/>Approximate Search]
        L[Vector Storage<br/>float32 arrays]
        M[ID Mapping]
    end
    
    subgraph "Search Operations"
        N[Query Vector<br/>384 dimensions]
        O[Similarity Calculation<br/>L2 / Cosine]
        P[Top-K Selection]
        Q[Distance Scores]
    end
    
    subgraph "Metadata Store"
        R[Document Text<br/>Original content]
        S[Source Information<br/>file, page, timestamp]
        T[Index Mapping<br/>vector_id → doc_id]
    end
    
    B --> E
    E --> F
    F --> G
    G --> D
    D --> H
    
    H --> I
    J --> L
    K --> L
    L --> M
    C --> T
    
    N --> O
    L --> O
    O --> P
    P --> Q
    
    M --> T
    T --> R
    T --> S
    
    style D fill:#90EE90
    style L fill:#FFB6C1
    style O fill:#87CEEB
    style R fill:#FFFFE0
```

---

## 📊 Diagram Legend

### Colors & Shapes
- **Blue boxes**: Frontend components
- **Yellow boxes**: API/Backend services
- **Pink boxes**: Processing logic
- **Green boxes**: AI/ML models
- **Red boxes**: Storage systems
- **Diamonds**: Decision points
- **Circles**: Start/End states

### Arrow Types
- **Solid arrows**: Data flow
- **Dashed arrows**: Control flow
- **Thick arrows**: Primary path
- **Thin arrows**: Secondary path

---

## 🔧 How to Use These Diagrams

### For Developers
1. Start with **System Overview** for high-level understanding
2. Use **Component Interaction** for API integration
3. Reference **Data Flow** for debugging pipelines
4. Check **Agent Processing** for file handling logic

### For System Architects
1. Review **Deployment Architecture** for infrastructure planning
2. Study **Database Schema** for data modeling
3. Examine **Vector Store Architecture** for scalability
4. Analyze **RAG Pipeline** for optimization opportunities

### For Stakeholders
1. Begin with **System Overview** for business understanding
2. Review **Authentication Flow** for security posture
3. Check **File Processing Workflow** for feature capabilities
4. Use **Deployment Architecture** for cost estimation

---

## 📝 Diagram Maintenance

**Last Updated**: January 19, 2026
**Diagram Format**: Mermaid.js (Markdown-compatible)
**Rendering**: GitHub, GitLab, VS Code (with plugins)

**To update diagrams**:
1. Edit the Mermaid syntax in this file
2. Test rendering using [Mermaid Live Editor](https://mermaid.live/)
3. Update the "Last Updated" date
4. Commit changes with descriptive message

---

## 🌐 External Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [FAISS Documentation](https://faiss.ai/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Sentence Transformers](https://www.sbert.net/)
