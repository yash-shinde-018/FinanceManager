import { NextResponse } from 'next/server';

const ML_API_BASE = process.env.NEXT_PUBLIC_ML_API_BASE || 'http://10.230.58.46';

export async function GET() {
  const results = {
    categorization: false,
    prediction: false,
    fraud: false,
    savings: false,
  };

  try {
    const [cat, pred, fraud, sav] = await Promise.allSettled([
      fetch(`${ML_API_BASE}:8000/health`, { method: 'GET' }),
      fetch(`${ML_API_BASE}:8001/health`, { method: 'GET' }),
      fetch(`${ML_API_BASE}:8002/health`, { method: 'GET' }),
      fetch(`${ML_API_BASE}:8003/health`, { method: 'GET' }),
    ]);

    results.categorization = cat.status === 'fulfilled' && cat.value.ok;
    results.prediction = pred.status === 'fulfilled' && pred.value.ok;
    results.fraud = fraud.status === 'fulfilled' && fraud.value.ok;
    results.savings = sav.status === 'fulfilled' && sav.value.ok;
  } catch (error) {
    console.error('Health check error:', error);
  }

  return NextResponse.json(results);
}
