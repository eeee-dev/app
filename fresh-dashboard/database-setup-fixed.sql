-- Finance Dashboard - Complete Database Setup Script
-- Run this script in your Supabase SQL Editor

BEGIN;

-- Create departments table
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
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS app_72505145eb_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id TEXT REFERENCES app_72505145eb_departments(id) ON DELETE CASCADE,
  description TEXT,
  budget DECIMAL(15,2) DEFAULT 0,
  spent DECIMAL(15,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold', 'cancelled')),
  manager TEXT NOT NULL,
  team_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create clients table
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
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_transactions INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create enhanced_income table
CREATE TABLE IF NOT EXISTS app_72505145eb_enhanced_income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  department_id TEXT REFERENCES app_72505145eb_departments(id) ON DELETE SET NULL,
  project_id UUID REFERENCES app_72505145eb_projects(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create income_categories table
CREATE TABLE IF NOT EXISTS app_72505145eb_income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL UNIQUE,
  division_name TEXT NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create income_breakdowns table
CREATE TABLE IF NOT EXISTS app_72505145eb_income_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_id UUID REFERENCES app_72505145eb_enhanced_income(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES app_72505145eb_income_categories(category_id)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS app_72505145eb_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  department_id TEXT REFERENCES app_72505145eb_departments(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES app_72505145eb_projects(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  vat_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
  vat_rate DECIMAL(5,2) DEFAULT 15,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS app_72505145eb_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  items JSONB,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS app_72505145eb_purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  po_number TEXT NOT NULL UNIQUE,
  vendor_name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  items JSONB,
  department_id TEXT REFERENCES app_72505145eb_departments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_department ON app_72505145eb_projects(department_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_income_user ON app_72505145eb_enhanced_income(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_income_status ON app_72505145eb_enhanced_income(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_income_date ON app_72505145eb_enhanced_income(date);
CREATE INDEX IF NOT EXISTS idx_income_breakdowns_income ON app_72505145eb_income_breakdowns(income_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON app_72505145eb_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_department ON app_72505145eb_expenses(department_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON app_72505145eb_expenses(project_id);

-- Setup Row Level Security (RLS)
ALTER TABLE app_72505145eb_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_enhanced_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_income_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_purchase_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments (public read, authenticated write)
DROP POLICY IF EXISTS allow_read_departments ON app_72505145eb_departments;
CREATE POLICY allow_read_departments ON app_72505145eb_departments FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_insert_departments ON app_72505145eb_departments;
CREATE POLICY allow_insert_departments ON app_72505145eb_departments FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS allow_update_departments ON app_72505145eb_departments;
CREATE POLICY allow_update_departments ON app_72505145eb_departments FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS allow_delete_departments ON app_72505145eb_departments;
CREATE POLICY allow_delete_departments ON app_72505145eb_departments FOR DELETE TO authenticated USING (true);

-- RLS Policies for projects (public read, authenticated write)
DROP POLICY IF EXISTS allow_read_projects ON app_72505145eb_projects;
CREATE POLICY allow_read_projects ON app_72505145eb_projects FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_insert_projects ON app_72505145eb_projects;
CREATE POLICY allow_insert_projects ON app_72505145eb_projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS allow_update_projects ON app_72505145eb_projects;
CREATE POLICY allow_update_projects ON app_72505145eb_projects FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS allow_delete_projects ON app_72505145eb_projects;
CREATE POLICY allow_delete_projects ON app_72505145eb_projects FOR DELETE TO authenticated USING (true);

-- RLS Policies for clients (users can only access their own)
DROP POLICY IF EXISTS allow_read_own_clients ON app_72505145eb_clients;
CREATE POLICY allow_read_own_clients ON app_72505145eb_clients FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_insert_own_clients ON app_72505145eb_clients;
CREATE POLICY allow_insert_own_clients ON app_72505145eb_clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_update_own_clients ON app_72505145eb_clients;
CREATE POLICY allow_update_own_clients ON app_72505145eb_clients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_delete_own_clients ON app_72505145eb_clients;
CREATE POLICY allow_delete_own_clients ON app_72505145eb_clients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for enhanced_income (users can only access their own)
DROP POLICY IF EXISTS allow_read_own_income ON app_72505145eb_enhanced_income;
CREATE POLICY allow_read_own_income ON app_72505145eb_enhanced_income FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_insert_own_income ON app_72505145eb_enhanced_income;
CREATE POLICY allow_insert_own_income ON app_72505145eb_enhanced_income FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_update_own_income ON app_72505145eb_enhanced_income;
CREATE POLICY allow_update_own_income ON app_72505145eb_enhanced_income FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_delete_own_income ON app_72505145eb_enhanced_income;
CREATE POLICY allow_delete_own_income ON app_72505145eb_enhanced_income FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for income_categories (public read, authenticated write)
DROP POLICY IF EXISTS allow_read_income_categories ON app_72505145eb_income_categories;
CREATE POLICY allow_read_income_categories ON app_72505145eb_income_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_insert_income_categories ON app_72505145eb_income_categories;
CREATE POLICY allow_insert_income_categories ON app_72505145eb_income_categories FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for income_breakdowns (users can access breakdowns for their income)
DROP POLICY IF EXISTS allow_read_own_breakdowns ON app_72505145eb_income_breakdowns;
CREATE POLICY allow_read_own_breakdowns ON app_72505145eb_income_breakdowns FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM app_72505145eb_enhanced_income 
    WHERE id = income_id AND user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS allow_insert_own_breakdowns ON app_72505145eb_income_breakdowns;
CREATE POLICY allow_insert_own_breakdowns ON app_72505145eb_income_breakdowns FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM app_72505145eb_enhanced_income 
    WHERE id = income_id AND user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS allow_update_own_breakdowns ON app_72505145eb_income_breakdowns;
CREATE POLICY allow_update_own_breakdowns ON app_72505145eb_income_breakdowns FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM app_72505145eb_enhanced_income 
    WHERE id = income_id AND user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS allow_delete_own_breakdowns ON app_72505145eb_income_breakdowns;
CREATE POLICY allow_delete_own_breakdowns ON app_72505145eb_income_breakdowns FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM app_72505145eb_enhanced_income 
    WHERE id = income_id AND user_id = auth.uid()
  )
);

-- RLS Policies for expenses (users can only access their own)
DROP POLICY IF EXISTS allow_read_own_expenses ON app_72505145eb_expenses;
CREATE POLICY allow_read_own_expenses ON app_72505145eb_expenses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_insert_own_expenses ON app_72505145eb_expenses;
CREATE POLICY allow_insert_own_expenses ON app_72505145eb_expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_update_own_expenses ON app_72505145eb_expenses;
CREATE POLICY allow_update_own_expenses ON app_72505145eb_expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_delete_own_expenses ON app_72505145eb_expenses;
CREATE POLICY allow_delete_own_expenses ON app_72505145eb_expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for invoices (users can only access their own)
DROP POLICY IF EXISTS allow_read_own_invoices ON app_72505145eb_invoices;
CREATE POLICY allow_read_own_invoices ON app_72505145eb_invoices FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_insert_own_invoices ON app_72505145eb_invoices;
CREATE POLICY allow_insert_own_invoices ON app_72505145eb_invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_update_own_invoices ON app_72505145eb_invoices;
CREATE POLICY allow_update_own_invoices ON app_72505145eb_invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_delete_own_invoices ON app_72505145eb_invoices;
CREATE POLICY allow_delete_own_invoices ON app_72505145eb_invoices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for purchase_orders (users can only access their own)
DROP POLICY IF EXISTS allow_read_own_pos ON app_72505145eb_purchase_orders;
CREATE POLICY allow_read_own_pos ON app_72505145eb_purchase_orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_insert_own_pos ON app_72505145eb_purchase_orders;
CREATE POLICY allow_insert_own_pos ON app_72505145eb_purchase_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_update_own_pos ON app_72505145eb_purchase_orders;
CREATE POLICY allow_update_own_pos ON app_72505145eb_purchase_orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS allow_delete_own_pos ON app_72505145eb_purchase_orders;
CREATE POLICY allow_delete_own_pos ON app_72505145eb_purchase_orders FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;

-- Success message
SELECT 'Database setup completed successfully!' as message;