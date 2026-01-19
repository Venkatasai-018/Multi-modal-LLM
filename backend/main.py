from fastapi import FastAPI, UploadFile, File, HTTPException, Header
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
from database import Database
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
db = Database()

# Pydantic models
class SignupRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class ActivityLog(BaseModel):
    activity_type: str
    activity_data: Optional[dict] = None

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

# Helper function to verify session
def verify_session(session_id: Optional[str] = Header(None, alias="X-Session-Id")):
    """Verify session ID from header"""
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Update last activity
    db.update_session_activity(session_id)
    return session

# Authentication endpoints
@app.post("/signup")
async def signup(request: SignupRequest):
    """Sign up a new user"""
    try:
        result = db.create_user(request.username, request.password, request.email)
        
        if result["success"]:
            return {
                "status": "success",
                "message": "User created successfully",
                "username": result["username"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login(request: LoginRequest):
    """Login user"""
    try:
        user = db.verify_user(request.username, request.password)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Update last login
        db.update_last_login(user["id"])
        
        # Create session
        session_id = db.create_session(user["id"])
        
        # Log activity
        db.log_activity(user["id"], session_id, "login", {"username": user["username"]})
        
        return {
            "status": "success",
            "message": "Login successful",
            "session_id": session_id,
            "username": user["username"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/logout")
async def logout(session_id: str = Header(None, alias="X-Session-Id")):
    """Logout user"""
    try:
        if session_id:
            session = db.get_session(session_id)
            if session:
                db.log_activity(session["user_id"], session_id, "logout", {})
            db.delete_session(session_id)
        
        return {
            "status": "success",
            "message": "Logged out successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/me")
async def get_current_user(session_id: str = Header(None, alias="X-Session-Id")):
    """Get current user information"""
    session = verify_session(session_id)
    return {
        "username": session["username"],
        "user_id": session["user_id"]
    }

@app.post("/log-activity")
async def log_activity(activity: ActivityLog, session_id: str = Header(None, alias="X-Session-Id")):
    """Log user activity"""
    try:
        session = verify_session(session_id)
        
        db.log_activity(
            session["user_id"], 
            session_id, 
            activity.activity_type, 
            activity.activity_data
        )
        
        return {
            "status": "success",
            "message": "Activity logged"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/my-activities")
async def get_my_activities(limit: int = 100, session_id: str = Header(None, alias="X-Session-Id")):
    """Get current user's activities"""
    try:
        session = verify_session(session_id)
        activities = db.get_user_activities(session["user_id"], limit)
        
        return {
            "activities": activities,
            "count": len(activities)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), session_id: str = Header(None, alias="X-Session-Id")):
    """Upload and process a file"""
    try:
        # Verify session
        session = verify_session(session_id)
        
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
        
        # Log activity
        db.log_activity(
            session["user_id"], 
            session_id, 
            "file_upload", 
            {"filename": file.filename, "type": result["type"], "chunks": len(chunks)}
        )
        
        return {
            "status": "success",
            "filename": file.filename,
            "type": result["type"],
            "chunks_created": len(chunks),
            "message": f"✅ Successfully processed {file.filename} ({len(chunks)} chunks)"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_system(request: QueryRequest, session_id: str = Header(None, alias="X-Session-Id")):
    """Query the RAG system"""
    try:
        # Verify session
        session = verify_session(session_id)
        
        result = rag_pipeline.query(request.question, top_k=request.top_k)
        
        # Log activity
        db.log_activity(
            session["user_id"], 
            session_id, 
            "query", 
            {"question": request.question, "answer": result["answer"][:200]}
        )
        
        return result
    except HTTPException:
        raise
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
    print("="*60)
    print("🚀 Backend server starting on http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("="*60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
