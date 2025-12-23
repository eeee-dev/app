import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTables() {
  console.log('🔧 Setting up Supabase database tables...\n');

  const sql = `
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

    -- Enable Row Level Security
    ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
    ALTER TABLE income ENABLE ROW LEVEL SECURITY;
    ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

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

    -- RLS Policies
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

    -- Insert default departments
    INSERT INTO departments (id, name, code, budget, spent, manager, status, employees, projects) VALUES
    ('musique', 'ë • musique', 'MUS', 50000, 0, 'Alexandre Dubois', 'active', 24, 0),
    ('boucan', 'bōucan', 'BOU', 120000, 0, 'Thomas Leroy', 'active', 32, 0),
    ('talent', 'talënt', 'TAL', 45000, 0, 'Isabelle Chen', 'active', 15, 0),
    ('moris', 'mōris', 'MOR', 30000, 0, 'David Wilson', 'active', 8, 0)
    ON CONFLICT (id) DO NOTHING;
  `;

  try {
    console.log('📝 Executing SQL commands...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('\n❌ Setup failed:', error.message);
      console.log('\n💡 Please run this SQL manually in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql\n');
      console.log(sql);
      process.exit(1);
    }
    
    console.log('✅ Database tables created successfully!\n');
    console.log('📊 Created tables:');
    console.log('   - departments');
    console.log('   - projects');
    console.log('   - expenses');
    console.log('   - income');
    console.log('   - invoices\n');
    console.log('🔒 Row Level Security enabled for all tables');
    console.log('✨ Default departments inserted\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Manual setup required. Please copy and run this SQL in Supabase:');
    console.log(sql);
    process.exit(1);
  }
}

setupTables();