import axios from 'axios';

const FRAUD_API_URL = process.env.REACT_APP_FRAUD_API_URL || 'http://localhost:8000';

export interface FraudCheckResult {
  status: 'Normal' | 'Suspicious' | 'Fraud';
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  amount: number;
  reasons: string[];
  location_check: string;
  velocity_check: string;
  device_check: string;
  merchant_check: string;
  time_check: string;
}

export interface FraudCheckParams {
  user_id: string;
  amount: number;
  merchant: string;
  category: string;
  location: string;
  device_id?: string;
}

/**
 * Check transaction for fraud
 */
export async function detectFraud(params: FraudCheckParams): Promise<FraudCheckResult> {
  try {
    const response = await axios.post(`${FRAUD_API_URL}/api/fraud/check`, {
      user_id: params.user_id,
      amount: params.amount,
      merchant: params.merchant,
      category: params.category,
      location: params.location,
      device_id: params.device_id || 'unknown'
    });

    return response.data;
  } catch (error) {
    console.error('Fraud detection error:', error);
    // Return safe default on error
    return {
      status: 'Normal',
      risk_score: 0,
      risk_level: 'low',
      amount: params.amount,
      reasons: ['Unable to verify - proceeding with caution'],
      location_check: 'unknown',
      velocity_check: 'unknown',
      device_check: 'unknown',
      merchant_check: 'unknown',
      time_check: 'unknown'
    };
  }
}

/**
 * Get risk icon based on status
 */
export function getRiskIcon(status: string): string {
  switch (status) {
    case 'Fraud':
      return '⚠️';
    case 'Suspicious':
      return '🔍';
    default:
      return '✅';
  }
}

/**
 * Get risk color for UI
 */
export function getRiskColor(status: string): string {
  switch (status) {
    case 'Fraud':
      return '#ef4444'; // red-500
    case 'Suspicious':
      return '#f59e0b'; // amber-500
    default:
      return '#22c55e'; // green-500
  }
}

/**
 * Get risk level text
 */
export function getRiskLevelText(riskScore: number): string {
  if (riskScore >= 80) return 'High Risk';
  if (riskScore >= 50) return 'Medium Risk';
  if (riskScore >= 20) return 'Low Risk';
  return 'Very Low Risk';
}
