// ML API Client for MoneyMind AI Mobile App
// Connects to 4 separate FastAPI ML services

const ML_API_BASE = 'http://10.230.58.46';

const API_ENDPOINTS = {
  categorize: `${ML_API_BASE}:8000/predict`,
  categorizeBatch: `${ML_API_BASE}:8000/predict/batch`,
  detectFraud: `${ML_API_BASE}:8002/detect`,
  predictSpending: `${ML_API_BASE}:8001/predict`,
  getSavingsInsights: `${ML_API_BASE}:8003/analyze`,
  healthCategorize: `${ML_API_BASE}:8000/health`,
  healthFraud: `${ML_API_BASE}:8002/health`,
  healthPrediction: `${ML_API_BASE}:8001/health`,
  healthSavings: `${ML_API_BASE}:8003/health`,
};

export interface MLTransaction {
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface CategorizationRequest {
  description: string;
  merchant: string;
  amount: number;
  transaction_type: 'Debit' | 'Credit';
}

export interface CategorizationResponse {
  predicted_category: string;
  confidence: number;
  top_3_predictions: Array<{ category: string; confidence: number }>;
}

export interface FraudDetectionRequest {
  transaction_id: number;
  date: string;
  description: string;
  amount: number;
  transaction_type: 'Debit' | 'Credit';
  category: string;
}

export interface FraudDetectionResponse {
  status: 'Normal' | 'Suspicious';
  anomaly_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  reason_flags: string[];
  model_used: string;
}

export interface MonthlyData {
  date: string;
  total_expense: number;
  total_income: number;
  expense_food: number;
  expense_travel: number;
  expense_bills: number;
  expense_emi: number;
  expense_shopping: number;
  expense_investment: number;
  expense_healthcare: number;
  expense_entertainment: number;
  expense_subscription: number;
  expense_transfer: number;
  expense_others: number;
}

export interface SpendingPredictionResponse {
  prediction: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  model_used: string;
  model_accuracy: string;
  model_mape: string;
}

export interface SavingsAnalysisRequest {
  income: number;
  expense: number;
  savings: number;
  food_spending: number;
  subscription_spending: number;
  emi_spending: number;
  investment_spending: number;
  volatility: number;
}

export interface SavingsAnalysisResponse {
  behavior_class: string;
  financial_health_score: number;
  score_interpretation: string;
  score_message: string;
  risk_level: string;
  recommendations: string[];
  score_breakdown: {
    savings_score: number;
    debt_score: number;
    expense_score: number;
    investment_score: number;
    volatility_score: number;
  };
  triggered_rules: string[];
  cluster_id: number;
}

export interface CategorizedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  is_anomaly: boolean;
  anomaly_score?: number;
  risk_level?: string;
}

export interface ForecastResponse {
  dates: string[];
  forecast: number[];
  lower_bound: number[];
  upper_bound: number[];
  model_used: string;
  total_predicted: number;
  days_of_data?: number;
  status?: 'ok' | 'early_stage' | 'insufficient_data';
}

export interface Insight {
  type: string;
  message: string;
  severity?: string;
}

