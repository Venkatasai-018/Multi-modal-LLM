try:
    from transformers import pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    
from typing import List, Dict, Any
import os

class RAGPipeline:
    """RAG pipeline for query answering"""
    
    def __init__(self, model_path: str, vector_store, logger, 
                 max_tokens: int = 512, temperature: float = 0.7):
        self.vector_store = vector_store
        self.logger = logger
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.llm = None
        
        # Try to load LLM using transformers (easier on Windows)
        if TRANSFORMERS_AVAILABLE:
            print("Loading Qwen2.5-1.5B model (this may take a moment)...")
            try:
                # Using Qwen2.5-1.5B-Instruct - excellent small model
                # Downloads automatically, ~1.7GB
                self.llm = pipeline(
                    "text-generation",
                    model="Qwen/Qwen2.5-1.5B-Instruct",
                    device_map="cpu",  # Use CPU only for compatibility
                    max_length=2048
                )
                print("Qwen2.5 model loaded successfully!")
            except Exception as e:
                print(f"Warning: Could not load LLM: {e}")
                print("Using mock responses. Install transformers to enable AI responses.")
        else:
            print("Warning: transformers not installed. Using mock responses.")
            print("Install with: pip install transformers accelerate")
    
    def query(self, question: str, top_k: int = 5) -> Dict[str, Any]:
        """Process a query using RAG"""
        import time
        start_time = time.time()
        
        # Retrieve relevant documents
        retrieved_docs = self.vector_store.search(question, top_k=top_k)
        
        if not retrieved_docs:
            response = "I don't have any relevant information to answer this question. Please upload some documents first."
            processing_time = time.time() - start_time
            self.logger.log_query(question, response, [], processing_time)
            return {
                "question": question,
                "answer": response,
                "sources": [],
                "processing_time": processing_time
            }
        
        # Build context from retrieved documents
        context = self._build_context(retrieved_docs)
        
        # Generate answer
        answer = self._generate_answer(question, context)
        
        processing_time = time.time() - start_time
        
        # Log the query
        self.logger.log_query(question, answer, retrieved_docs, processing_time)
        
        # Prepare response with evidence
        return {
            "question": question,
            "answer": answer,
            "sources": self._format_sources(retrieved_docs),
            "processing_time": processing_time
        }
    
    def _build_context(self, retrieved_docs: List[Dict[str, Any]]) -> str:
        """Build context from retrieved documents"""
        context_parts = []
        for i, doc in enumerate(retrieved_docs, 1):
            file_path = doc["metadata"].get("file_path", "unknown")
            doc_type = doc["metadata"].get("type", "unknown")
            content = doc["document"][:500]  # Limit context length
            
            context_parts.append(f"[Source {i} - {doc_type} from {file_path}]\n{content}\n")
        
        return "\n".join(context_parts)
    
    def _generate_answer(self, question: str, context: str) -> str:
        """Generate answer using LLM"""
        prompt = f"""Based on the following context, answer the question. If the context doesn't contain enough information, say so.

Context:
{context}

Question: {question}

Answer:"""
        
        if self.llm is None:
            # Mock response when model is not available
            return f"[Mock Response] Based on the provided context, here's a summary related to your question. Install transformers library to get real AI-generated responses: pip install transformers accelerate"
        
        try:
            # Generate response using transformers
            response = self.llm(
                prompt,
                max_new_tokens=self.max_tokens,
                temperature=self.temperature,
                do_sample=True,
                top_p=0.95
            )
            
            # Extract generated text
            generated_text = response[0]["generated_text"]
            
            # Remove the prompt from the response
            answer = generated_text.replace(prompt, "").strip()
            
            return answer
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def _format_sources(self, retrieved_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format source information for response"""
        sources = []
        for doc in retrieved_docs:
            metadata = doc["metadata"]
            source = {
                "file": metadata.get("file_path", "unknown"),
                "type": metadata.get("type", "unknown"),
                "similarity": round(doc.get("similarity_score", 0), 3),
                "excerpt": doc["document"][:200] + "..."
            }
            
            # Add type-specific metadata
            if metadata.get("type") == "pdf":
                source["page"] = metadata.get("page", "unknown")
            elif metadata.get("type") == "audio":
                source["timestamp"] = metadata.get("timestamp", "unknown")
            
            sources.append(source)
        
        return sources
