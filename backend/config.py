import os
from dotenv import load_dotenv

load_dotenv()

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.getenv("MODEL_PATH", "./models/mistral-7b-instruct-v0.1.Q4_K_M.gguf")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./data/uploads")
VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "./data/vector_db")
LOGS_DIR = os.getenv("LOGS_DIR", "./logs")

# API
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))

# Model Config
MAX_TOKENS = int(os.getenv("MAX_TOKENS", 512))
TEMPERATURE = float(os.getenv("TEMPERATURE", 0.7))
TOP_K = int(os.getenv("TOP_K", 5))

# Create directories
for directory in [UPLOAD_DIR, VECTOR_DB_PATH, LOGS_DIR]:
    os.makedirs(directory, exist_ok=True)
