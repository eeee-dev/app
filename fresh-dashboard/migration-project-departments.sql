-- Migration: Add Project-Department Many-to-Many Relationship
-- This adds flexibility without breaking existing data

BEGIN;

-- Step 1: Create project_departments junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS app_72505145eb_project_departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES app_72505145eb_projects(id) ON DELETE CASCADE,
  department_id TEXT REFERENCES app_72505145eb_departments(id) ON DELETE CASCADE,
  allocation_percentage DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, department_id)
);

-- Step 2: Add project_id column to purchase_orders table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'app_72505145eb_purchase_orders' 
    AND column_name = 'project_id'
  ) THEN
    ALTER TABLE app_72505145eb_purchase_orders 
      ADD COLUMN project_id UUID REFERENCES app_72505145eb_projects(id);
  END IF;
END $$;

-- Step 3: Make department_id optional in expenses table (allow NULL for admin costs)
ALTER TABLE app_72505145eb_expenses 
  ALTER COLUMN department_id DROP NOT NULL;

-- Step 4: Make department_id optional in purchase_orders table (allow NULL for admin costs)
ALTER TABLE app_72505145eb_purchase_orders 
  ALTER COLUMN department_id DROP NOT NULL;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_departments_project ON app_72505145eb_project_departments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_departments_department ON app_72505145eb_project_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project ON app_72505145eb_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_income_project ON app_72505145eb_enhanced_income(project_id);
CREATE INDEX IF NOT EXISTS idx_pos_project ON app_72505145eb_purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_pos_department ON app_72505145eb_purchase_orders(department_id);

-- Step 6: Enable RLS on new table
ALTER TABLE app_72505145eb_project_departments ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policy for project_departments
CREATE POLICY allow_all_project_departments ON app_72505145eb_project_departments FOR ALL USING (true);

-- Step 8: Migrate existing project-department relationships to junction table
-- Only insert if the project has a department_id set
INSERT INTO app_72505145eb_project_departments (project_id, department_id, allocation_percentage)
SELECT id, department_id, 100.0
FROM app_72505145eb_projects
WHERE department_id IS NOT NULL
ON CONFLICT (project_id, department_id) DO NOTHING;

COMMIT;