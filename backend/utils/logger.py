from typing import List, Dict, Any
import json
import os
from datetime import datetime

class QueryLogger:
    """Logger for queries and responses"""
    
    def __init__(self, log_dir: str = "./logs"):
        self.log_dir = log_dir
        self.log_file = os.path.join(log_dir, "query_history.jsonl")
        os.makedirs(log_dir, exist_ok=True)
    
    def log_query(self, query: str, response: str, retrieved_docs: List[Dict[str, Any]], 
                   processing_time: float):
        """Log a query and its response"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "question": query,  # Frontend expects 'question'
            "answer": response,  # Frontend expects 'answer'
            "retrieved_documents": len(retrieved_docs),
            "processing_time_seconds": processing_time,
            "sources": [
                {
                    "file": doc["metadata"].get("file_path", "unknown"),
                    "type": doc["metadata"].get("type", "unknown"),
                    "score": doc.get("similarity_score", 0)
                }
                for doc in retrieved_docs
            ]
        }
        
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
    
    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve query history"""
        if not os.path.exists(self.log_file):
            return []
        
        history = []
        with open(self.log_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    history.append(json.loads(line))
        
        return history[-limit:]
