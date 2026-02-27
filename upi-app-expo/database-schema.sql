-- UPI Transaction Database Schema
-- Run this SQL in your new Supabase database to set up the transaction history tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Upi Transactions Table (for storing UPI transfer history)
CREATE TABLE upi_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    upi_id VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('debit', 'credit')),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    description TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX idx_upi_transactions_user_id ON upi_transactions(user_id);
CREATE INDEX idx_upi_transactions_created_at ON upi_transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE upi_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own transactions
CREATE POLICY "Users can view own transactions" ON upi_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own transactions
CREATE POLICY "Users can insert own transactions" ON upi_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_upi_transactions_updated_at
    BEFORE UPDATE ON upi_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for transaction summary
CREATE VIEW user_transaction_summary AS
SELECT 
    user_id,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_sent,
    SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_received,
    MAX(created_at) as last_transaction_date
FROM upi_transactions
GROUP BY user_id;

-- Example data (optional - for testing)
-- INSERT INTO upi_transactions (user_id, upi_id, amount, type, description, note)
-- VALUES 
--     ('user-uuid-here', 'rahul@upi', 500.00, 'debit', 'Money sent to Rahul', 'Lunch'),
--     ('user-uuid-here', 'priya@upi', 1000.00, 'credit', 'Money received from Priya', 'Return');
