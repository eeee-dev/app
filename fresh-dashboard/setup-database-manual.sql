-- Financial Management Dashboard Database Setup
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/bxsylvytnnpbbneyhkcs/sql/new

BEGIN;

-- Create departments table
CREATE TABLE IF NOT EXISTS app_72505145eb_departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id),
    budget DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS app_72505145eb_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES app_72505145eb_departments(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0,
    spent DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create clients table
CREATE TABLE IF NOT EXISTS app_72505145eb_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create income_categories table
CREATE TABLE IF NOT EXISTS app_72505145eb_income_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create enhanced_income table
CREATE TABLE IF NOT EXISTS app_72505145eb_enhanced_income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    category_id UUID REFERENCES app_72505145eb_income_categories(id),
    project_id UUID REFERENCES app_72505145eb_projects(id),
    client_id UUID REFERENCES app_72505145eb_clients(id),
    description TEXT,
    payment_method VARCHAR(100),
    reference_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create income_breakdowns table
CREATE TABLE IF NOT EXISTS app_72505145eb_income_breakdowns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    income_id UUID REFERENCES app_72505145eb_enhanced_income(id) ON DELETE CASCADE,
    category_id UUID REFERENCES app_72505145eb_income_categories(id),
    amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS app_72505145eb_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(100),
    department_id UUID REFERENCES app_72505145eb_departments(id),
    project_id UUID REFERENCES app_72505145eb_projects(id),
    payment_method VARCHAR(100),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS app_72505145eb_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    client_id UUID REFERENCES app_72505145eb_clients(id),
    project_id UUID REFERENCES app_72505145eb_projects(id),
    amount DECIMAL(15,2) NOT NULL,
    tax DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS app_72505145eb_purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number VARCHAR(100) NOT NULL UNIQUE,
    vendor_name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES app_72505145eb_departments(id),
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_date DATE NOT NULL,
    delivery_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_manager ON app_72505145eb_departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_department ON app_72505145eb_projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON app_72505145eb_projects(status);
CREATE INDEX IF NOT EXISTS idx_income_date ON app_72505145eb_enhanced_income(date);
CREATE INDEX IF NOT EXISTS idx_income_project ON app_72505145eb_enhanced_income(project_id);
CREATE INDEX IF NOT EXISTS idx_income_client ON app_72505145eb_enhanced_income(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON app_72505145eb_expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_department ON app_72505145eb_expenses(department_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON app_72505145eb_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON app_72505145eb_invoices(client_id);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_enhanced_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_income_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Allow authenticated users to read and write)
CREATE POLICY "allow_all_departments" ON app_72505145eb_departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_projects" ON app_72505145eb_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_clients" ON app_72505145eb_clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_income_categories" ON app_72505145eb_income_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_enhanced_income" ON app_72505145eb_enhanced_income FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_income_breakdowns" ON app_72505145eb_income_breakdowns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_expenses" ON app_72505145eb_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_invoices" ON app_72505145eb_invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_purchase_orders" ON app_72505145eb_purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default income categories
INSERT INTO app_72505145eb_income_categories (name, description) VALUES
    ('Sales', 'Revenue from product or service sales'),
    ('Consulting', 'Income from consulting services'),
    ('Subscriptions', 'Recurring subscription revenue'),
    ('Grants', 'Government or institutional grants'),
    ('Other', 'Other sources of income')
ON CONFLICT (name) DO NOTHING;

COMMIT;