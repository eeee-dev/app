-- Drop existing tables and recreate with correct schema
BEGIN;

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS app_72505145eb_budgets CASCADE;
DROP TABLE IF EXISTS app_72505145eb_invoices CASCADE;
DROP TABLE IF EXISTS app_72505145eb_income CASCADE;
DROP TABLE IF EXISTS app_72505145eb_clients CASCADE;
DROP TABLE IF EXISTS app_72505145eb_projects CASCADE;
DROP TABLE IF EXISTS app_72505145eb_departments CASCADE;

-- Create departments table with ALL required columns
CREATE TABLE app_72505145eb_departments (
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

-- Create projects table
CREATE TABLE app_72505145eb_projects (
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

-- Create clients table
CREATE TABLE app_72505145eb_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  contact_person TEXT,
  payment_terms TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create income table
CREATE TABLE app_72505145eb_income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  department_id TEXT REFERENCES app_72505145eb_departments(id),
  project_id UUID REFERENCES app_72505145eb_projects(id),
  client_id UUID REFERENCES app_72505145eb_clients(id),
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  category TEXT,
  payment_method TEXT,
  reference_number TEXT,
  status TEXT DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE app_72505145eb_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES app_72505145eb_clients(id),
  department_id TEXT REFERENCES app_72505145eb_departments(id),
  project_id UUID REFERENCES app_72505145eb_projects(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE app_72505145eb_budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  department_id TEXT REFERENCES app_72505145eb_departments(id),
  project_id UUID REFERENCES app_72505145eb_projects(id),
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  spent DECIMAL(15,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments (public read, authenticated write)
CREATE POLICY "allow_read_all_departments" ON app_72505145eb_departments FOR SELECT USING (true);
CREATE POLICY "allow_insert_departments" ON app_72505145eb_departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_update_departments" ON app_72505145eb_departments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_delete_departments" ON app_72505145eb_departments FOR DELETE TO authenticated USING (true);

-- RLS Policies for projects
CREATE POLICY "allow_read_all_projects" ON app_72505145eb_projects FOR SELECT USING (true);
CREATE POLICY "allow_insert_projects" ON app_72505145eb_projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_update_projects" ON app_72505145eb_projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_delete_projects" ON app_72505145eb_projects FOR DELETE TO authenticated USING (true);

-- RLS Policies for clients (user-specific)
CREATE POLICY "allow_read_own_clients" ON app_72505145eb_clients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_insert_own_clients" ON app_72505145eb_clients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_clients" ON app_72505145eb_clients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_clients" ON app_72505145eb_clients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for income (user-specific)
CREATE POLICY "allow_read_own_income" ON app_72505145eb_income FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_insert_own_income" ON app_72505145eb_income FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_income" ON app_72505145eb_income FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_income" ON app_72505145eb_income FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for invoices (user-specific)
CREATE POLICY "allow_read_own_invoices" ON app_72505145eb_invoices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_insert_own_invoices" ON app_72505145eb_invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_invoices" ON app_72505145eb_invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_invoices" ON app_72505145eb_invoices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for budgets (user-specific)
CREATE POLICY "allow_read_own_budgets" ON app_72505145eb_budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_insert_own_budgets" ON app_72505145eb_budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_budgets" ON app_72505145eb_budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_budgets" ON app_72505145eb_budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;
