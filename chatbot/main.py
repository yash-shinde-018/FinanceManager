"""
Standalone Chatbot API for MoneyMind AI
Separates chatbot functionality from the main ML API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import chatbot
try:
    from finance_chatbot import get_chatbot
    CHATBOT_AVAILABLE = True
    logger.info("✓ Chatbot module loaded successfully")
except ImportError as e:
    logger.warning(f"Chatbot not available: {e}")
    CHATBOT_AVAILABLE = False

# Initialize FastAPI app
app = FastAPI(
    title="MoneyMind AI - Chatbot Service",
    description="AI-powered finance chatbot with RAG",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Pydantic models
class ChatRequest(BaseModel):
    user_id: str = Field(..., description="User ID from Supabase auth")
    message: str = Field(..., description="User's question or message")
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default=None, 
        description="Previous conversation messages"
    )

class ChatResponse(BaseModel):
    response: str
    user_data_used: bool
    knowledge_retrieved: bool
    rag_transactions_used: int = 0
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    chatbot_ready: bool
    supabase_connected: bool
    groq_configured: bool
    error: Optional[str] = None


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "service": "MoneyMind AI Chatbot",
        "version": "1.0.0",
        "endpoints": {
            "chat": "POST /chat",
            "health": "GET /health"
        },
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if chatbot is configured and ready"""
    if not CHATBOT_AVAILABLE:
        return HealthResponse(
            status="not_available",
            chatbot_ready=False,
            supabase_connected=False,
            groq_configured=False,
            error="Required packages not installed. Run: pip install openai chromadb supabase"
        )
    
    try:
        chatbot = get_chatbot()
        return HealthResponse(
            status="healthy",
            chatbot_ready=True,
            supabase_connected=True,
            groq_configured=True
        )
    except ValueError as e:
        return HealthResponse(
            status="not_configured",
            chatbot_ready=False,
            supabase_connected=False,
            groq_configured=False,
            error=str(e)
        )
    except Exception as e:
        return HealthResponse(
            status="error",
            chatbot_ready=False,
            supabase_connected=False,
            groq_configured=False,
            error=str(e)
        )


@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    AI Finance Chatbot with RAG
    
    - **user_id**: User's ID from Supabase authentication
    - **message**: User's question (e.g., "How much did I spend last month?")
    - **conversation_history**: Optional previous messages for context
    
    The chatbot:
    1. Fetches user's real-time data from Supabase
    2. Retrieves relevant financial knowledge using RAG
    3. Generates personalized response using Groq LLM
    """
    if not CHATBOT_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Chatbot not available. Install required packages: pip install openai chromadb supabase"
        )
    
    try:
        # Get chatbot instance
        chatbot = get_chatbot()
        
        # Generate response
        result = chatbot.chat(
            user_id=request.user_id,
            message=request.message,
            conversation_history=request.conversation_history
        )
        
        if 'error' in result:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return ChatResponse(**result)
    
    except ValueError as e:
        # Missing API keys or configuration
        raise HTTPException(
            status_code=503,
            detail=f"Chatbot not configured: {str(e)}. Please set GROQ_API_KEY in .env file"
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chat/health")
async def chatbot_health_legacy():
    """Legacy health check endpoint (same as /health)"""
    return await health_check()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8004))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting Chatbot API on http://{host}:{port}")
    logger.info(f"API Documentation: http://{host}:{port}/docs")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
