const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'NBSOUX4YT6BJMCTA';
const BASE_URL = 'https://www.alphavantage.co/query';

export type PriceData = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
};

export type PriceError = {
  symbol: string;
  error: string;
};

// Rate limiting: Alpha Vantage has 25 requests per day on free tier
// We'll cache results and implement client-side rate limiting
const priceCache: Record<string, { data: PriceData; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pendingRequests: Record<string, Promise<PriceData | PriceError>> = {};

export async function fetchStockPrice(symbol: string): Promise<PriceData | PriceError> {
  const cacheKey = symbol.toUpperCase();
  
  // Check cache
  const cached = priceCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Check for pending request (deduplication)
  if (cacheKey in pendingRequests) {
    return pendingRequests[cacheKey];
  }

  const request = fetchPriceInternal(symbol);
  pendingRequests[cacheKey] = request;

  try {
    const result = await request;
    
    // Cache successful results
    if ('price' in result) {
      priceCache[cacheKey] = { data: result, timestamp: Date.now() };
    }
    
    return result;
  } finally {
    delete pendingRequests[cacheKey];
  }
}

async function fetchPriceInternal(symbol: string): Promise<PriceData | PriceError> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log(`[Alpha Vantage] Fetching price for ${symbol}...`);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[Alpha Vantage] HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Alpha Vantage] Response for ${symbol}:`, data);

    // Check for API error messages
    if (data['Error Message']) {
      console.error(`[Alpha Vantage] Error Message for ${symbol}:`, data['Error Message']);
      return { symbol, error: data['Error Message'] };
    }

    if (data['Note']) {
      // Rate limit message
      console.error(`[Alpha Vantage] Rate Limit for ${symbol}:`, data['Note']);
      return { symbol, error: 'API rate limit exceeded. Please try again later.' };
    }

    if (data['Information']) {
      console.error(`[Alpha Vantage] Info Message for ${symbol}:`, data['Information']);
      return { symbol, error: data['Information'] };
    }

    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      console.error(`[Alpha Vantage] No quote data for ${symbol}`);
      return { symbol, error: 'No data found for this symbol' };
    }

    const price = parseFloat(quote['05. price'] || 0);
    if (price === 0) {
      console.error(`[Alpha Vantage] Zero price for ${symbol}, raw quote:`, quote);
      return { symbol, error: 'Invalid price data received' };
    }

    console.log(`[Alpha Vantage] Success for ${symbol}: ₹${price}`);

    return {
      symbol: symbol.toUpperCase(),
      price: price,
      change: parseFloat(quote['09. change'] || 0),
      changePercent: parseFloat((quote['10. change percent'] || '0').replace('%', '')),
      lastUpdated: quote['07. latest trading day'] || new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Alpha Vantage] Fetch error for ${symbol}:`, error);
    return { 
      symbol, 
      error: error instanceof Error ? error.message : 'Failed to fetch price' 
    };
  }
}

export async function fetchMultiplePrices(symbols: string[]): Promise<{
  prices: Record<string, number>;
  errors: PriceError[];
}> {
  const prices: Record<string, number> = {};
  const errors: PriceError[] = [];

  // Filter out empty symbols and duplicates
  const uniqueSymbols = [...new Set(symbols.filter(s => s && s.trim()))];
  
  if (uniqueSymbols.length === 0) {
    return { prices, errors };
  }

  // Fetch all prices in parallel
  const results = await Promise.all(
    uniqueSymbols.map(symbol => fetchStockPrice(symbol))
  );

  results.forEach(result => {
    if ('price' in result) {
      prices[result.symbol] = result.price;
    } else {
      errors.push(result);
    }
  });

  return { prices, errors };
}

export function getAssetTypeDisplay(type: string): string {
  const displayMap: Record<string, string> = {
    'stocks': 'Stocks',
    'etfs': 'ETFs',
    'mutual_funds': 'Mutual Funds',
    'crypto': 'Crypto',
    'fixed_deposits': 'Fixed Deposits',
    'gold': 'Gold',
    'manual_assets': 'Manual Assets',
  };
  return displayMap[type] || type;
}

export function getAssetTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'stocks': '#6366f1',     // Indigo
    'etfs': '#8b5cf6',       // Violet
    'mutual_funds': '#06b6d4', // Cyan
    'crypto': '#f59e0b',     // Amber
    'fixed_deposits': '#10b981', // Emerald
    'gold': '#fbbf24',       // Yellow
    'manual_assets': '#6b7280', // Gray
  };
  return colorMap[type] || '#6b7280';
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
