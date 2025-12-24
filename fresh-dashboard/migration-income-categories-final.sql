-- Income Category Breakdown System Migration (FINAL VERSION)
-- This is the complete, corrected migration script
-- Schema uses user_id (not owner_id) and NO department_id field

BEGIN;

-- 1. Create Income Categories Table
CREATE TABLE app_72505145eb_income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_income_categories_user ON app_72505145eb_income_categories(user_id);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_income_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Income Categories
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

-- 2. Create Income Breakdowns Table
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

-- Create indexes for performance
CREATE INDEX idx_income_breakdowns_income ON app_72505145eb_income_breakdowns(income_id);
CREATE INDEX idx_income_breakdowns_category ON app_72505145eb_income_breakdowns(category_id);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_income_breakdowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Income Breakdowns (check ownership through income table)
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

-- 3. Create validation function to ensure breakdown total doesn't exceed income amount
CREATE OR REPLACE FUNCTION validate_income_breakdown_total()
RETURNS TRIGGER AS $$
DECLARE
  income_total DECIMAL(15, 2);
  breakdown_total DECIMAL(15, 2);
BEGIN
  -- Get the total amount from the income record
  SELECT amount INTO income_total 
  FROM app_72505145eb_enhanced_income 
  WHERE id = NEW.income_id;
  
  -- Calculate the sum of all breakdowns for this income
  SELECT COALESCE(SUM(amount), 0) INTO breakdown_total 
  FROM app_72505145eb_income_breakdowns 
  WHERE income_id = NEW.income_id;
  
  -- Raise an error if breakdown total exceeds income amount
  IF breakdown_total > income_total THEN
    RAISE EXCEPTION 'Breakdown total (%) exceeds income amount (%)', breakdown_total, income_total;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate breakdown totals
CREATE TRIGGER check_breakdown_total 
  AFTER INSERT OR UPDATE ON app_72505145eb_income_breakdowns
  FOR EACH ROW 
  EXECUTE FUNCTION validate_income_breakdown_total();

-- 4. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at timestamps
CREATE TRIGGER update_income_categories_updated_at 
  BEFORE UPDATE ON app_72505145eb_income_categories
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_breakdowns_updated_at 
  BEFORE UPDATE ON app_72505145eb_income_breakdowns
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Migration complete! 
-- Next step: Optionally run seed-income-categories.sql to add default categories