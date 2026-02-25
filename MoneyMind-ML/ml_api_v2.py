# ml_api_v2.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import pandas as pd
import numpy as np
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
    days_of_data: int = 0
    min_days_required: int = 14
    full_model_days: int = 21
    status: str = "ok"  # ok, early_stage, insufficient_data

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

# Forecast endpoint with user transactions
@app.post("/forecast/user", response_model=ForecastResponse)
async def get_forecast_for_user(transactions: List[Transaction], days: int = 30):
    """
    Get spending forecast based on user's actual transaction data from Supabase
    
    - **transactions**: List of user's transactions from Supabase
    - **days**: Number of days to forecast (1-90)
    """
    try:
        MIN_DAYS_REQUIRED = 14
        FULL_MODEL_DAYS = 21
        
        # No transactions provided
        if not transactions or len(transactions) == 0:
            logger.info("No user transactions provided - insufficient data")
            forecast_dates = pd.date_range(
                start=pd.Timestamp.now(),
                periods=days,
                freq='D'
            )
            zeros = [0.0] * days
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=zeros,
                lower_bound=zeros,
                upper_bound=zeros,
                model_used='Insufficient Data',
                total_predicted=0.0,
                days_of_data=0,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='insufficient_data'
            )
        
        # Convert transactions to DataFrame
        df_data = []
        for t in transactions:
            df_data.append({
                'date': t.date,
                'description': t.description,
                'amount': t.amount,
                'category': t.category if t.category else 'Other'
            })
        
        df = pd.DataFrame(df_data)
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        
        # Remove rows with invalid dates
        df = df.dropna(subset=['date'])
        
        if len(df) == 0:
            logger.warning("No valid dates found in transactions")
            forecast_dates = pd.date_range(
                start=pd.Timestamp.now(),
                periods=days,
                freq='D'
            )
            zeros = [0.0] * days
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=zeros,
                lower_bound=zeros,
                upper_bound=zeros,
                model_used='Insufficient Data',
                total_predicted=0.0,
                days_of_data=0,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='insufficient_data'
            )
        
        # Calculate days of data
        min_date = df['date'].min()
        max_date = df['date'].max()
        days_of_data = (max_date - min_date).days + 1
        logger.info(f"User has {len(df)} valid transactions over {days_of_data} days")
        
        # Generate forecast dates
        forecast_dates = pd.date_range(
            start=pd.Timestamp.now(),
            periods=days,
            freq='D'
        )
        
        # === INSUFFICIENT DATA: < 14 days ===
        if days_of_data < MIN_DAYS_REQUIRED:
            logger.info(f"Insufficient data: {days_of_data} days (need {MIN_DAYS_REQUIRED})")
            zeros = [0.0] * days
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=zeros,
                lower_bound=zeros,
                upper_bound=zeros,
                model_used='Insufficient Data',
                total_predicted=0.0,
                days_of_data=days_of_data,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='insufficient_data'
            )
        
        # === EARLY-STAGE FORECAST: 14-20 days ===
        if days_of_data < FULL_MODEL_DAYS:
            logger.info(f"Using early-stage forecast: {days_of_data} days")
            
            # Aggregate daily spending (check for type column)
            if 'type' in df.columns:
                expenses = df[df['type'] == 'expense'].copy()
            else:
                expenses = df[df['amount'] < 0].copy()
                expenses['amount'] = expenses['amount'].abs()
            daily_spending = expenses.groupby('date')['amount'].sum().reset_index()
            daily_spending = daily_spending.set_index('date').asfreq('D', fill_value=0)
            
            # Use Simple Moving Average with 7-day window
            window = min(7, days_of_data)
            moving_avg = daily_spending['amount'].rolling(window=window, min_periods=1).mean()
            last_avg = moving_avg.iloc[-1] if len(moving_avg) > 0 else 0
            
            # Generate forecast using moving average
            forecast_values = [float(last_avg)] * days
            
            # Simple bounds: ±20% for early stage
            lower_values = [v * 0.8 for v in forecast_values]
            upper_values = [v * 1.2 for v in forecast_values]
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=forecast_values,
                lower_bound=lower_values,
                upper_bound=upper_values,
                model_used='Early-stage forecast (limited data)',
                total_predicted=sum(forecast_values),
                days_of_data=days_of_data,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='early_stage'
            )
        
        # === FULL SARIMAX MODEL: ≥ 21 days ===
        logger.info(f"Using full SARIMAX model: {days_of_data} days, {len(df)} transactions")
        
        try:
            from spending_forecaster_v2 import ImprovedSpendingForecaster
            
            forecaster = ImprovedSpendingForecaster()
            forecaster.train_sarimax(df)
            
            # Check if model training succeeded
            if forecaster.sarimax_model is None and forecaster.ets_model is None:
                logger.warning("SARIMAX and ETS both failed to train, using moving average fallback")
                raise Exception("Model training failed")
            
            # Generate forecast using whichever model succeeded
            if forecaster.sarimax_model:
                forecast_result = forecaster.sarimax_model.forecast(steps=days)
                forecast_df = forecaster.sarimax_model.get_forecast(steps=days)
                conf_int = forecast_df.conf_int()
                model_name = 'SARIMAX'
            else:
                # Use ETS model
                forecast_result = forecaster.ets_model.forecast(steps=days)
                # Approximate confidence intervals for ETS
                std_error = forecaster.daily_spending.std() * 0.3
                conf_int = pd.DataFrame({
                    0: forecast_result - 1.96 * std_error,
                    1: forecast_result + 1.96 * std_error
                })
                model_name = 'ETS (Exponential Smoothing)'
            
            forecast_values = forecast_result.values if hasattr(forecast_result, 'values') else forecast_result
            total_predicted = float(forecast_values.sum())
            
            logger.info(f"Forecast generated: {model_name}, total_predicted={total_predicted}")
            
            # Ensure non-negative predictions
            forecast_values = np.maximum(forecast_values, 0)
            lower_values = np.maximum(conf_int.iloc[:, 0].values, 0)
            upper_values = conf_int.iloc[:, 1].values
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=forecast_values.tolist(),
                lower_bound=lower_values.tolist(),
                upper_bound=upper_values.tolist(),
                model_used=model_name,
                total_predicted=total_predicted,
                days_of_data=days_of_data,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='ok'
            )
            
        except Exception as model_error:
            logger.error(f"Model training/forecast failed: {model_error}")
            logger.info("Falling back to average-based forecast")
            
            # === ROBUST FALLBACK: Calculate average daily spending over the date span ===
            # Check if 'type' column exists (user transactions), otherwise use amount < 0 (CSV data)
            if 'type' in df.columns:
                expenses = df[df['type'] == 'expense'].copy()
                total_spent = expenses['amount'].sum()
            else:
                expenses = df[df['amount'] < 0].copy()
                total_spent = expenses['amount'].abs().sum()
            logger.info(f"Expense transactions: {len(expenses)}")
            
            if len(expenses) > 0:
                # Use the total date span (days_of_data) to calculate average daily spending
                # This gives a realistic projection even if all expenses were on 1 day
                if days_of_data > 0:
                    avg_daily_spending = total_spent / days_of_data
                else:
                    avg_daily_spending = total_spent / len(expenses)
                
                logger.info(f"Total spent: {total_spent}, Date span: {days_of_data} days, Avg daily: {avg_daily_spending:.2f}")
                
                # Project forward for the forecast period
                forecast_values = [float(avg_daily_spending)] * days
                total_predicted = sum(forecast_values)
                
                logger.info(f"Forecast: {total_predicted:.2f} over {days} days")
                
                # Calculate bounds (±30% for uncertainty)
                lower_values = [v * 0.7 for v in forecast_values]
                upper_values = [v * 1.3 for v in forecast_values]
                
                return ForecastResponse(
                    dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                    forecast=forecast_values,
                    lower_bound=lower_values,
                    upper_bound=upper_values,
                    model_used='Average Daily Projection',
                    total_predicted=total_predicted,
                    days_of_data=days_of_data,
                    min_days_required=MIN_DAYS_REQUIRED,
                    full_model_days=FULL_MODEL_DAYS,
                    status='ok'
                )
            
            # No expense data at all
            logger.warning("No expense data found, returning zeros")
            zeros = [0.0] * days
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=zeros,
                lower_bound=zeros,
                upper_bound=zeros,
                model_used='No Expense Data',
                total_predicted=0.0,
                days_of_data=days_of_data,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='ok'
            )
    
    except Exception as e:
        logger.error(f"User forecast error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/forecast", response_model=ForecastResponse)
