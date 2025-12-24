-- Income Category Breakdown System Migration
-- This migration adds support for breaking down income/invoices into multiple categories

BEGIN;

-- 1. Create Income Categories Table
CREATE TABLE IF NOT EXISTS app_72505145eb_income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES app_72505145eb_departments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_income_categories_dept ON app_72505145eb_income_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_income_categories_user ON app_72505145eb_income_categories(user_id);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_income_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income_categories
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

-- 2. Create Income Breakdowns Table (Junction table)
CREATE TABLE IF NOT EXISTS app_72505145eb_income_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_id UUID REFERENCES app_72505145eb_enhanced_income(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES app_72505145eb_income_categories(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  percentage DECIMAL(5, 2) CHECK (percentage >= 0 AND percentage <= 100),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_amount_or_percentage CHECK (amount > 0 OR percentage > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_income_breakdowns_income ON app_72505145eb_income_breakdowns(income_id);
CREATE INDEX IF NOT EXISTS idx_income_breakdowns_category ON app_72505145eb_income_breakdowns(category_id);
CREATE INDEX IF NOT EXISTS idx_income_breakdowns_user ON app_72505145eb_income_breakdowns(user_id);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_income_breakdowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income_breakdowns
CREATE POLICY "Users can view their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income breakdowns"
  ON app_72505145eb_income_breakdowns FOR DELETE
  USING (auth.uid() = user_id);

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

-- 4. Create function to validate breakdown totals
CREATE OR REPLACE FUNCTION validate_income_breakdown_total()
RETURNS TRIGGER AS $$
DECLARE
  income_total DECIMAL(15, 2);
  breakdown_total DECIMAL(15, 2);
BEGIN
  -- Get the income total
  SELECT amount INTO income_total
  FROM app_72505145eb_enhanced_income
  WHERE id = NEW.income_id;
  
  -- Calculate breakdown total
  SELECT COALESCE(SUM(amount), 0) INTO breakdown_total
  FROM app_72505145eb_income_breakdowns
  WHERE income_id = NEW.income_id;
  
  -- Allow breakdown total to be less than or equal to income total
  IF breakdown_total > income_total THEN
    RAISE EXCEPTION 'Breakdown total (%) exceeds income amount (%)', breakdown_total, income_total;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate breakdown totals
DROP TRIGGER IF EXISTS check_breakdown_total ON app_72505145eb_income_breakdowns;
CREATE TRIGGER check_breakdown_total
  AFTER INSERT OR UPDATE ON app_72505145eb_income_breakdowns
  FOR EACH ROW
  EXECUTE FUNCTION validate_income_breakdown_total();

-- 5. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_income_categories_updated_at ON app_72505145eb_income_categories;
CREATE TRIGGER update_income_categories_updated_at
  BEFORE UPDATE ON app_72505145eb_income_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_income_breakdowns_updated_at ON app_72505145eb_income_breakdowns;
CREATE TRIGGER update_income_breakdowns_updated_at
  BEFORE UPDATE ON app_72505145eb_income_breakdowns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Income Category Breakdown System migration completed successfully!';
  RAISE NOTICE 'Tables created: app_72505145eb_income_categories, app_72505145eb_income_breakdowns';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Seed default categories using the seed script';
  RAISE NOTICE '2. Update frontend to use the new category breakdown system';
END $$;