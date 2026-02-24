# AI Finance Chatbot Setup Guide

## Overview
The MoneyMind AI Chatbot uses:
- **LLM**: OpenAI GPT-3.5-turbo for natural language understanding
- **RAG**: Retrieval Augmented Generation with financial knowledge base
- **Database**: Supabase for real-time user data
- **Vector Store**: ChromaDB for semantic search

## Prerequisites
1. Python 3.9+
2. OpenAI API Key
3. Supabase credentials (already configured)

## Step 1: Install Dependencies

```bash
cd MoneyMind-ML
pip install -r requirements.txt
```

## Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

**Cost**: 
- Free tier: $5 credit (enough for 2500+ messages)
- After free tier: ~$0.002 per message
- For hackathon demo: Free tier is sufficient

## Step 3: Configure Environment Variables

Edit `MoneyMind-ML/.env`:

```bash
# Add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-key-here

# Supabase (already configured)
SUPABASE_URL=https://azkvilisrqaevvhhdrly.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Start the ML API

```bash
cd MoneyMind-ML
python ml_api_v2.py
```

The API will start on http://localhost:8000

## Step 5: Test the Chatbot

### Check Health
```bash
curl http://localhost:8000/chat/health
```

Expected response:
```json
{
  "status": "healthy",
  "chatbot_ready": true,
  "supabase_connected": true,
  "openai_configured": true
}
```

### Test Chat (replace USER_ID with actual user ID from Supabase)
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-id",
    "message": "How much did I spend last month?"
  }'
```

## Step 6: Use in Frontend

The chatbot is already integrated! Just:

1. Start the Next.js app:
```bash
cd MoneyMind-AI
npm run dev
```

2. Login to your account
3. Look for the floating chat button (bottom-right corner)
4. Click and start chatting!

## Features

### 1. General Finance Questions
- "What is a mutual fund?"
- "How to save for retirement?"
- "Best investment strategies"
- "Explain the 50/30/20 rule"

### 2. User-Specific Queries
- "How much did I spend last month?"
- "What's my top spending category?"
- "Am I on track with my goals?"
- "Show me my savings rate"

### 3. Personalized Advice
- "How can I save more money?"
- "Should I invest in stocks or FD?"
- "Give me budget recommendations"
- "Analyze my spending patterns"

## How It Works

1. **User asks a question** → Frontend sends to `/chat` endpoint
2. **Fetch user data** → Chatbot queries Supabase for transactions, goals, budgets
3. **RAG retrieval** → Searches financial knowledge base for relevant info
4. **Context building** → Combines user data + financial knowledge
5. **LLM generation** → GPT-3.5 generates personalized response
6. **Response** → Sent back to frontend and displayed

## Troubleshooting

### "Chatbot not configured" error
- Make sure `OPENAI_API_KEY` is set in `.env`
- Restart the ML API after adding the key

### "Failed to get response" error
- Check if ML API is running on port 8000
- Verify OpenAI API key is valid
- Check internet connection

### Slow responses
- First message takes 2-3 seconds (loading models)
- Subsequent messages: 1-2 seconds
- Consider upgrading to GPT-4 for better quality (but slower)

### Rate limit errors
- Free tier: 3 requests/minute
- Paid tier: 3500 requests/minute
- Add retry logic if needed

## Customization

### Add More Financial Knowledge
Edit `finance_chatbot.py` → `FINANCE_KNOWLEDGE` list:

```python
FINANCE_KNOWLEDGE = [
    "Your custom financial tip here",
    "Another investment strategy",
    # Add 100+ tips for better RAG
]
```

### Change LLM Model
Edit `finance_chatbot.py`:

```python
self.llm = ChatOpenAI(
    model="gpt-4",  # Better quality, slower, more expensive
    temperature=0.7,
    openai_api_key=openai_api_key
)
```

### Adjust Response Style
Edit system prompt in `finance_chatbot.py` → `chat()` method

## Alternative: Free Open Source Option

If you don't want to use OpenAI (paid), use Ollama (free):

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Download Llama 3.1
ollama pull llama3.1:8b

# Update finance_chatbot.py
from langchain.llms import Ollama
self.llm = Ollama(model="llama3.1:8b")
```

**Pros**: Free, private, no API limits
**Cons**: Requires 8GB+ RAM, slower responses, lower quality

## API Documentation

### POST /chat
```json
{
  "user_id": "string",
  "message": "string",
  "conversation_history": [
    {"role": "user", "content": "previous message"},
    {"role": "assistant", "content": "previous response"}
  ]
}
```

Response:
```json
{
  "response": "AI generated response",
  "user_data_used": true,
  "knowledge_retrieved": true,
  "timestamp": "2026-02-23T10:30:00"
}
```

### GET /chat/health
Response:
```json
{
  "status": "healthy",
  "chatbot_ready": true,
  "supabase_connected": true,
  "openai_configured": true
}
```

## Support

For issues:
1. Check ML API logs
2. Verify environment variables
3. Test with curl commands
4. Check OpenAI API status: https://status.openai.com/

## Next Steps

1. Add conversation memory to database
2. Implement voice input/output
3. Add chart generation in responses
4. Multi-language support
5. Fine-tune on Indian finance data
