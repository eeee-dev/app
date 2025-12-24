-- Test 1: Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'app_72505145eb_%'
ORDER BY table_name;

-- Test 2: Check RLS policies for purchase_orders
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has SELECT/DELETE policy'
        ELSE 'No policy'
    END as policy_type
FROM pg_policies 
WHERE tablename = 'app_72505145eb_purchase_orders'
ORDER BY cmd;

-- Test 3: Check RLS policies for income
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'app_72505145eb_income'
ORDER BY cmd;

-- Test 4: Check RLS policies for expenses
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'app_72505145eb_expenses'
ORDER BY cmd;
