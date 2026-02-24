# ml_api_v2.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import pandas as pd
import joblib
import uvicorn
from datetime import datetime
import logging
from functools import lru_cache
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model cache
class ModelCache:
    def __init__(self):
        self.classifier = None
        self.vectorizer = None
        self.anomaly_detector = None
        self.feature_engineer = None
        self.category_stats = None
        self.merchant_stats = None
        self.forecaster = None
        self.loaded = False
    
    def load_models(self):
        """Load all models at startup"""
        if self.loaded:
            return
        
        try:
            logger.info("Loading ML models...")
            
            # Load classifier
            if os.path.exists('expense_classifier.pkl'):
                self.classifier = joblib.load('expense_classifier.pkl')
                self.vectorizer = joblib.load('tfidf_vectorizer.pkl')
                logger.info("✓ Classifier loaded")
            
            # Load anomaly detector
            if os.path.exists('anomaly_detector.pkl'):
                self.anomaly_detector = joblib.load('anomaly_detector.pkl')
                logger.info("✓ Anomaly detector loaded")
            
            # Load feature engineer and stats
            if os.path.exists('feature_engineer.pkl'):
                self.feature_engineer = joblib.load('feature_engineer.pkl')
                self.category_stats = joblib.load('category_stats.pkl')
                self.merchant_stats = joblib.load('merchant_stats.pkl')
                logger.info("✓ Feature engineer loaded")
            
            # Load forecaster (optional - may have compatibility issues)
            try:
                if os.path.exists('sarimax_model.pkl'):
                    self.forecaster = joblib.load('sarimax_model.pkl')
                    logger.info("✓ Forecaster loaded")
                elif os.path.exists('ets_model.pkl'):
                    self.forecaster = joblib.load('ets_model.pkl')
                    logger.info("✓ ETS Forecaster loaded")
            except Exception as e:
                logger.warning(f"⚠ Forecaster not loaded: {e}")
                logger.info("Forecast endpoint will retrain on demand")
            
            self.loaded = True
            logger.info("All models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise

models = ModelCache()

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup"""
    models.load_models()
    yield

# Initialize FastAPI app with lifespan
app = FastAPI(
    title="MoneyMind AI - ML Service",
    description="AI-powered personal finance insights",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Pydantic models
class Transaction(BaseModel):
    date: str = Field(..., json_schema_extra={"example": "2026-02-21"})
    description: str = Field(..., json_schema_extra={"example": "swiggy biryani order"})
    amount: float = Field(..., json_schema_extra={"example": -450.50})
    category: Optional[str] = None

class CategorizedTransaction(BaseModel):
    date: str
    description: str
    amount: float
    category: str
    confidence: float
    top_3_predictions: List[tuple]
    is_anomaly: bool
    anomaly_score: Optional[float] = None
    anomaly_severity: Optional[str] = None
    anomaly_explanation: Optional[Dict[str, Any]] = None

class ForecastRequest(BaseModel):
    days: int = Field(default=30, ge=1, le=90)

class ForecastResponse(BaseModel):
    dates: List[str]
    forecast: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    model_used: str
    total_predicted: float

class InsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
    generated_at: str

# Startup event using lifespan
from contextlib import asynccontextmanager

# Health check
@app.get("/health")
@app.options("/health")
async def health_check():
    """Check if API and models are ready"""
    return {
        "status": "healthy",
        "models_loaded": models.loaded,
        "timestamp": datetime.now().isoformat()
    }

# Categorization endpoint
@app.post("/categorize", response_model=CategorizedTransaction)
async def categorize_transaction(transaction: Transaction):
    """
    Categorize a transaction and detect anomalies
    
    - **description**: Transaction description (e.g., "swiggy biryani order")
    - **amount**: Transaction amount in INR (negative for expenses, e.g., -450.50)
    - **date**: Transaction date (YYYY-MM-DD)
    """
    try:
        if not models.loaded:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        # Categorize
        desc_vectorized = models.vectorizer.transform([transaction.description])
        category = models.classifier.predict(desc_vectorized)[0]
        
        # Get confidence
        probabilities = models.classifier.predict_proba(desc_vectorized)[0]
        confidence = float(probabilities.max())
        
        # Top 3 predictions
        top_3_idx = probabilities.argsort()[-3:][::-1]
        top_3 = [(models.classifier.classes_[i], float(probabilities[i])) for i in top_3_idx]
        
        # Check for anomaly
        df = pd.DataFrame([{
            'date': transaction.date,
            'description': transaction.description,
            'amount': transaction.amount,
            'category': category
        }])
        
        is_anomaly = False
        anomaly_score = None
        anomaly_severity = None
        anomaly_explanation = None
        
        if models.feature_engineer and models.anomaly_detector:
            try:
                X = models.feature_engineer.get_feature_matrix(df)
                prediction = models.anomaly_detector.predict(X)[0]
                score = float(models.anomaly_detector.score_samples(X)[0])
                
                is_anomaly = prediction == -1
                anomaly_score = score
                
                if is_anomaly:
                    # Generate explanation
                    from anomaly_detector_v2 import ImprovedAnomalyDetector
                    detector = ImprovedAnomalyDetector()
                    detector.category_stats = models.category_stats
                    detector.merchant_stats = models.merchant_stats
                    detector.feature_engineer = models.feature_engineer
                    
                    anomaly_explanation = detector.explain_anomaly(df.iloc[0])
                    
                    if score > -0.2:
                        anomaly_severity = 'low'
                    elif score > -0.3:
                        anomaly_severity = 'medium'
                    else:
                        anomaly_severity = 'high'
            
            except Exception as e:
                logger.warning(f"Anomaly detection failed: {e}")
        
        return CategorizedTransaction(
            date=transaction.date,
            description=transaction.description,
            amount=transaction.amount,
            category=category,
            confidence=confidence,
            top_3_predictions=top_3,
            is_anomaly=is_anomaly,
            anomaly_score=anomaly_score,
            anomaly_severity=anomaly_severity,
            anomaly_explanation=anomaly_explanation
        )
    
    except Exception as e:
        logger.error(f"Categorization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch categorization
@app.post("/batch-categorize")
async def batch_categorize(transactions: List[Transaction]):
    """Categorize multiple transactions efficiently"""
    try:
        if not models.loaded:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        results = []
        for transaction in transactions:
            result = await categorize_transaction(transaction)
            results.append(result)
        
        return {
            "total": len(results),
            "transactions": results
        }
    
    except Exception as e:
        logger.error(f"Batch categorization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Forecast endpoint
@app.post("/forecast", response_model=ForecastResponse)
async def get_forecast(request: ForecastRequest):
    """
    Get spending forecast for next N days
    
    - **days**: Number of days to forecast (1-90)
    """
    try:
        # Load transaction data
        if not os.path.exists('synthetic_transactions.csv'):
            # Return simple forecast if no data
            forecast_dates = pd.date_range(
                start=pd.Timestamp.now(),
                periods=request.days,
                freq='D'
            )
            
            # Simple linear forecast
            base_amount = 100
            forecast_values = [base_amount * (1 + i * 0.01) for i in range(request.days)]
            lower_bound = [v * 0.8 for v in forecast_values]
            upper_bound = [v * 1.2 for v in forecast_values]
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=forecast_values,
                lower_bound=lower_bound,
                upper_bound=upper_bound,
                model_used='Simple Linear',
                total_predicted=sum(forecast_values)
            )
        
        df = pd.read_csv('synthetic_transactions.csv')
        
        # Train forecaster on demand
        logger.info("Training forecaster on demand...")
        from spending_forecaster_v2 import ImprovedSpendingForecaster
        
        forecaster = ImprovedSpendingForecaster()
        forecaster.train_sarimax(df)
        
        # Generate forecast
        forecast_result = forecaster.sarimax_model.forecast(steps=request.days)
        
        # Get confidence intervals
        forecast_df = forecaster.sarimax_model.get_forecast(steps=request.days)
        conf_int = forecast_df.conf_int()
        
        # Generate dates
        forecast_dates = pd.date_range(
            start=pd.Timestamp.now(),
            periods=request.days,
            freq='D'
        )
        
        forecast_values = forecast_result.values if hasattr(forecast_result, 'values') else forecast_result
        
        return ForecastResponse(
            dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
            forecast=forecast_values.tolist(),
            lower_bound=conf_int.iloc[:, 0].tolist(),
            upper_bound=conf_int.iloc[:, 1].tolist(),
            model_used='SARIMAX',
            total_predicted=float(forecast_values.sum())
        )
    
    except Exception as e:
        logger.error(f"Forecast error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Insights endpoint
@app.get("/insights", response_model=InsightResponse)
async def get_insights():
    """Get personalized financial insights based on user transactions"""
    try:
        # Return empty insights if no transaction data
        # Frontend should pass user transactions for personalized insights
        insights = [
            {
                "type": "info",
                "message": "Add transactions to get personalized AI insights about your spending patterns",
                "severity": "low"
            }
        ]
        
        return InsightResponse(
            insights=insights,
            generated_at=datetime.now().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Insights error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# New endpoint: Generate insights from user transactions
@app.post("/insights/generate")
async def generate_insights_from_transactions(transactions: List[Transaction]):
    """Generate insights from provided user transactions"""
    try:
        if not transactions or len(transactions) == 0:
            return InsightResponse(
                insights=[{
                    "type": "info",
                    "message": "No transactions found. Start adding transactions to get AI-powered insights!",
                    "severity": "low"
                }],
                generated_at=datetime.now().isoformat()
            )
        
        # Convert to DataFrame
        df_data = []
        for t in transactions:
            df_data.append({
                'date': t.date,
                'description': t.description,
                'amount': abs(t.amount),
                'category': t.category if t.category else 'Other'
            })
        
        df = pd.DataFrame(df_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Generate basic insights without forecaster
        insights = []
        
        # Calculate basic statistics
        total_spending = df['amount'].sum()
        avg_daily = df['amount'].mean()
        avg_monthly = avg_daily * 30
        
        insights.append({
            "type": "summary",
            "message": f"Your average daily spending is ₹{avg_daily:.2f} (₹{avg_monthly:.2f}/month)",
            "severity": "low"
        })
        
        # Top categories
        category_totals = df.groupby('category')['amount'].sum().sort_values(ascending=False)
        total = category_totals.sum()
        
        for i, (cat, amount) in enumerate(category_totals.head(3).items(), 1):
            percentage = (amount / total * 100) if total > 0 else 0
            insights.append({
                "type": "category",
                "message": f"#{i} spending category: {cat} (₹{amount:.2f}, {percentage:.1f}% of total)",
                "severity": "low"
            })
        
        # Day of week pattern
        df['day_of_week'] = df['date'].dt.day_name()
        day_avg = df.groupby('day_of_week')['amount'].mean()
        if len(day_avg) > 0:
            max_day = day_avg.idxmax()
            min_day = day_avg.idxmin()
            insights.append({
                "type": "pattern",
                "message": f"You spend most on {max_day}s (₹{day_avg[max_day]:.2f}) and least on {min_day}s (₹{day_avg[min_day]:.2f})",
                "severity": "low"
            })
        
        # Recommendation for top category
        if len(category_totals) > 0:
            top_cat = category_totals.index[0]
            top_amount = category_totals.iloc[0]
            savings = top_amount * 0.15
            insights.append({
                "type": "recommendation",
                "message": f"💡 Reducing {top_cat} spending by 15% could save you ₹{savings:.2f}/month",
                "severity": "low"
            })
        
        return InsightResponse(
            insights=insights,
            generated_at=datetime.now().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Insights generation error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Model info endpoint
@app.get("/models/info")
async def get_model_info():
    """Get information about loaded models"""
    return {
        "classifier_loaded": models.classifier is not None,
        "anomaly_detector_loaded": models.anomaly_detector is not None,
        "forecaster_loaded": models.forecaster is not None,
        "feature_engineer_loaded": models.feature_engineer is not None,
        "categories": list(models.classifier.classes_) if models.classifier else []
    }

# ============================================
# CHATBOT ENDPOINTS
# ============================================

try:
    from finance_chatbot import get_chatbot
    CHATBOT_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Chatbot not available: {e}")
    logger.warning("Install packages: pip install langchain langchain-openai openai chromadb supabase")
    CHATBOT_AVAILABLE = False

class ChatRequest(BaseModel):
    user_id: str = Field(..., description="User ID from Supabase auth")
    message: str = Field(..., description="User's question or message")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default=None, description="Previous conversation messages")

class ChatResponse(BaseModel):
    response: str
    user_data_used: bool
    knowledge_retrieved: bool
    timestamp: str

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
    3. Generates personalized response using GPT-3.5-turbo
    """
    if not CHATBOT_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Chatbot not available. Install required packages: pip install langchain langchain-openai openai chromadb supabase"
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
            detail=f"Chatbot not configured: {str(e)}. Please set OPENAI_API_KEY in .env file"
        )
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/health")
async def chatbot_health():
    """Check if chatbot is configured and ready"""
    if not CHATBOT_AVAILABLE:
        return {
            "status": "not_available",
            "chatbot_ready": False,
            "error": "Required packages not installed. Run: pip install langchain langchain-openai openai chromadb supabase"
        }
    
    try:
        chatbot = get_chatbot()
        return {
            "status": "healthy",
            "chatbot_ready": True,
            "supabase_connected": True,
            "openai_configured": True
        }
    except ValueError as e:
        return {
            "status": "not_configured",
            "chatbot_ready": False,
            "error": str(e)
        }
    except Exception as e:
        return {
            "status": "error",
            "chatbot_ready": False,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

