# finance_chatbot.py
"""
AI Finance Chatbot with RAG (Retrieval Augmented Generation)
Uses ChromaDB vector database for intelligent transaction retrieval
Integrates with Supabase for real-time user data
Uses Groq API - FREE and FAST
"""

import os
from typing import List, Dict, Any
from datetime import datetime, timedelta
from supabase import create_client, Client
from openai import OpenAI
import chromadb
from chromadb.config import Settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Financial Knowledge Base
FINANCE_KNOWLEDGE = """
BUDGETING:
- The 50/30/20 budgeting rule: Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.
- Zero-based budgeting: Assign every rupee a purpose, ensuring income minus expenses equals zero.
- Emergency fund: Save 3-6 months of living expenses for unexpected situations.

SAVINGS:
- Pay yourself first: Automatically transfer savings before spending on other expenses.
- High-yield savings accounts offer better interest rates than regular savings accounts.
- Fixed deposits (FDs) provide guaranteed returns and are low-risk investment options.

INVESTMENTS:
- Diversification: Don't put all eggs in one basket. Spread investments across stocks, bonds, gold, and real estate.
- Mutual funds pool money from multiple investors to invest in diversified portfolios.
- SIP (Systematic Investment Plan): Invest fixed amounts regularly in mutual funds to benefit from rupee cost averaging.
- Index funds track market indices and typically have lower fees than actively managed funds.
- PPF (Public Provident Fund): Tax-free returns with 15-year lock-in period, backed by government.

DEBT MANAGEMENT:
- Debt avalanche method: Pay off high-interest debts first to minimize interest payments.
- Debt snowball method: Pay off smallest debts first for psychological wins.
- Credit card debt typically has the highest interest rates (18-36% annually).
- Good debt vs bad debt: Education loans and home loans are considered good debt.

TAX PLANNING:
- Section 80C: Deductions up to ₹1.5 lakh for investments in PPF, ELSS, life insurance, etc.
- Section 80D: Deductions for health insurance premiums.
- Tax-saving FDs have 5-year lock-in period and qualify for 80C deductions.

INSURANCE:
- Term insurance provides high coverage at low premiums, ideal for income protection.
- Health insurance is essential to protect against medical emergencies.
- Life insurance coverage should be 10-15 times your annual income.

RETIREMENT PLANNING:
- Start retirement planning early to benefit from compound interest.
- NPS (National Pension System): Tax-efficient retirement savings with market-linked returns.
- Retirement corpus should be 25-30 times your annual expenses.

CREDIT SCORE:
- Credit score ranges from 300-900. Above 750 is considered excellent.
- Pay credit card bills on time to maintain good credit score.
- Credit utilization should be below 30% of available credit limit.

FINANCIAL GOALS:
- SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound.
- Short-term goals (1-3 years): Emergency fund, vacation, gadgets.
- Long-term goals (5+ years): Home purchase, retirement, children's education.

INDIAN MARKET SPECIFIC:
- Equity Linked Savings Scheme (ELSS): Tax-saving mutual funds with 3-year lock-in.
- Gold bonds: Government-backed alternative to physical gold with 2.5% annual interest.
- Sukanya Samriddhi Yojana: High-interest savings scheme for girl child education.
"""

