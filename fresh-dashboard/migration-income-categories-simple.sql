-- Income Category Breakdown System Migration (SIMPLE VERSION)
-- This migration adds support for breaking down income/invoices into multiple categories
-- Simplified: Removes user_id from breakdowns table, uses income table for ownership

BEGIN;

-- Drop old tables if they exist
DROP TABLE IF EXISTS app_72505145eb_income_breakdowns CASCADE;
DROP TABLE IF EXISTS app_72505145eb_income_categories CASCADE;

-- 1. Create Income Categories Table
CREATE TABLE app_72505145eb_income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_income_categories_user ON app_72505145eb_income_categories(user_id);

-- Enable RLS
ALTER TABLE app_72505145eb_income_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own income categories"
  ON app_72505145eb_income_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income categories"
  ON app_72505145eb_income_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income categories"
  ON app_72505145eb_income_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income categories"
  ON app_72505145eb_income_categories FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Create Income Breakdowns Table (NO user_id column)
CREATE TABLE app_72505145eb_income_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_id UUID REFERENCES app_72505145eb_enhanced_income(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES app_72505145eb_income_categories(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  percentage DECIMAL(5, 2) CHECK (percentage >= 0 AND percentage <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_amount_or_percentage CHECK (amount > 0 OR percentage > 0)
);

-- Create indexes
CREATE INDEX idx_income_breakdowns_income ON app_72505145eb_income_breakdowns(income_id);
CREATE INDEX idx_income_breakdowns_category ON app_72505145eb_income_breakdowns(category_id);

-- Enable RLS
ALTER TABLE app_72505145eb_income_breakdowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies (check ownership through income table)
CREATE POLICY "Users can view their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_72505145eb_enhanced_income 
      WHERE id = income_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_72505145eb_enhanced_income 
      WHERE id = income_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM app_72505145eb_enhanced_income 
      WHERE id = income_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM app_72505145eb_enhanced_income 
      WHERE id = income_id AND user_id = auth.uid()
    )
  );

-- 3. Add project reference fields to income table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'app_72505145eb_enhanced_income' 
                 AND column_name = 'project_name') THEN
    ALTER TABLE app_72505145eb_enhanced_income ADD COLUMN project_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'app_72505145eb_enhanced_income' 
                 AND column_name = 'project_reference') THEN
    ALTER TABLE app_72505145eb_enhanced_income ADD COLUMN project_reference TEXT;
  END IF;
END $$;

-- 4. Create validation function
CREATE OR REPLACE FUNCTION validate_income_breakdown_total()
RETURNS TRIGGER AS $$
DECLARE
  income_total DECIMAL(15, 2);
  breakdown_total DECIMAL(15, 2);
BEGIN
  SELECT amount INTO income_total FROM app_72505145eb_enhanced_income WHERE id = NEW.income_id;
  SELECT COALESCE(SUM(amount), 0) INTO breakdown_total FROM app_72505145eb_income_breakdowns WHERE income_id = NEW.income_id;
  IF breakdown_total > income_total THEN
    RAISE EXCEPTION 'Breakdown total exceeds income amount';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_breakdown_total AFTER INSERT OR UPDATE ON app_72505145eb_income_breakdowns
  FOR EACH ROW EXECUTE FUNCTION validate_income_breakdown_total();

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_income_categories_updated_at BEFORE UPDATE ON app_72505145eb_income_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_breakdowns_updated_at BEFORE UPDATE ON app_72505145eb_income_breakdowns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;