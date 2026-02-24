# MoneyMind AI - Quick Start Guide

Get up and running in 5 minutes!

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup (Easiest)

1. **Double-click `START_ALL.bat`** in the root folder
   - This will automatically start both ML API and Frontend
   - Wait for both servers to start

2. **Open your browser:**
   - Frontend: http://localhost:3000
   - ML API Docs: http://localhost:8000/docs

3. **Done!** 🎉

### Option 2: Manual Setup

#### Step 1: Start ML API

```bash
cd MoneyMind-ML
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python data_generator.py
python train_all_models.py
python ml_api_v2.py
```

ML API will be at: http://localhost:8000

#### Step 2: Start Frontend

```bash
cd MoneyMind-AI
npm install
copy .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Frontend will be at: http://localhost:3000

## ✅ Verify Integration

### Test 1: ML API Health
Open: http://localhost:8000/health

Should see:
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

### Test 2: Interactive API Docs
Open: http://localhost:8000/docs

Try the `/categorize` endpoint with:
```json
{
  "date": "2026-02-22",
  "description": "swiggy biryani order",
  "amount": -450.50
}
```

### Test 3: Frontend Features

1. **Register/Login** at http://localhost:3000
2. **Go to Dashboard**
3. **Click "Add Transaction"**
4. **Type:** "swiggy dinner"
5. **Watch:** AI suggests "Food & Dining" category! ✨

## 🎯 Key Features to Test

### 1. Auto-Categorization
- Add transaction with description
- AI suggests category automatically
- Shows confidence percentage

### 2. Anomaly Detection
- Add large transaction (e.g., ₹50,000)
- System flags as unusual
- Creates notification

### 3. Spending Forecast
- View dashboard
- See 30-day prediction chart
- Confidence bands shown

### 4. AI Insights
- Check insights panel on dashboard
- See personalized recommendations
- Spending patterns analysis

## 🔧 Troubleshooting

### ML API Won't Start

**Error:** "Module not found"
```bash
cd MoneyMind-ML
pip install -r requirements.txt
```

**Error:** "Models not found"
```bash
python train_all_models.py
```

### Frontend Won't Start

**Error:** "Cannot find module"
```bash
npm install
```

**Error:** "Missing environment variables"
```bash
copy .env.example .env.local
# Edit .env.local with your credentials
```

### Integration Not Working

**Problem:** Category not auto-suggesting

**Solution:**
1. Check ML API is running: http://localhost:8000/health
2. Open browser console (F12)
3. Look for errors
4. Verify `NEXT_PUBLIC_ML_API_URL=http://localhost:8000` in `.env.local`

## 📊 Test Data

The system comes with 5,000 synthetic transactions for testing:
- Indian merchants (Swiggy, Zomato, Flipkart, etc.)
- Realistic amounts in INR
- 9 categories
- 12 months of data

## 🎓 Next Steps

1. ✅ Complete Supabase setup (see README.md)
2. ✅ Add your first real transaction
3. ✅ Explore AI insights
4. ✅ Check spending forecast
5. ✅ Review anomaly detection

## 📚 Documentation

- **Full Integration Guide:** `INTEGRATION_GUIDE.md`
- **Frontend README:** `MoneyMind-AI/README.md`
- **ML API Docs:** http://localhost:8000/docs (when running)

## 🆘 Need Help?

1. Check browser console (F12)
2. Check ML API logs in terminal
3. Review `INTEGRATION_GUIDE.md`
4. Test endpoints at http://localhost:8000/docs

## 🎉 You're All Set!

Your AI-powered personal finance manager is ready to use!

**Happy Tracking! 💰**
