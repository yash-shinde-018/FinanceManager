import { ML_API_URL } from '@env';

const DEFAULT_ML_API_URL = ML_API_URL || 'http://localhost:8000';

export interface MLTransaction {
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface CategorizedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  is_anomaly: boolean;
  anomaly_score?: number;
  anomaly_severity?: string;
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
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_ML_API_URL) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async categorizeTransaction(transaction: MLTransaction): Promise<CategorizedTransaction | null> {
    try {
      const response = await fetch(`${this.baseUrl}/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error('ML API error');
      return await response.json();
    } catch (error) {
      console.error('Categorization error:', error);
      return null;
    }
  }

  async batchCategorize(transactions: MLTransaction[]): Promise<CategorizedTransaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/batch-categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });
      if (!response.ok) throw new Error('ML API error');
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Batch categorization error:', error);
      return [];
    }
  }

  async getForecast(transactions: MLTransaction[], days: number = 30): Promise<ForecastResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/forecast/user?days=${days}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactions),
      });
      if (!response.ok) throw new Error('ML API error');
      return await response.json();
    } catch (error) {
      console.error('Forecast error:', error);
      return null;
    }
  }

  async getInsights(): Promise<Insight[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/insights`);
      if (!response.ok) throw new Error('ML API error');
      const data = await response.json();
      return data.insights || [];
    } catch (error) {
      console.error('Insights error:', error);
      return null;
    }
  }

  async getModelInfo(): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/models/info`);
      if (!response.ok) throw new Error('ML API error');
      return await response.json();
    } catch (error) {
      console.error('Model info error:', error);
      return null;
    }
  }
}

export const mlClient = new MLClient();
