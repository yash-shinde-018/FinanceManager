import { NextRequest, NextResponse } from 'next/server';

const ML_API_BASE = process.env.NEXT_PUBLIC_ML_API_BASE || 'http://10.230.58.46';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${ML_API_BASE}:8003/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Savings recommendation API error:', error);
    return NextResponse.json(
      { error: 'Failed to get savings recommendations' },
      { status: 500 }
    );
  }
}
