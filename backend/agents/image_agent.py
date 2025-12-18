from PIL import Image
import pytesseract
from typing import Dict, Any
from .base_agent import BaseAgent

class ImageAgent(BaseAgent):
    """Agent for processing image files"""
    
    def __init__(self):
        super().__init__("ImageAgent")
    
    def process(self, file_path: str) -> Dict[str, Any]:
        """Extract text from images using OCR"""
        self.log(f"Processing Image: {file_path}")
        
        try:
            image = Image.open(file_path)
            
            # Extract text using Tesseract OCR
            text = pytesseract.image_to_string(image)
            
            self.log(f"Extracted text from image")
            
            return {
                "type": "image",
                "file_path": file_path,
                "content": text.strip(),
                "metadata": {
                    "image_size": image.size,
                    "format": image.format
                }
            }
        except Exception as e:
            self.log(f"Error processing image: {str(e)}")
            raise
