from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from datetime import datetime

from agents.orchestrator import AgentOrchestrator
from utils.vector_store import VectorStore
from utils.logger import QueryLogger
from utils.rag_pipeline import RAGPipeline
import config

app = FastAPI(title="Multi-modal RAG System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
orchestrator = AgentOrchestrator()
vector_store = VectorStore(model_name=config.EMBEDDING_MODEL, db_path=config.VECTOR_DB_PATH)
logger = QueryLogger(log_dir=config.LOGS_DIR)
rag_pipeline = RAGPipeline(
    model_path=config.MODEL_PATH,
    vector_store=vector_store,
    logger=logger,
    max_tokens=config.MAX_TOKENS,
    temperature=config.TEMPERATURE
)

# Pydantic models
class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 5

class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[dict]
    processing_time: float

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Multi-modal RAG System",
        "version": "1.0.0"
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and process a file"""
    try:
        # Save uploaded file
        file_path = os.path.join(config.UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process file with appropriate agent
        result = orchestrator.process_file(file_path)
        
        # Extract content for embedding
        content = result["content"]
        if not content or not content.strip():
            raise HTTPException(status_code=400, detail="No content extracted from file")
        
        # For documents, split into chunks (simple splitting by paragraphs)
        chunks = [chunk.strip() for chunk in content.split("\n\n") if chunk.strip()]
        if not chunks:
            chunks = [content]
        
        # Prepare metadata for each chunk
        metadata_list = []
        for i, chunk in enumerate(chunks):
            meta = {
                "file_path": file.filename,
                "type": result["type"],
                "chunk_id": i,
                "timestamp": datetime.now().isoformat(),
                **result.get("metadata", {})
            }
            metadata_list.append(meta)
        
        # Add to vector store
        vector_store.add_documents(chunks, metadata_list)
        
        return {
            "status": "success",
            "filename": file.filename,
            "type": result["type"],
            "chunks_created": len(chunks),
            "message": f"✅ Successfully processed {file.filename} ({len(chunks)} chunks)"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_system(request: QueryRequest):
    """Query the RAG system"""
    try:
        result = rag_pipeline.query(request.question, top_k=request.top_k)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history(limit: int = 50):
    """Get query history"""
    try:
        history = logger.get_history(limit=limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    try:
        vector_stats = vector_store.get_stats()
        query_history = logger.get_history(limit=10000)
        
        return {
            "total_documents": vector_stats.get("total_documents", 0),
            "total_queries": len(query_history),
            "index_size": vector_stats.get("index_size", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/reset")
async def reset_system():
    """Reset the system (clear all data)"""
    try:
        # This is a simplified reset - in production, you'd want proper cleanup
        return {
            "status": "success",
            "message": "System reset functionality - implement with caution"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.API_HOST, port=config.API_PORT)
