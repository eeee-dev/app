-- Comprehensive RLS Policy Check and Fix Script

-- 1. Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'app_72505145eb_%'
ORDER BY tablename;

-- 2. List all existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual IS NOT NULL as has_using_clause,
    with_check IS NOT NULL as has_with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename LIKE 'app_72505145eb_%'
ORDER BY tablename, cmd;

-- 3. Fix Purchase Orders RLS Policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own purchase orders" ON app_72505145eb_purchase_orders;
    DROP POLICY IF EXISTS "Users can insert their own purchase orders" ON app_72505145eb_purchase_orders;
    DROP POLICY IF EXISTS "Users can update their own purchase orders" ON app_72505145eb_purchase_orders;
    DROP POLICY IF EXISTS "Users can delete their own purchase orders" ON app_72505145eb_purchase_orders;
    
    -- Enable RLS
    ALTER TABLE app_72505145eb_purchase_orders ENABLE ROW LEVEL SECURITY;
    
    -- Create comprehensive policies
    CREATE POLICY "Users can view their own purchase orders"
        ON app_72505145eb_purchase_orders FOR SELECT
        USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own purchase orders"
        ON app_72505145eb_purchase_orders FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own purchase orders"
        ON app_72505145eb_purchase_orders FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own purchase orders"
        ON app_72505145eb_purchase_orders FOR DELETE
        USING (auth.uid() = user_id);
END $$;

-- 4. Fix Income RLS Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own income" ON app_72505145eb_income;
    DROP POLICY IF EXISTS "Users can insert their own income" ON app_72505145eb_income;
    DROP POLICY IF EXISTS "Users can update their own income" ON app_72505145eb_income;
    DROP POLICY IF EXISTS "Users can delete their own income" ON app_72505145eb_income;
    
    ALTER TABLE app_72505145eb_income ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own income"
        ON app_72505145eb_income FOR SELECT
        USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own income"
        ON app_72505145eb_income FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own income"
        ON app_72505145eb_income FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own income"
        ON app_72505145eb_income FOR DELETE
        USING (auth.uid() = user_id);
END $$;

-- 5. Fix Expenses RLS Policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own expenses" ON app_72505145eb_expenses;
    DROP POLICY IF EXISTS "Users can insert their own expenses" ON app_72505145eb_expenses;
    DROP POLICY IF EXISTS "Users can update their own expenses" ON app_72505145eb_expenses;
    DROP POLICY IF EXISTS "Users can delete their own expenses" ON app_72505145eb_expenses;
    
    ALTER TABLE app_72505145eb_expenses ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own expenses"
        ON app_72505145eb_expenses FOR SELECT
        USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own expenses"
        ON app_72505145eb_expenses FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own expenses"
        ON app_72505145eb_expenses FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own expenses"
        ON app_72505145eb_expenses FOR DELETE
        USING (auth.uid() = user_id);
END $$;

-- 6. Verify all policies are created
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(DISTINCT cmd::text, ', ') as operations_covered
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'app_72505145eb_purchase_orders',
    'app_72505145eb_income',
    'app_72505145eb_expenses'
)
GROUP BY tablename
ORDER BY tablename;