class MLClient {
  private async fetchWithFallback(url: string, options: RequestInit): Promise<Response | null> {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      console.warn(`URL failed: ${url}`, error);
    }
    return null;
  }

  async healthCheck(): Promise<{
    categorize: boolean;
    fraud: boolean;
    prediction: boolean;
    savings: boolean;
  }> {
    const results = { categorize: false, fraud: false, prediction: false, savings: false };

    try {
      const res1 = await fetch(API_ENDPOINTS.healthCategorize);
      results.categorize = res1.ok;
    } catch (e) {
      console.error('Categorization API health check failed:', e);
    }

    try {
      const res2 = await fetch(API_ENDPOINTS.healthFraud);
      results.fraud = res2.ok;
    } catch (e) {
      console.error('Fraud API health check failed:', e);
    }

    try {
      const res3 = await fetch(API_ENDPOINTS.healthPrediction);
      results.prediction = res3.ok;
    } catch (e) {
      console.error('Prediction API health check failed:', e);
    }

    try {
      const res4 = await fetch(API_ENDPOINTS.healthSavings);
      results.savings = res4.ok;
    } catch (e) {
      console.error('Savings API health check failed:', e);
    }

    return results;
  }

  async categorizeTransaction(transaction: MLTransaction): Promise<CategorizedTransaction | null> {
    const requestBody: CategorizationRequest = {
      description: transaction.description,
      merchant: '',
      amount: transaction.amount,
      transaction_type: transaction.amount < 0 ? 'Debit' : 'Credit',
    };

    const response = await this.fetchWithFallback(API_ENDPOINTS.categorize, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response) {
      console.error('Categorization failed - no response');
      return null;
    }

    try {
      const data: CategorizationResponse = await response.json();
      return {
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        category: data.predicted_category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
        confidence: data.confidence,
        is_anomaly: false,
      };
    } catch (error) {
      console.error('Error parsing categorization response:', error);
      return null;
    }
  }

  async batchCategorize(transactions: MLTransaction[]): Promise<CategorizedTransaction[]> {
    const requestBody = {
      transactions: transactions.map((t) => ({
        description: t.description,
        merchant: '',
        amount: t.amount,
        transaction_type: t.amount < 0 ? 'Debit' : 'Credit',
      })),
    };

    const response = await this.fetchWithFallback(API_ENDPOINTS.categorizeBatch, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response) {
      console.error('Batch categorization failed - no response');
      return [];
    }

    try {
      const data = await response.json();
      return data.predictions || [];
    } catch (error) {
      console.error('Error parsing batch response:', error);
      return [];
    }
  }

  async detectFraud(transaction: MLTransaction & { id: number; transaction_type?: 'Debit' | 'Credit' }): Promise<FraudDetectionResponse | null> {
    const requestBody: FraudDetectionRequest = {
      transaction_id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      transaction_type: transaction.transaction_type || (transaction.amount < 0 ? 'Debit' : 'Credit'),
      category: transaction.category || 'other',
    };

    const response = await this.fetchWithFallback(API_ENDPOINTS.detectFraud, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response) {
      console.error('Fraud detection failed - no response');
      return null;
    }

    try {
      return await response.json();
    } catch (error) {
      console.error('Error parsing fraud response:', error);
      return null;
    }
  }

  async predictSpending(monthlyData: MonthlyData[]): Promise<SpendingPredictionResponse | null> {
    if (monthlyData.length < 3) {
      console.warn('Need at least 3 months of data for prediction');
      return null;
    }

    const response = await this.fetchWithFallback(API_ENDPOINTS.predictSpending, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_data: monthlyData }),
    });

    if (!response) {
      console.error('Spending prediction failed - no response');
      return null;
    }

    try {
      return await response.json();
    } catch (error) {
      console.error('Error parsing prediction response:', error);
      return null;
    }
  }

  async getSavingsInsights(data: SavingsAnalysisRequest): Promise<SavingsAnalysisResponse | null> {
    const response = await this.fetchWithFallback(API_ENDPOINTS.getSavingsInsights, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response) {
      console.error('Savings insights failed - no response');
      return null;
    }

    try {
      return await response.json();
    } catch (error) {
      console.error('Error parsing savings response:', error);
      return null;
    }
  }

  // Legacy methods for backward compatibility
  async getForecast(transactions: MLTransaction[], days: number = 30): Promise<ForecastResponse | null> {
    console.warn('getForecast is deprecated, use predictSpending with monthly data instead');
    return null;
  }

  async getInsights(): Promise<Insight[] | null> {
    console.warn('getInsights is deprecated, use getSavingsInsights instead');
    return null;
  }

  async generateInsights(transactions: MLTransaction[]): Promise<Insight[] | null> {
    console.warn('generateInsights is deprecated, use getSavingsInsights instead');
    return null;
  }

  async getModelInfo(): Promise<any | null> {
    return {
      categorize: { endpoint: API_ENDPOINTS.categorize, port: 8000 },
      fraud: { endpoint: API_ENDPOINTS.detectFraud, port: 8002 },
      prediction: { endpoint: API_ENDPOINTS.predictSpending, port: 8001 },
      savings: { endpoint: API_ENDPOINTS.getSavingsInsights, port: 8003 },
    };
  }
}

export const mlClient = new MLClient();
