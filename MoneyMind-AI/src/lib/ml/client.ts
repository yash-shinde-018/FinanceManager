// ML API Client for MoneyMind AI
// Connects to the FastAPI ML service

const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

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
    top_3_predictions: [string, number][];
    is_anomaly: boolean;
    anomaly_score?: number;
    anomaly_severity?: string;
    anomaly_explanation?: {
        explanations: string[];
        flags: string[];
        details: Record<string, any>;
    };
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
    private baseUrl: string;

    constructor(baseUrl: string = ML_API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.ok;
        } catch (error) {
            console.error('ML API health check failed:', error);
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

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error categorizing transaction:', error);
            return null;
        }
    }

    async batchCategorize(transactions: MLTransaction[]): Promise<CategorizedTransaction[]> {
        try {
            const response = await fetch(`${this.baseUrl}/batch-categorize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactions),
            });

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status}`);
            }

            const data = await response.json();
            return data.transactions || [];
        } catch (error) {
            console.error('Error batch categorizing:', error);
            return [];
        }
    }

    async getForecast(days: number = 30): Promise<ForecastResponse | null> {
        try {
            const response = await fetch(`${this.baseUrl}/forecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days }),
            });

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting forecast:', error);
            return null;
        }
    }

    async getForecastWithTransactions(transactions: MLTransaction[], days: number = 30): Promise<ForecastResponse | null> {
        try {
            const response = await fetch(`${this.baseUrl}/forecast/user?days=${days}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactions),
            });

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting forecast with transactions:', error);
            return null;
        }
    }

    async getInsights(): Promise<InsightResponse | null> {
        try {
            const response = await fetch(`${this.baseUrl}/insights`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting insights:', error);
            return null;
        }
    }

    async getModelInfo(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/models/info`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting model info:', error);
            return null;
        }
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
    const date = transaction.date instanceof Date
        ? transaction.date.toISOString().split('T')[0]
        : transaction.date;

    return {
        date,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
    };
}
