-- =====================================================
-- Complete Database Setup for Financial Dashboard
-- Run this SQL in Supabase SQL Editor
-- =====================================================

BEGIN;

-- Create enhanced income table first
CREATE TABLE IF NOT EXISTS app_40611b53f9_enhanced_income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_name TEXT NOT NULL,
  client_name TEXT,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue')),
  payment_method TEXT,
  notes TEXT,
  invoice_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create income categories table
CREATE TABLE IF NOT EXISTS app_40611b53f9_income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_division TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create income breakdowns table
CREATE TABLE IF NOT EXISTS app_40611b53f9_income_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_id UUID REFERENCES app_40611b53f9_enhanced_income(id) ON DELETE CASCADE,
  category_id UUID REFERENCES app_40611b53f9_income_categories(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  percentage DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(income_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_income_user_id ON app_40611b53f9_enhanced_income(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_income_date ON app_40611b53f9_enhanced_income(date);
CREATE INDEX IF NOT EXISTS idx_enhanced_income_status ON app_40611b53f9_enhanced_income(status);
CREATE INDEX IF NOT EXISTS idx_income_breakdowns_income_id ON app_40611b53f9_income_breakdowns(income_id);
CREATE INDEX IF NOT EXISTS idx_income_breakdowns_category_id ON app_40611b53f9_income_breakdowns(category_id);
CREATE INDEX IF NOT EXISTS idx_income_categories_active ON app_40611b53f9_income_categories(is_active);

-- Setup Row Level Security (RLS)
ALTER TABLE app_40611b53f9_enhanced_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_40611b53f9_income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_40611b53f9_income_breakdowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced_income
CREATE POLICY "allow_read_own_income" ON app_40611b53f9_enhanced_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "allow_insert_own_income" ON app_40611b53f9_enhanced_income FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_update_own_income" ON app_40611b53f9_enhanced_income FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "allow_delete_own_income" ON app_40611b53f9_enhanced_income FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for income_categories
CREATE POLICY "allow_read_all_categories" ON app_40611b53f9_income_categories FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_categories" ON app_40611b53f9_income_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_categories" ON app_40611b53f9_income_categories FOR UPDATE TO authenticated USING (true);

-- RLS Policies for income_breakdowns
CREATE POLICY "allow_read_all_breakdowns" ON app_40611b53f9_income_breakdowns FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_insert_breakdowns" ON app_40611b53f9_income_breakdowns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update_breakdowns" ON app_40611b53f9_income_breakdowns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_authenticated_delete_breakdowns" ON app_40611b53f9_income_breakdowns FOR DELETE TO authenticated USING (true);

-- Insert default categories based on ë ecosystem divisions
INSERT INTO app_40611b53f9_income_categories (name, description, default_division, color) VALUES
  ('Creative Direction', 'Creative direction and event concept development', 'ë • visuals', '#8B5CF6'),
  ('Logo Design', 'Logo and brand identity design', 'ë • visuals', '#EC4899'),
  ('Design Work', 'General design work including flyers, patterns, backgrounds', 'ë • visuals', '#F59E0B'),
  ('Presentation Design', 'Keynote and presentation design with graphics', 'ë • visuals', '#10B981'),
  ('Screen Content', 'LED screen and content management', 'ë • visuals', '#6366F1'),
  ('Video Production', 'Video coverage, editing, and production', 'ë • bōucan', '#EF4444'),
  ('Photography', 'Photography services and image capture', 'ë • bōucan', '#F97316'),
  ('Content Capture', 'BTS and same-day content capture', 'ë • bōucan', '#14B8A6'),
  ('Animation', 'Backdrop animation and motion graphics', 'ë • visuals', '#A855F7'),
  ('Music & Audio', 'Music production, ambience, and audio services', 'ë • musiquë', '#06B6D4'),
  ('Talent Management', 'Artist booking and talent coordination', 'ë • talënt', '#84CC16'),
  ('Event Management', 'Event coordination and management', 'ë • mōris', '#22C55E'),
  ('Sustenance', 'Food, drink, and logistics', 'ë • admin', '#64748B'),
  ('Other Services', 'Miscellaneous services and fees', 'ë • admin', '#94A3B8')
ON CONFLICT (name) DO NOTHING;

COMMIT;
