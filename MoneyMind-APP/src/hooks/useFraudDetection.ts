import { useState, useCallback } from 'react';
import { detectFraud, FraudCheckResult, FraudCheckParams } from '@/lib/fraud-detection';

interface UseFraudDetectionReturn {
  result: FraudCheckResult | null;
  isChecking: boolean;
  isSuspicious: boolean;
  checkTransaction: (params: FraudCheckParams) => Promise<FraudCheckResult | null>;
  reset: () => void;
}

export function useFraudDetection(): UseFraudDetectionReturn {
  const [result, setResult] = useState<FraudCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkTransaction = useCallback(async (params: FraudCheckParams): Promise<FraudCheckResult | null> => {
    setIsChecking(true);
    try {
      const fraudResult = await detectFraud(params);
      setResult(fraudResult);
      return fraudResult;
    } catch (error) {
      console.error('Error checking fraud:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsChecking(false);
  }, []);

  const isSuspicious = result !== null && (result.status === 'Fraud' || result.status === 'Suspicious');

  return {
    result,
    isChecking,
    isSuspicious,
    checkTransaction,
    reset,
  };
}
