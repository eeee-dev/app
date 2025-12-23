-- Finance Dashboard - Database Setup
-- This will be executed via Supabase Management API

BEGIN;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_projects_department;
DROP INDEX IF EXISTS idx_enhanced_income_user;
DROP INDEX IF EXISTS idx_expenses_user;
DROP INDEX IF EXISTS idx_expenses_department;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS allow_all_departments ON app_72505145eb_departments;
DROP POLICY IF EXISTS allow_all_projects ON app_72505145eb_projects;
DROP POLICY IF EXISTS allow_own_clients ON app_72505145eb_clients;
DROP POLICY IF EXISTS allow_own_income ON app_72505145eb_enhanced_income;
DROP POLICY IF EXISTS allow_all_categories ON app_72505145eb_income_categories;
DROP POLICY IF EXISTS allow_own_breakdowns ON app_72505145eb_income_breakdowns;
DROP POLICY IF EXISTS allow_own_expenses ON app_72505145eb_expenses;
DROP POLICY IF EXISTS allow_own_invoices ON app_72505145eb_invoices;
DROP POLICY IF EXISTS allow_own_pos ON app_72505145eb_purchase_orders;

-- Create tables
CREATE TABLE IF NOT EXISTS app_72505145eb_departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  budget DECIMAL(15,2) DEFAULT 0,
  spent DECIMAL(15,2) DEFAULT 0,
  manager TEXT,
  description TEXT,
  employees INTEGER DEFAULT 0,
  projects INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id TEXT REFERENCES app_72505145eb_departments(id),
  description TEXT,
  budget DECIMAL(15,2) DEFAULT 0,
  spent DECIMAL(15,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  manager TEXT NOT NULL,
  team_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  contact_person TEXT,
  payment_terms TEXT,
  status TEXT DEFAULT 'active',
  total_transactions INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_enhanced_income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  department_id TEXT REFERENCES app_72505145eb_departments(id),
  project_id UUID REFERENCES app_72505145eb_projects(id),
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL UNIQUE,
  division_name TEXT NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_income_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_id UUID REFERENCES app_72505145eb_enhanced_income(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES app_72505145eb_income_categories(category_id),
  amount DECIMAL(15,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  department_id TEXT REFERENCES app_72505145eb_departments(id) NOT NULL,
  project_id UUID REFERENCES app_72505145eb_projects(id),
  amount DECIMAL(15,2) NOT NULL,
  vat_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 15,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  items JSONB,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_72505145eb_purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  po_number TEXT NOT NULL UNIQUE,
  vendor_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  items JSONB,
  department_id TEXT REFERENCES app_72505145eb_departments(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_department ON app_72505145eb_projects(department_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_income_user ON app_72505145eb_enhanced_income(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON app_72505145eb_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_department ON app_72505145eb_expenses(department_id);

-- Enable RLS
ALTER TABLE app_72505145eb_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_enhanced_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_income_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY allow_all_departments ON app_72505145eb_departments FOR ALL USING (true);
CREATE POLICY allow_all_projects ON app_72505145eb_projects FOR ALL USING (true);
CREATE POLICY allow_own_clients ON app_72505145eb_clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY allow_own_income ON app_72505145eb_enhanced_income FOR ALL USING (auth.uid() = user_id);
CREATE POLICY allow_all_categories ON app_72505145eb_income_categories FOR ALL USING (true);
CREATE POLICY allow_own_breakdowns ON app_72505145eb_income_breakdowns FOR ALL USING (
  EXISTS (SELECT 1 FROM app_72505145eb_enhanced_income WHERE id = income_id AND user_id = auth.uid())
);
CREATE POLICY allow_own_expenses ON app_72505145eb_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY allow_own_invoices ON app_72505145eb_invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY allow_own_pos ON app_72505145eb_purchase_orders FOR ALL USING (auth.uid() = user_id);

COMMIT;