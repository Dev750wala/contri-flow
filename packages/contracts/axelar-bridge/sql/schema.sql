-- bridge_transactions table
CREATE TABLE IF NOT EXISTS bridge_transactions (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(66) NOT NULL,
  source_chain VARCHAR(64) NOT NULL,
  destination_chain VARCHAR(64) NOT NULL,
  sender_address VARCHAR(42) NOT NULL,
  recipient_address VARCHAR(42) NOT NULL,
  amount NUMERIC(78, 0) NOT NULL,
  token_symbol VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  axelar_tx_hash VARCHAR(66),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_bridge_transactions_status ON bridge_transactions (status);
CREATE INDEX IF NOT EXISTS idx_bridge_transactions_created_at ON bridge_transactions (created_at);

-- reconciliation: pending transactions
-- SELECT * FROM bridge_transactions WHERE status IN ('PENDING','IN_FLIGHT') ORDER BY created_at DESC;

-- daily report: totals per day
-- SELECT DATE(created_at) as day, token_symbol, COUNT(*) as tx_count, SUM(amount) as total_amount
-- FROM bridge_transactions
-- WHERE status = 'CONFIRMED'
-- GROUP BY day, token_symbol
-- ORDER BY day DESC;


