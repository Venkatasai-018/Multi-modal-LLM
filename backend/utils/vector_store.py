from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle
import os
from typing import List, Dict, Any
from datetime import datetime

class VectorStore:
    """FAISS-based vector store for embeddings"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", db_path: str = "./data/vector_db"):
        self.model = SentenceTransformer(model_name)
        self.db_path = db_path
        self.dimension = 384  # Default for MiniLM
        self.index = None
        self.documents = []
        self.metadata = []
        
        # Try to load existing index
        self._load_index()
    
    def _load_index(self):
        """Load existing FAISS index and metadata"""
        index_file = os.path.join(self.db_path, "faiss.index")
        docs_file = os.path.join(self.db_path, "documents.pkl")
        meta_file = os.path.join(self.db_path, "metadata.pkl")
        
        if os.path.exists(index_file):
            self.index = faiss.read_index(index_file)
            with open(docs_file, 'rb') as f:
                self.documents = pickle.load(f)
            with open(meta_file, 'rb') as f:
                self.metadata = pickle.load(f)
            print(f"Loaded existing index with {len(self.documents)} documents")
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            print("Created new FAISS index")
    
    def _save_index(self):
        """Save FAISS index and metadata"""
        os.makedirs(self.db_path, exist_ok=True)
        
        index_file = os.path.join(self.db_path, "faiss.index")
        docs_file = os.path.join(self.db_path, "documents.pkl")
        meta_file = os.path.join(self.db_path, "metadata.pkl")
        
        faiss.write_index(self.index, index_file)
        with open(docs_file, 'wb') as f:
            pickle.dump(self.documents, f)
        with open(meta_file, 'wb') as f:
            pickle.dump(self.metadata, f)
    
    def add_documents(self, documents: List[str], metadata: List[Dict[str, Any]]):
        """Add documents to the vector store"""
        if not documents:
            return
        
        # Generate embeddings
        embeddings = self.model.encode(documents, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')
        
        # Add to FAISS index
        self.index.add(embeddings)
        
        # Store documents and metadata
        self.documents.extend(documents)
        self.metadata.extend(metadata)
        
        # Save to disk
        self._save_index()
        
        print(f"Added {len(documents)} documents to vector store")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        if self.index.ntotal == 0:
            return []
        
        # Generate query embedding
        query_embedding = self.model.encode([query])
        query_embedding = np.array(query_embedding).astype('float32')
        
        # Search in FAISS
        distances, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))
        
        # Prepare results
        results = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            if idx < len(self.documents):
                results.append({
                    "rank": i + 1,
                    "document": self.documents[idx],
                    "metadata": self.metadata[idx],
                    "similarity_score": float(1 / (1 + dist))  # Convert distance to similarity
                })
        
        return results
    
    def get_stats(self) -> Dict[str, Any]:
        """Get vector store statistics"""
        return {
            "total_documents": len(self.documents),
            "index_size": self.index.ntotal,
            "dimension": self.dimension
        }
