-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS app_72505145eb_budgets CASCADE;

BEGIN;

-- Create budgets table
CREATE TABLE app_72505145eb_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  department_id TEXT REFERENCES app_72505145eb_departments(id) NOT NULL,
  allocated DECIMAL(15,2) NOT NULL DEFAULT 0,
  spent DECIMAL(15,2) NOT NULL DEFAULT 0,
  fiscal_year INTEGER NOT NULL,
  quarter INTEGER CHECK (quarter >= 1 AND quarter <= 4),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, department_id, fiscal_year, quarter)
);

-- Create indexes for faster queries
CREATE INDEX idx_budgets_user ON app_72505145eb_budgets(user_id);
CREATE INDEX idx_budgets_department ON app_72505145eb_budgets(department_id);
CREATE INDEX idx_budgets_fiscal_year ON app_72505145eb_budgets(fiscal_year);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only see their own budgets
CREATE POLICY "allow_own_budgets" ON app_72505145eb_budgets 
  FOR ALL 
  USING (auth.uid() = user_id);

COMMIT;