class FinanceChatbot:
    def __init__(self, groq_api_key: str, supabase_url: str, supabase_key: str):
        """Initialize chatbot with Groq, Supabase, and ChromaDB"""
        
        # Initialize Supabase client
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Initialize Groq client (uses OpenAI-compatible API)
        self.client = OpenAI(
            api_key=groq_api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        
        # Initialize ChromaDB with persistent storage
        import chromadb
        chroma_db_path = os.path.join(os.path.dirname(__file__), "chroma_db")
        os.makedirs(chroma_db_path, exist_ok=True)
        
        self.chroma_client = chromadb.PersistentClient(
            path=chroma_db_path,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Cache for indexed users (to avoid re-indexing)
        self._indexed_users: Dict[str, int] = {}
        
        logger.info("Finance Chatbot initialized successfully with Groq and persistent ChromaDB")
    
    def get_user_data(self, user_id: str) -> Dict[str, Any]:
        """Fetch user's financial data from Supabase"""
        try:
            logger.info(f"Fetching data for user_id: {user_id}")
            
            # Get transactions
            transactions_response = self.supabase.table('transactions').select('*').eq('user_id', user_id).execute()
            transactions = transactions_response.data if transactions_response.data else []
            
            logger.info(f"Found {len(transactions)} transactions for user {user_id}")
            
            # Get goals
            goals_response = self.supabase.table('goals').select('*').eq('user_id', user_id).execute()
            goals = goals_response.data if goals_response.data else []
            
            logger.info(f"Found {len(goals)} goals for user {user_id}")
            
            # Calculate statistics
            total_income = sum(float(t['amount']) for t in transactions if t['type'] == 'income')
            total_expense = sum(float(t['amount']) for t in transactions if t['type'] == 'expense')
            
            logger.info(f"Total income: ₹{total_income}, Total expense: ₹{total_expense}")
            
            # Last 30 days spending
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            recent_expenses = [t for t in transactions if t['type'] == 'expense' and t['occurred_at'] >= thirty_days_ago]
            monthly_spending = sum(float(t['amount']) for t in recent_expenses)
            
            # Category breakdown
            category_spending = {}
            for t in transactions:
                if t['type'] == 'expense':
                    cat = t.get('category', 'Other')
                    category_spending[cat] = category_spending.get(cat, 0) + float(t['amount'])
            
            top_category = max(category_spending.items(), key=lambda x: x[1]) if category_spending else ('None', 0)
            
            # Goals progress
            total_goal_target = sum(float(g['target_amount']) for g in goals)
            total_goal_saved = sum(float(g['current_amount']) for g in goals)
            
            return {
                'total_transactions': len(transactions),
                'total_income': total_income,
                'total_expense': total_expense,
                'balance': total_income - total_expense,
                'monthly_spending': monthly_spending,
                'top_category': top_category[0],
                'top_category_amount': top_category[1],
                'active_goals': len(goals),
                'total_goal_target': total_goal_target,
                'total_goal_saved': total_goal_saved,
                'goal_progress': (total_goal_saved / total_goal_target * 100) if total_goal_target > 0 else 0,
                'savings_rate': ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0,
                'transactions': transactions,
                'goals': goals,
                'category_spending': category_spending
            }
        except Exception as e:
            logger.error(f"Error fetching user data: {e}")
            return {}
    
    def index_user_transactions(self, user_id: str, transactions: List[Dict]) -> None:
        """Index user transactions in ChromaDB for semantic search (with caching)"""
        try:
            if not transactions:
                logger.info("No transactions to index")
                return
            
            collection_name = f"user_{user_id.replace('-', '_')}_transactions"
            
            # Create a hash of transactions to check if re-indexing is needed
            current_hash = hash(str(sorted([(t.get('id'), t.get('updated_at', t.get('occurred_at'))) for t in transactions[:100]])))
            
            # Check if already indexed with same data
            if user_id in self._indexed_users and self._indexed_users[user_id] == current_hash:
                logger.info(f"Using cached index for user {user_id}")
                return
            
            # Try to get existing collection or create new
            try:
                collection = self.chroma_client.get_collection(name=collection_name)
                # Check if count matches
                if collection.count() == len(transactions):
                    logger.info(f"Collection exists with {len(transactions)} docs for user {user_id}")
                    self._indexed_users[user_id] = current_hash
                    return
                else:
                    # Delete and recreate if count differs
                    self.chroma_client.delete_collection(name=collection_name)
            except:
                pass
            
            # Create new collection
            collection = self.chroma_client.create_collection(
                name=collection_name,
                metadata={"user_id": user_id}
            )
            
            # Batch add documents (more efficient)
            batch_size = 100
            for batch_start in range(0, len(transactions), batch_size):
                batch = transactions[batch_start:batch_start + batch_size]
                
                documents = []
                metadatas = []
                ids = []
                
                for i, txn in enumerate(batch):
                    doc_text = f"{txn['type'].title()} of ₹{txn['amount']} "
                    doc_text += f"in {txn.get('category', 'Other')} category "
                    doc_text += f"at {txn.get('merchant', 'Unknown')} "
                    doc_text += f"on {txn['occurred_at'][:10]} "
                    doc_text += f"- {txn.get('description', 'No description')}"
                    
                    documents.append(doc_text)
                    metadatas.append({
                        'amount': str(txn['amount']),
                        'type': txn['type'],
                        'category': txn.get('category', 'Other'),
                        'merchant': txn.get('merchant', 'Unknown'),
                        'date': txn['occurred_at'][:10]
                    })
                    ids.append(f"txn_{batch_start + i}")
                
                collection.add(documents=documents, metadatas=metadatas, ids=ids)
            
            self._indexed_users[user_id] = current_hash
            logger.info(f"Indexed {len(transactions)} transactions for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error indexing transactions: {e}")
    
    def retrieve_relevant_transactions(self, user_id: str, query: str, n_results: int = 5) -> List[Dict]:
        """Retrieve relevant transactions using semantic search"""
        try:
            collection_name = f"user_{user_id.replace('-', '_')}_transactions"
            
            try:
                collection = self.chroma_client.get_collection(name=collection_name)
            except:
                return []
            
            # Query the collection
            results = collection.query(
                query_texts=[query],
                n_results=min(n_results, collection.count())
            )
            
            if not results['documents'] or not results['documents'][0]:
                return []
            
            # Format results
            relevant_txns = []
            for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
                relevant_txns.append({
                    'description': doc,
                    'amount': metadata['amount'],
                    'type': metadata['type'],
                    'category': metadata['category'],
                    'merchant': metadata['merchant'],
                    'date': metadata['date']
                })
            
            return relevant_txns
            
        except Exception as e:
            logger.error(f"Error retrieving transactions: {e}")
            return []
    
    def build_user_context(self, user_data: Dict[str, Any], relevant_txns: List[Dict] = None) -> str:
        """Build context string from user data and relevant transactions"""
        if not user_data or user_data.get('total_transactions', 0) == 0:
            return "No user data available. User should start tracking expenses in MoneyMind AI app."
        
        context = f"""
USER'S FINANCIAL PROFILE:
- Total Transactions: {user_data.get('total_transactions', 0)}
- Total Income: ₹{user_data.get('total_income', 0):,.2f}
- Total Expenses: ₹{user_data.get('total_expense', 0):,.2f}
- Current Balance: ₹{user_data.get('balance', 0):,.2f}
- Monthly Spending (Last 30 days): ₹{user_data.get('monthly_spending', 0):,.2f}
- Top Spending Category: {user_data.get('top_category', 'N/A')} (₹{user_data.get('top_category_amount', 0):,.2f})
- Savings Rate: {user_data.get('savings_rate', 0):.1f}%
- Active Goals: {user_data.get('active_goals', 0)}
- Goal Progress: {user_data.get('goal_progress', 0):.1f}% (₹{user_data.get('total_goal_saved', 0):,.2f} / ₹{user_data.get('total_goal_target', 0):,.2f})
"""
        
        # Add category breakdown if available
        if user_data.get('category_spending'):
            context += "\nSPENDING BY CATEGORY (All Time):\n"
            for cat, amount in sorted(user_data['category_spending'].items(), key=lambda x: x[1], reverse=True)[:5]:
                context += f"- {cat}: ₹{amount:,.2f}\n"
        
        # Add recent transactions summary
        if user_data.get('transactions'):
            context += f"\nRECENT TRANSACTIONS (Last {min(5, len(user_data['transactions']))}):\n"
            for txn in user_data['transactions'][:5]:
                context += f"- {txn['type'].title()}: ₹{txn['amount']} in {txn.get('category', 'Other')} on {txn['occurred_at'][:10]}\n"
        
        # Add relevant transactions from RAG
        if relevant_txns:
            context += "\nMOST RELEVANT TRANSACTIONS (Retrieved using RAG):\n"
            for txn in relevant_txns[:3]:
                context += f"- {txn['description']}\n"
        
        return context
    
    def chat(self, user_id: str, message: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Main chat function with RAG
        
        Args:
            user_id: User's ID from Supabase auth
            message: User's question
            conversation_history: Previous messages for context
        
        Returns:
            Dict with response and metadata
        """
        try:
            # Get user's real-time data from Supabase
            user_data = self.get_user_data(user_id)
            
            # Index transactions in vector DB
            if user_data.get('transactions'):
                self.index_user_transactions(user_id, user_data['transactions'])
                
                # Retrieve relevant transactions using RAG
                relevant_txns = self.retrieve_relevant_transactions(user_id, message, n_results=5)
            else:
                relevant_txns = []
            
            # Build context with RAG results
            user_context = self.build_user_context(user_data, relevant_txns)
            
            # Build system prompt
            system_prompt = f"""You are MoneyMind AI, an expert financial advisor chatbot for Indian users. You ONLY answer questions related to personal finance, money management, investments, savings, budgeting, taxes, insurance, and financial planning.

FINANCIAL KNOWLEDGE BASE:
{FINANCE_KNOWLEDGE}

{user_context}

YOUR ROLE:
- ONLY answer finance-related questions
- If asked about non-finance topics (sports, entertainment, general knowledge, etc.), politely decline and redirect to financial topics
- Provide personalized financial advice based on user's actual data from Supabase
- Use the retrieved relevant transactions to give specific, data-driven advice
- Use Indian Rupees (₹) for all amounts
- Suggest actionable steps the user can take in the MoneyMind AI app

STRICT RULES:
- If the question is NOT about finance, respond: "I'm MoneyMind AI, your personal finance advisor. I can only help with financial questions like budgeting, investments, savings, taxes, and money management. How can I help you with your finances today?"
- Do NOT answer questions about: sports, movies, celebrities, general knowledge, coding, health, travel, food, etc.
- ONLY discuss: money, investments, savings, budgeting, taxes, insurance, loans, credit cards, financial planning, retirement, goals
- IMPORTANT: If user has transactions (Total Transactions > 0), analyze them and provide insights even if Monthly Spending is ₹0
- If Total Expenses > 0, acknowledge their spending and provide advice based on actual amounts
- Reference specific transaction amounts, categories, and dates when available

GUIDELINES:
- Keep responses concise (max 3-4 sentences)
- Always reference user's actual data when giving personalized advice
- Mention specific transactions when relevant (e.g., "Your ₹10,000 Food & Dining expense on Jan 7")
- Format numbers with commas (e.g., ₹1,00,000)
- Be encouraging but realistic
- If Monthly Spending is ₹0 but Total Expenses > 0, explain the transactions are older than 30 days"""
            
            # Build messages for chat
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history if available
            if conversation_history:
                for msg in conversation_history[-5:]:  # Last 5 messages
                    messages.append({
                        "role": msg['role'],
                        "content": msg['content']
                    })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Generate response using Groq (Llama 3.3 70B)
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=400
            )
            
            return {
                'response': response.choices[0].message.content,
                'user_data_used': bool(user_data),
                'knowledge_retrieved': True,
                'rag_transactions_used': len(relevant_txns) if relevant_txns else 0,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return {
                'response': "I apologize, but I encountered an error. Please try again.",
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

# Initialize chatbot instance (will be used by FastAPI)
chatbot_instance = None

def get_chatbot():
    """Get or create chatbot instance"""
    global chatbot_instance
    if chatbot_instance is None:
        groq_key = os.getenv('GROQ_API_KEY')
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not groq_key:
            raise ValueError("GROQ_API_KEY not set in environment. Get free key from https://console.groq.com")
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not set in environment")
        
        chatbot_instance = FinanceChatbot(groq_key, supabase_url, supabase_key)
    
    return chatbot_instance
