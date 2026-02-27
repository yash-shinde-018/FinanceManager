// ML API Client for MoneyMind AI
// Connects to 4 separate FastAPI ML services

const ML_API_BASE = 'http://10.230.58.46';

const API_ENDPOINTS = {
  categorize: `${ML_API_BASE}:8000/predict`,
  categorizeBatch: `${ML_API_BASE}:8000/predict/batch`,
  detectFraud: `${ML_API_BASE}:8002/`,
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

export interface SpendingPredictionRequest {
  monthly_data: MonthlyData[];
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
  predicted_expense: number;
  prediction?: number; // fallback/alias
  confidence_interval: [number, number] | { lower: number; upper: number };
  mape?: number;
  model_used: string;
  model_accuracy?: string;
  model_mape?: string;
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
    savings_rate_score?: number;
    debt_ratio_score?: number;
    expense_ratio_score?: number;
    investment_rate_score?: number;
    volatility_score?: number;
    savings_score?: number;
    debt_score?: number;
    expense_score?: number;
    investment_score?: number;
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
  top_3_predictions: [string, number][];
  is_anomaly: boolean;
  anomaly_score?: number;
  anomaly_severity?: string;
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
  min_days_required?: number;
  full_model_days?: number;
  status?: 'ok' | 'early_stage' | 'insufficient_data';
}

export interface Insight {
  type: string;
  message: string;
  severity?: string;
}

export interface InsightResponse {
  insights: Insight[];
  generated_at: string;
}

class MLClient {
  private async fetchWithFallback(
    url: string,
    options: RequestInit
  ): Promise<Response | null> {
    try {
      const response = await fetch(url, { ...options, mode: 'cors' });
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
      const res1 = await fetch(API_ENDPOINTS.healthCategorize, { mode: 'cors' });
      results.categorize = res1.ok;
    } catch (e) {
      console.error('Categorization API health check failed:', e);
    }

    try {
      const res2 = await fetch(API_ENDPOINTS.healthFraud, { mode: 'cors' });
      results.fraud = res2.ok;
    } catch (e) {
      console.log('Fraud API health check failed - service may be down');
      results.fraud = false;
    }

    try {
      const res3 = await fetch(API_ENDPOINTS.healthPrediction, { mode: 'cors' });
      results.prediction = res3.ok;
    } catch (e) {
      console.log('Prediction API health check failed - service may be down');
      results.prediction = false;
    }

    try {
      const res4 = await fetch(API_ENDPOINTS.healthSavings, { mode: 'cors' });
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
        top_3_predictions: data.top_3_predictions.map(
          (p) =>
            [
              p.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'),
              p.confidence,
            ] as [string, number]
        ),
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

  async detectFraud(transaction: MLTransaction & { id: number }): Promise<FraudDetectionResponse | null> {
    // Temporarily disabled to prevent API errors
    console.log('Fraud detection API temporarily disabled');
    return null;
  }

  async predictSpending(monthlyData: MonthlyData[]): Promise<SpendingPredictionResponse | null> {
    console.log('predictSpending called with', monthlyData.length, 'months');
    
    if (monthlyData.length < 12) {
      console.warn('Need at least 12 months of data for prediction, got:', monthlyData.length);
      return null;
    }

    const url = API_ENDPOINTS.predictSpending;
    console.log('Calling predictSpending API at:', url);
    console.log('Request body:', JSON.stringify({ monthly_data: monthlyData.slice(0, 2) }, null, 2) + '...');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_data: monthlyData }),
      });
      
      console.log('API Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        return null;
      }

      const result = await response.json();
      console.log('Spending prediction result:', result);
      console.log('Raw predicted_expense:', result.predicted_expense, 'Type:', typeof result.predicted_expense);
      console.log('Raw confidence_interval:', result.confidence_interval);
      console.log('Full response keys:', Object.keys(result));
      
      // Normalize the response to match expected format
      const normalizedResult: SpendingPredictionResponse = {
        ...result,
        // Map predicted_expense to prediction for compatibility
        prediction: result.predicted_expense ?? result.prediction,
        // Handle confidence_interval as array [lower, upper] or object
        confidence_interval: Array.isArray(result.confidence_interval) 
          ? { lower: result.confidence_interval[0], upper: result.confidence_interval[1] }
          : result.confidence_interval,
        model_accuracy: result.model_accuracy || `${result.mape?.toFixed(2) || 'N/A'}%`,
        model_mape: result.model_mape || `${result.mape?.toFixed(2) || 'N/A'}%`,
      };
      
      console.log('Normalized prediction:', normalizedResult.prediction);
      return normalizedResult;
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  }

  async getSavingsInsights(data: SavingsAnalysisRequest): Promise<SavingsAnalysisResponse | null> {
    const url = API_ENDPOINTS.getSavingsInsights;
    console.log('Calling getSavingsInsights API at:', url);
    console.log('Savings request body:', JSON.stringify(data));

    const response = await this.fetchWithFallback(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response) {
      console.error('Savings insights failed - no response');
      return null;
    }

    console.log('Savings API Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Savings API Error response:', errorText);
      return null;
    }

    try {
      const result = (await response.json()) as SavingsAnalysisResponse;
      console.log('Savings insights result:', result);
      console.log('Savings recommendations count:', result?.recommendations?.length);
      return result;
    } catch (error) {
      console.error('Error parsing savings response:', error);
      return null;
    }
  }

  // Legacy method for backward compatibility
  async getForecast(days: number = 30): Promise<ForecastResponse | null> {
    console.warn('getForecast is deprecated, use predictSpending with monthly data instead');
    return null;
  }

  // Legacy method for backward compatibility
  async getForecastWithTransactions(
    transactions: MLTransaction[],
    days: number = 30
  ): Promise<ForecastResponse | null> {
    console.warn('getForecastWithTransactions is deprecated, use predictSpending instead');
    return null;
  }

  // Legacy method - now uses savings insights
  async getInsights(): Promise<InsightResponse | null> {
    console.warn('getInsights is deprecated, use getSavingsInsights instead');
    return null;
  }

  // Legacy method - now uses savings insights
  async generateInsights(transactions: MLTransaction[]): Promise<InsightResponse | null> {
    console.warn('generateInsights is deprecated, use getSavingsInsights instead');
    return null;
  }

  // Legacy method
  async getModelInfo(): Promise<any> {
    return {
      categorize: { endpoint: API_ENDPOINTS.categorize, port: 8000 },
      fraud: { endpoint: API_ENDPOINTS.detectFraud, port: 8002 },
      prediction: { endpoint: API_ENDPOINTS.predictSpending, port: 8001 },
      savings: { endpoint: API_ENDPOINTS.getSavingsInsights, port: 8003 },
    };
  }
}

// Export singleton instance
export const mlClient = new MLClient();

// Helper function to format transaction for ML API
export function formatTransactionForML(transaction: {
  date: Date | string;
  description: string;
  amount: number;
  category?: string;
}): MLTransaction {
  const date =
    transaction.date instanceof Date
      ? transaction.date.toISOString().split('T')[0]
      : transaction.date;

  return {
    date,
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
  };
}
