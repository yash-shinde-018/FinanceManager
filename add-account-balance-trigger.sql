-- Add account_id to transactions table and create trigger to update account balance
-- RUN THIS IN SUPABASE SQL EDITOR

-- Step 1: Add account_id column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);

-- Step 3: Create function to update account balance when transaction is inserted
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if account_id is provided
  IF NEW.account_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update balance based on transaction type
  -- Income: add to balance
  -- Expense: subtract from balance
  UPDATE accounts 
  SET balance = CASE 
    WHEN NEW.type = 'income' THEN balance + NEW.amount
    WHEN NEW.type = 'expense' THEN balance - NEW.amount
    ELSE balance
  END,
  updated_at = NOW()
  WHERE id = NEW.account_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Drop trigger if exists and create new one for INSERT
DROP TRIGGER IF EXISTS trg_update_account_balance ON transactions;
CREATE TRIGGER trg_update_account_balance
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_on_transaction();

-- Step 5: Create function to handle transaction DELETE (reverse the effect)
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if account_id was provided
  IF OLD.account_id IS NULL THEN
    RETURN OLD;
  END IF;

  -- Reverse the transaction effect
  -- If it was income, subtract it back
  -- If it was expense, add it back
  UPDATE accounts 
  SET balance = CASE 
    WHEN OLD.type = 'income' THEN balance - OLD.amount
    WHEN OLD.type = 'expense' THEN balance + OLD.amount
    ELSE balance
  END,
  updated_at = NOW()
  WHERE id = OLD.account_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Drop trigger if exists and create new one for DELETE
DROP TRIGGER IF EXISTS trg_update_account_balance_delete ON transactions;
CREATE TRIGGER trg_update_account_balance_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_on_transaction_delete();

-- Step 7: Create function to handle transaction UPDATE
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if account_id is provided
  IF NEW.account_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- If account_id changed, we need to handle both old and new accounts
  IF OLD.account_id IS DISTINCT FROM NEW.account_id THEN
    -- Reverse effect on old account if it existed
    IF OLD.account_id IS NOT NULL THEN
      UPDATE accounts 
      SET balance = CASE 
        WHEN OLD.type = 'income' THEN balance - OLD.amount
        WHEN OLD.type = 'expense' THEN balance + OLD.amount
        ELSE balance
      END,
      updated_at = NOW()
      WHERE id = OLD.account_id;
    END IF;
    
    -- Apply effect on new account
    UPDATE accounts 
    SET balance = CASE 
      WHEN NEW.type = 'income' THEN balance + NEW.amount
      WHEN NEW.type = 'expense' THEN balance - NEW.amount
      ELSE balance
    END,
    updated_at = NOW()
    WHERE id = NEW.account_id;
  ELSE
    -- Same account, just reverse old and apply new
    UPDATE accounts 
    SET balance = balance - CASE 
      WHEN OLD.type = 'income' THEN OLD.amount
      WHEN OLD.type = 'expense' THEN -OLD.amount
      ELSE 0
    END + CASE 
      WHEN NEW.type = 'income' THEN NEW.amount
      WHEN NEW.type = 'expense' THEN -NEW.amount
      ELSE 0
    END,
    updated_at = NOW()
    WHERE id = NEW.account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Drop trigger if exists and create new one for UPDATE
DROP TRIGGER IF EXISTS trg_update_account_balance_update ON transactions;
CREATE TRIGGER trg_update_account_balance_update
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_on_transaction_update();

-- Verification query (run after adding a test transaction)
-- SELECT * FROM accounts WHERE id = 'your-account-id';
