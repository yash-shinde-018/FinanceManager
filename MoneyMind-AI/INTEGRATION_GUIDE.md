# MoneyMind AI - ML Integration Guide

This guide explains how to connect the MoneyMind-AI frontend with the MoneyMind-ML backend.

## Prerequisites

1. **Node.js 18+** installed
2. **Python 3.8+** installed
3. **Supabase account** (free tier works)

## Setup Instructions

### Step 1: Setup ML Backend

1. Navigate to the ML folder:
```bash
cd MoneyMind-ML
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Mac/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Generate training data:
```bash
python data_generator.py
```

5. Train all models:
```bash
python train_all_models.py
```

6. Verify setup:
```bash
python check_setup.py
```

7. Start the ML API server:
```bash
python ml_api_v2.py
```

The ML API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Step 2: Setup Frontend

1. Navigate to the frontend folder:
```bash
cd MoneyMind-AI
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
copy .env.example .env.local  # On Windows
# cp .env.example .env.local  # On Mac/Linux
```

4. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```

5. Setup Supabase database (run SQL from README.md)

6. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing the Integration

### 1. Test ML API Health

Open your browser and visit:
```
http://localhost:8000/health
```

You should see:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "timestamp": "2026-02-22T..."
}
```

### 2. Test API Documentation

Visit the interactive API docs:
```
http://localhost:8000/docs
```

Try the `/categorize` endpoint with:
```json
{
  "date": "2026-02-22",
  "description": "swiggy biryani order",
  "amount": -450.50
}
```

### 3. Test Frontend Integration

1. Open `http://localhost:3000`
2. Register/Login to your account
3. Go to Dashboard
4. Click "Add Transaction"
5. Type a description like "swiggy dinner"
6. Watch the AI suggest a category automatically!

## Features Integrated

### ✅ Auto-Categorization
- Type transaction description
- ML suggests category with confidence score
- Auto-fills if confidence > 70%

### ✅ Anomaly Detection
- Unusual transactions flagged automatically
- Notifications created for anomalies
- Detailed explanations provided

### ✅ Spending Forecast
- 30-day predictions on dashboard
- Confidence intervals shown
- Updates predicted spending card

### ✅ AI Insights
- Personalized recommendations
- Spending patterns analysis
- Savings opportunities
- Category breakdowns

## API Endpoints Used

| Endpoint | Purpose | Used In |
|----------|---------|---------|
| `GET /health` | Check API status | Dashboard load |
| `POST /categorize` | Categorize transaction | Add Transaction Modal |
| `POST /batch-categorize` | Bulk categorization | Import feature |
| `POST /forecast` | Get spending forecast | Dashboard, ForecastChart |
| `GET /insights` | Get AI insights | AIInsightsPanel |
| `GET /models/info` | Model metadata | Settings page |

## Troubleshooting

### ML API Not Connecting

**Problem:** Frontend shows "AI Insights Loading" or forecast doesn't load

**Solution:**
1. Check ML API is running: `http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_ML_API_URL` in `.env.local`
3. Check browser console for CORS errors
4. Restart both servers

### Models Not Found

**Problem:** ML API returns 503 or "Models not loaded"

**Solution:**
1. Run `python train_all_models.py` in MoneyMind-ML folder
2. Verify .pkl files exist: `dir *.pkl`
3. Check `check_setup.py` output

### Category Not Auto-Suggesting

**Problem:** Typing description doesn't suggest category

**Solution:**
1. Type at least 4 characters
2. Wait 500ms for debounce
3. Check browser console for errors
4. Verify ML API is running

### Forecast Shows Fallback Data

**Problem:** Forecast chart shows static data

**Solution:**
1. Ensure SARIMAX model is trained
2. Check `sarimax_model.pkl` exists
3. Add more transactions to database
4. Restart ML API

## Performance Tips

### 1. Model Caching
Models are loaded once at startup and cached in memory. Restart ML API only when models are retrained.

### 2. Batch Operations
Use `/batch-categorize` for importing multiple transactions instead of calling `/categorize` repeatedly.

### 3. Debouncing
Category suggestions are debounced by 500ms to avoid excessive API calls while typing.

### 4. Fallback Data
Frontend gracefully handles ML API downtime by showing fallback data and informative messages.

## Development Workflow

### Making Changes to ML Models

1. Update model code in `MoneyMind-ML/`
2. Retrain: `python train_all_models.py`
3. Restart ML API: `python ml_api_v2.py`
4. Frontend automatically uses new models (no restart needed)

### Adding New ML Features

1. Add endpoint to `ml_api_v2.py`
2. Add client method to `src/lib/ml/client.ts`
3. Use in components via `mlClient.yourMethod()`
4. Handle errors gracefully with fallbacks

## Production Deployment

### ML API

1. Use production WSGI server (Gunicorn):
```bash
pip install gunicorn
gunicorn ml_api_v2:app -w 4 -k uvicorn.workers.UvicornWorker
```

2. Deploy to:
   - Railway
   - Render
   - AWS EC2
   - Google Cloud Run

3. Update `NEXT_PUBLIC_ML_API_URL` to production URL

### Frontend

1. Build for production:
```bash
npm run build
```

2. Deploy to:
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify

3. Set environment variables in deployment platform

## Security Notes

1. **API Keys:** Never commit `.env.local` to git
2. **CORS:** Configure proper CORS origins in production
3. **Rate Limiting:** Add rate limiting to ML API endpoints
4. **Authentication:** Add JWT tokens for ML API in production
5. **HTTPS:** Always use HTTPS in production

## Support

For issues:
1. Check browser console for errors
2. Check ML API logs
3. Verify environment variables
4. Test endpoints in `/docs`
5. Review this guide

## Next Steps

- [ ] Add user-specific model training
- [ ] Implement real-time predictions
- [ ] Add more ML features (budget recommendations, etc.)
- [ ] Optimize model performance
- [ ] Add A/B testing for model improvements

---

**Happy Coding! 🚀**

<!-- cd MoneyMind-ML
pip install langchain langchain-openai openai chromadb supabase python-dotenv
 -->