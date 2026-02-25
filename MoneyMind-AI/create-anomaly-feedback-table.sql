-- Create table for anomaly feedback
-- This stores user feedback on whether flagged anomalies are actually unusual

CREATE TABLE IF NOT EXISTS anomaly_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_actually_anomaly BOOLEAN NOT NULL,
    original_ml_prediction BOOLEAN NOT NULL,
    confidence_score DECIMAL(5,4),
    user_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE anomaly_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own anomaly feedback"
ON anomaly_feedback
FOR ALL
USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_anomaly_feedback_transaction_id ON anomaly_feedback(transaction_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_feedback_user_id ON anomaly_feedback(user_id);

CREATE OR REPLACE FUNCTION update_anomaly_feedback_updated_at()
RETURNS TRIGGER AS }
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
} LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_anomaly_feedback_updated_at ON anomaly_feedback;
CREATE TRIGGER trg_anomaly_feedback_updated_at
  BEFORE UPDATE ON anomaly_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_anomaly_feedback_updated_at();
