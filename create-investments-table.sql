-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stocks', 'etfs', 'mutual_funds', 'crypto', 'fixed_deposits', 'gold', 'manual_assets')),
  asset_name TEXT NOT NULL,
  symbol TEXT,
  quantity DECIMAL(15, 4) NOT NULL DEFAULT 1,
  buy_price DECIMAL(15, 4) NOT NULL,
  purchase_date DATE NOT NULL,
  platform TEXT,
  current_price DECIMAL(15, 4),
  last_price_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_asset_type ON investments(asset_type);

-- Enable Row Level Security
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments"
  ON investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
  ON investments FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
