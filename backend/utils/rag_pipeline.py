try:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
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
        self.tokenizer = None
        
        # Load lightweight model using transformers
        if TRANSFORMERS_AVAILABLE:
            print("Loading Qwen2.5-1.5B model (best accuracy-speed balance)...")
            try:
                # Qwen2.5-1.5B - Best balance of accuracy and speed for CPU
                # Alternative models:
                # "Qwen/Qwen2.5-0.5B-Instruct" - Fastest but less accurate
                # "microsoft/Phi-3-mini-4k-instruct" - More accurate but slower
                # "TinyLlama/TinyLlama-1.1B-Chat-v1.0" - Fast but less accurate
                model_name = "Qwen/Qwen2.5-1.5B-Instruct"
                
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                self.llm = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float32,
                    device_map="cpu",
                    low_cpu_mem_usage=True
                )
                print("✅ Qwen2.5-1.5B loaded successfully! (Excellent accuracy + good speed)")
            except Exception as e:
                print(f"Warning: Could not load model: {e}")
                print("Using mock responses.")
        else:
            print("Warning: transformers not installed.")
            print("Install with: pip install transformers torch")
    
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
        # Use top 4 most relevant documents for better accuracy
        for i, doc in enumerate(retrieved_docs[:4], 1):
            file_path = doc["metadata"].get("file_path", "unknown")
            doc_type = doc["metadata"].get("type", "unknown")
            content = doc["document"][:600]  # Slightly more context for accuracy
            
            context_parts.append(f"[Document {i} from {file_path}]\n{content}\n")
        
        return "\n".join(context_parts)
    
    def _generate_answer(self, question: str, context: str) -> str:
        """Generate answer using LLM"""
        # Optimized prompt for better accuracy
        prompt = f"""Context: {context}

Question: {question}

Provide a clear and accurate answer based only on the context above. If the context doesn't contain the information, say "I don't have enough information to answer this question."

Answer:"""
        
        if self.llm is None or self.tokenizer is None:
            # Mock response when model is not available
            return f"[Mock Response] Based on the provided context, here's a summary related to your question. Install transformers to get real AI responses: pip install transformers torch"
        
        try:
            # Tokenize input with truncation for speed
            inputs = self.tokenizer(prompt, return_tensors="pt", max_length=2048, truncation=True)
            
            # Generate response with optimized parameters for accuracy + speed
            outputs = self.llm.generate(
                **inputs,
                max_new_tokens=min(self.max_tokens, 200),  # Limit for speed
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=self.tokenizer.eos_token_id
            )
            
            # Decode and extract answer
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            answer = generated_text.replace(prompt, "").strip()
            
            return answer if answer else "I cannot provide an answer based on the given context."
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
