from typing import Dict, Any, List
from .pdf_agent import PDFAgent
from .docx_agent import DOCXAgent
from .image_agent import ImageAgent
from .audio_agent import AudioAgent
import os

class AgentOrchestrator:
    """Orchestrates different agents based on file type"""
    
    def __init__(self):
        self.agents = {
            ".pdf": PDFAgent(),
            ".docx": DOCXAgent(),
            ".doc": DOCXAgent(),
            ".png": ImageAgent(),
            ".jpg": ImageAgent(),
            ".jpeg": ImageAgent(),
            ".gif": ImageAgent(),
            ".bmp": ImageAgent(),
            ".mp3": AudioAgent(),
            ".wav": AudioAgent(),
            ".m4a": AudioAgent(),
            ".ogg": AudioAgent(),
        }
        self.processed_files = []
    
    def process_file(self, file_path: str) -> Dict[str, Any]:
        """Route file to appropriate agent"""
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext not in self.agents:
            raise ValueError(f"Unsupported file type: {file_ext}")
        
        agent = self.agents[file_ext]
        result = agent.process(file_path)
        
        self.processed_files.append(result)
        return result
    
    def get_all_logs(self) -> List[Dict[str, Any]]:
        """Collect logs from all agents"""
        all_logs = []
        for agent in self.agents.values():
            all_logs.extend(agent.get_logs())
        return all_logs