async def get_forecast(request: ForecastRequest):
    """
    Get spending forecast for next N days
    
    - **days**: Number of days to forecast (1-90)
    - **< 14 days data**: Returns insufficient_data status, no forecast
    - **14-20 days data**: Uses moving average (early-stage forecast)
    - **≥ 21 days data**: Uses full SARIMAX model
    """
    try:
        MIN_DAYS_REQUIRED = 14  # Minimum days to generate any forecast
        FULL_MODEL_DAYS = 21    # Days required for SARIMAX (3 weekly cycles)
        
        # Load transaction data
        if not os.path.exists('synthetic_transactions.csv'):
            # No data available - return insufficient_data status
            logger.info("No transaction data available - insufficient data for forecast")
            forecast_dates = pd.date_range(
                start=pd.Timestamp.now(),
                periods=request.days,
                freq='D'
            )
            zeros = [0.0] * request.days
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=zeros,
                lower_bound=zeros,
                upper_bound=zeros,
                model_used='Insufficient Data',
                total_predicted=0.0,
                days_of_data=0,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='insufficient_data'
            )
        
        df = pd.read_csv('synthetic_transactions.csv')
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate days of historical data
        days_of_data = (df['date'].max() - df['date'].min()).days + 1
        logger.info(f"Days of historical data: {days_of_data}")
        
        # Generate forecast dates
        forecast_dates = pd.date_range(
            start=pd.Timestamp.now(),
            periods=request.days,
            freq='D'
        )
        
        # === INSUFFICIENT DATA: < 14 days ===
        if days_of_data < MIN_DAYS_REQUIRED:
            logger.info(f"Insufficient data: {days_of_data} days (need {MIN_DAYS_REQUIRED})")
            zeros = [0.0] * request.days
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=zeros,
                lower_bound=zeros,
                upper_bound=zeros,
                model_used='Insufficient Data',
                total_predicted=0.0,
                days_of_data=days_of_data,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='insufficient_data'
            )
        
        # === EARLY-STAGE FORECAST: 14-20 days ===
        if days_of_data < FULL_MODEL_DAYS:
            logger.info(f"Using early-stage forecast: {days_of_data} days (need {FULL_MODEL_DAYS} for full model)")
            
            # Aggregate daily spending
            if 'type' in df.columns:
                expenses = df[df['type'] == 'expense'].copy()
            else:
                expenses = df[df['amount'] < 0].copy()
                expenses['amount'] = expenses['amount'].abs()
            daily_spending = expenses.groupby('date')['amount'].sum().reset_index()
            daily_spending = daily_spending.set_index('date').asfreq('D', fill_value=0)
            
            # Use Simple Moving Average with 7-day window
            window = min(7, days_of_data)
            moving_avg = daily_spending['amount'].rolling(window=window, min_periods=1).mean()
            last_avg = moving_avg.iloc[-1] if len(moving_avg) > 0 else 0
            
            # Generate forecast using moving average
            forecast_values = [last_avg] * request.days
            
            # Simple bounds: ±20% for early stage
            lower_values = [v * 0.8 for v in forecast_values]
            upper_values = [v * 1.2 for v in forecast_values]
            
            return ForecastResponse(
                dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
                forecast=forecast_values,
                lower_bound=lower_values,
                upper_bound=upper_values,
                model_used='Early-stage forecast (limited data)',
                total_predicted=sum(forecast_values),
                days_of_data=days_of_data,
                min_days_required=MIN_DAYS_REQUIRED,
                full_model_days=FULL_MODEL_DAYS,
                status='early_stage'
            )
        
        # === FULL SARIMAX MODEL: ≥ 21 days ===
        logger.info(f"Using full SARIMAX model: {days_of_data} days of data")
        
        # Train forecaster on demand
        from spending_forecaster_v2 import ImprovedSpendingForecaster
        
        forecaster = ImprovedSpendingForecaster()
        forecaster.train_sarimax(df)
        
        # Generate forecast
        forecast_result = forecaster.sarimax_model.forecast(steps=request.days)
        
        # Get confidence intervals
        forecast_df = forecaster.sarimax_model.get_forecast(steps=request.days)
        conf_int = forecast_df.conf_int()
        
        forecast_values = forecast_result.values if hasattr(forecast_result, 'values') else forecast_result
        
        return ForecastResponse(
            dates=[d.strftime('%Y-%m-%d') for d in forecast_dates],
            forecast=forecast_values.tolist(),
            lower_bound=conf_int.iloc[:, 0].tolist(),
            upper_bound=conf_int.iloc[:, 1].tolist(),
            model_used='SARIMAX',
            total_predicted=float(forecast_values.sum()),
            days_of_data=days_of_data,
            min_days_required=MIN_DAYS_REQUIRED,
            full_model_days=FULL_MODEL_DAYS,
            status='ok'
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
                'type': 'expense' if t.amount < 0 else 'income',
                'category': t.category if t.category else 'Other'
            })
        
        df = pd.DataFrame(df_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Separate income and expenses
        expenses_df = df[df['type'] == 'expense']
        income_df = df[df['type'] == 'income']
        
        insights = []
        
        # === SPENDING SUMMARY ===
        total_spending = expenses_df['amount'].sum() if len(expenses_df) > 0 else 0
        total_income = income_df['amount'].sum() if len(income_df) > 0 else 0
        
        if len(expenses_df) > 0:
            avg_daily = expenses_df['amount'].sum() / len(expenses_df)
            avg_monthly = avg_daily * 30
            
            insights.append({
                "type": "summary",
                "message": f"💰 Your average transaction is ₹{avg_daily:.2f}. Based on {len(expenses_df)} transactions totaling ₹{total_spending:,.2f}.",
                "severity": "low"
            })
        
        # === SAVINGS RATE ===
        if total_income > 0:
            savings_rate = ((total_income - total_spending) / total_income) * 100
            if savings_rate > 20:
                insights.append({
                    "type": "savings",
                    "message": f"🎉 Excellent! You're saving {savings_rate:.1f}% of your income. Keep up the great financial discipline!",
                    "severity": "low"
                })
            elif savings_rate < 0:
                insights.append({
                    "type": "overspending",
                    "message": f"⚠️ Alert: You're spending ₹{abs(total_spending - total_income):,.2f} more than you earn. Consider reviewing your expenses.",
                    "severity": "high"
                })
            elif savings_rate < 10:
                insights.append({
                    "type": "recommendation",
                    "message": f"💡 You're saving only {savings_rate:.1f}% of income. Aim for at least 20% to build a healthy emergency fund.",
                    "severity": "medium"
                })
        
        # === TOP CATEGORIES ===
        if len(expenses_df) > 0:
            category_totals = expenses_df.groupby('category')['amount'].sum().sort_values(ascending=False)
            total = category_totals.sum()
            
            for i, (cat, amount) in enumerate(category_totals.head(3).items(), 1):
                percentage = (amount / total * 100) if total > 0 else 0
                insights.append({
                    "type": "category",
                    "message": f"📊 #{i} {cat}: ₹{amount:,.2f} ({percentage:.1f}% of spending)",
                    "severity": "low"
                })
            
            # === TOP CATEGORY OVERSPENDING CHECK ===
            if len(category_totals) > 0:
                top_cat = category_totals.index[0]
                top_amount = category_totals.iloc[0]
                top_percentage = (top_amount / total * 100) if total > 0 else 0
                
                if top_percentage > 40:
                    insights.append({
                        "type": "overspending",
                        "message": f"⚠️ {top_cat} makes up {top_percentage:.1f}% of your spending (₹{top_amount:,.2f}). Consider diversifying your expenses.",
                        "severity": "medium"
                    })
                
                # === SAVINGS RECOMMENDATION ===
                savings = top_amount * 0.10
                insights.append({
                    "type": "recommendation",
                    "message": f"💡 Cut {top_cat} by just 10% and save ₹{savings:,.2f}/month (₹{savings*12:,.2f}/year)!",
                    "severity": "low"
                })
        
        # === SPENDING PATTERNS BY DAY ===
        if len(expenses_df) > 0:
            expenses_df['day_of_week'] = expenses_df['date'].dt.day_name()
            day_avg = expenses_df.groupby('day_of_week')['amount'].sum()
            
            if len(day_avg) > 1:
                max_day = day_avg.idxmax()
                min_day = day_avg.idxmin()
                max_amount = day_avg[max_day]
                min_amount = day_avg[min_day]
                
                insights.append({
                    "type": "pattern",
                    "message": f"📅 You spend most on {max_day}s (₹{max_amount:,.2f}) and least on {min_day}s (₹{min_amount:,.2f})",
                    "severity": "low"
                })
                
                # Weekend vs Weekday analysis
                expenses_df['is_weekend'] = expenses_df['date'].dt.dayofweek.isin([5, 6])
                weekend_spending = expenses_df[expenses_df['is_weekend']]['amount'].sum()
                weekday_spending = expenses_df[~expenses_df['is_weekend']]['amount'].sum()
                
                weekend_days = expenses_df[expenses_df['is_weekend']]['date'].nunique()
                weekday_days = expenses_df[~expenses_df['is_weekend']]['date'].nunique()
                
                if weekend_days > 0 and weekday_days > 0:
                    avg_weekend = weekend_spending / weekend_days
                    avg_weekday = weekday_spending / weekday_days
                    
                    if avg_weekend > avg_weekday * 1.5:
                        insights.append({
                            "type": "pattern",
                            "message": f"🎉 Weekend spending (₹{avg_weekend:,.2f}/day) is {avg_weekend/avg_weekday:.1f}x higher than weekdays (₹{avg_weekday:,.2f}/day). Plan weekend activities wisely!",
                            "severity": "medium"
                        })
        
        # === TRANSACTION FREQUENCY ===
        days_span = (df['date'].max() - df['date'].min()).days + 1
        if days_span > 0:
            daily_avg_transactions = len(df) / days_span
            
            if daily_avg_transactions > 5:
                insights.append({
                    "type": "tip",
                    "message": f"📝 You make {daily_avg_transactions:.1f} transactions per day on average. Consider batching payments to reduce transaction fees.",
                    "severity": "low"
                })
        
        # === MONTH-OVER-MONTH TREND ===
        df['month'] = df['date'].dt.to_period('M')
        monthly_spending = df[df['type'] == 'expense'].groupby('month')['amount'].sum()
        
        if len(monthly_spending) >= 2:
            last_month = monthly_spending.iloc[-1]
            prev_month = monthly_spending.iloc[-2]
            change_pct = ((last_month - prev_month) / prev_month * 100) if prev_month > 0 else 0
            
            if change_pct > 20:
                insights.append({
                    "type": "overspending",
                    "message": f"� Spending up {change_pct:.1f}% this month vs last (₹{last_month:,.2f} vs ₹{prev_month:,.2f}). Review your budget!",
                    "severity": "high"
                })
            elif change_pct < -10:
                insights.append({
                    "type": "savings",
                    "message": f"🎉 Great job! Spending down {abs(change_pct):.1f}% this month (₹{last_month:,.2f} vs ₹{prev_month:,.2f}). Keep it up!",
                    "severity": "low"
                })
        
        # === LARGE TRANSACTION ALERT ===
        if len(expenses_df) > 0:
            avg_amount = expenses_df['amount'].mean()
            large_transactions = expenses_df[expenses_df['amount'] > avg_amount * 3]
            
            if len(large_transactions) > 0:
                large_total = large_transactions['amount'].sum()
                insights.append({
                    "type": "anomaly",
                    "message": f"🔍 Found {len(large_transactions)} large transactions (3x avg) totaling ₹{large_total:,.2f}. Review if these were planned expenses.",
                    "severity": "medium"
                })
        
        # === RECENT ACTIVITY SUMMARY ===
        recent_7_days = expenses_df[expenses_df['date'] >= (df['date'].max() - pd.Timedelta(days=7))]
        if len(recent_7_days) > 0:
            recent_total = recent_7_days['amount'].sum()
            insights.append({
                "type": "summary",
                "message": f"📊 Last 7 days: {len(recent_7_days)} transactions totaling ₹{recent_total:,.2f}",
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

