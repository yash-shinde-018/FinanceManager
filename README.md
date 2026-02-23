# MoneyMind AI - Personal Finance Management Platform

An AI-powered personal finance management platform with ML-based insights, transaction categorization, spending forecasts, and an intelligent chatbot.

## 🚀 Features

### Frontend (Next.js 16)
- 📊 **Dashboard** - Real-time financial overview with charts
- 💰 **Transaction Management** - Track income and expenses
- 🎯 **Goals Tracking** - Set and monitor financial goals
- 📈 **Insights** - AI-powered financial insights
- 💼 **Investments** - Portfolio management
- 🏦 **Bank Accounts** - Account linking UI
- 💳 **Budgets** - Category-wise budget management
- 🔔 **Spending Alerts** - Real-time notifications
- 📥 **Import/Export** - CSV data management
- 🤖 **AI Chatbot** - RAG-based financial advisor

### Backend (FastAPI + ML)
- 🤖 **4 ML Models**:
  - Random Forest Classifier - Transaction categorization
  - Isolation Forest - Anomaly detection
  - SARIMAX - Spending forecasting
  - Feature Engineering - Pattern analysis
- 🧠 **AI Chatbot** with RAG (ChromaDB + Groq)
- 📊 **Real-time Analytics**
- 🔄 **Auto-categorization**

## 🛠️ Tech Stack

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Supabase (Auth + Database)

### Backend
- FastAPI
- Python 3.12
- scikit-learn
- statsmodels
- ChromaDB (Vector DB)
- Groq API (Llama 3.3 70B)
- Supabase

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.12+
- Supabase account
- Groq API key (free)

### Frontend Setup

```bash
cd MoneyMind-AI
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run development server:
```bash
npm run dev
```

### Backend Setup

```bash
cd MoneyMind-ML
pip install -r requirements.txt
```

Create `.env`:
```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

Train ML models:
```bash
python train_all_models.py
```

Start ML API:
```bash
python ml_api_v2.py
```

## 🗄️ Database Setup

Run the SQL scripts in Supabase:
1. `setup-complete-rls.sql` - Complete database schema with RLS
2. `fix-goals-rls.sql` - Goals table RLS policies

## 🤖 AI Chatbot Setup

1. Get free Groq API key: https://console.groq.com
2. Add to `.env`: `GROQ_API_KEY=your_key_here`
3. Restart ML API

The chatbot uses:
- **RAG** with ChromaDB for semantic transaction search
- **Groq API** (Llama 3.3 70B) for responses
- **Real-time Supabase data** for personalized advice

## 📊 ML Models

### Transaction Categorization
- Model: Random Forest Classifier
- Accuracy: ~85%
- Categories: Food, Shopping, Transport, Bills, etc.

### Anomaly Detection
- Model: Isolation Forest
- Detects unusual spending patterns

### Spending Forecast
- Model: SARIMAX
- Predicts next 30 days spending

### Feature Engineering
- Extracts patterns from transaction history
- Time-based features, merchant analysis

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd MoneyMind-AI
vercel deploy
```

### Backend (Railway/Render)
```bash
cd MoneyMind-ML
# Deploy using Railway or Render
```

## 📝 API Documentation

ML API runs on `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

### Endpoints
- `POST /categorize` - Categorize transaction
- `POST /forecast` - Get spending forecast
- `POST /insights/generate` - Generate AI insights
- `POST /chat` - Chat with AI advisor
- `GET /chat/health` - Chatbot health check

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- Secure authentication with Supabase
- API key validation

## 📄 License

MIT License

## 👥 Contributors

Built for hackathon submission

## 🙏 Acknowledgments

- Groq for free AI API
- Supabase for backend infrastructure
- Next.js team for amazing framework
