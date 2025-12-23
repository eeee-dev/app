-- Financial Dashboard Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  manager TEXT,
  description TEXT,
  employees INTEGER DEFAULT 0,
  projects INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  description TEXT,
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'planning', 'on-hold', 'completed', 'cancelled')),
  manager TEXT,
  team_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  receipt_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income table
CREATE TABLE IF NOT EXISTS income (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue', 'cancelled')),
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled')),
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  spent DECIMAL(15, 2) DEFAULT 0,
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'exceeded', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_status ON departments(status);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_department ON expenses(department_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_income_status ON income(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_budgets_department ON budgets(department_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read departments" ON departments;
DROP POLICY IF EXISTS "Allow authenticated insert departments" ON departments;
DROP POLICY IF EXISTS "Allow authenticated update departments" ON departments;
DROP POLICY IF EXISTS "Allow authenticated delete departments" ON departments;

DROP POLICY IF EXISTS "Allow authenticated read projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated insert projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated update projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated delete projects" ON projects;

DROP POLICY IF EXISTS "Allow authenticated read expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated insert expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated update expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated delete expenses" ON expenses;

DROP POLICY IF EXISTS "Allow authenticated read income" ON income;
DROP POLICY IF EXISTS "Allow authenticated insert income" ON income;
DROP POLICY IF EXISTS "Allow authenticated update income" ON income;
DROP POLICY IF EXISTS "Allow authenticated delete income" ON income;

DROP POLICY IF EXISTS "Allow authenticated read invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated insert invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated update invoices" ON invoices;
DROP POLICY IF EXISTS "Allow authenticated delete invoices" ON invoices;

DROP POLICY IF EXISTS "Allow authenticated read budgets" ON budgets;
DROP POLICY IF EXISTS "Allow authenticated insert budgets" ON budgets;
DROP POLICY IF EXISTS "Allow authenticated update budgets" ON budgets;
DROP POLICY IF EXISTS "Allow authenticated delete budgets" ON budgets;

-- Create RLS Policies (allow authenticated users to read/write all data)
CREATE POLICY "Allow authenticated read departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert departments" ON departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update departments" ON departments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete departments" ON departments FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update projects" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete projects" ON projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update expenses" ON expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete expenses" ON expenses FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read income" ON income FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert income" ON income FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update income" ON income FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete income" ON income FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update invoices" ON invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete invoices" ON invoices FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read budgets" ON budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert budgets" ON budgets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update budgets" ON budgets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete budgets" ON budgets FOR DELETE TO authenticated USING (true);

-- Insert default departments
INSERT INTO departments (id, name, code, budget, spent, manager, status, employees, projects) VALUES
('musique', 'ë • musique', 'MUS', 50000, 0, 'Alexandre Dubois', 'active', 24, 0),
('boucan', 'bōucan', 'BOU', 120000, 0, 'Thomas Leroy', 'active', 32, 0),
('talent', 'talënt', 'TAL', 45000, 0, 'Isabelle Chen', 'active', 15, 0),
('moris', 'mōris', 'MOR', 30000, 0, 'David Wilson', 'active', 8, 0)
ON CONFLICT (id) DO NOTHING;