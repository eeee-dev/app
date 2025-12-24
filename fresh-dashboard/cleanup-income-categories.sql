-- Clean up any existing income category tables and constraints
-- Run this FIRST before running the migration script

BEGIN;

-- Drop all related objects with CASCADE to remove dependencies
DROP TABLE IF EXISTS app_72505145eb_income_breakdowns CASCADE;
DROP TABLE IF EXISTS app_72505145eb_income_categories CASCADE;

-- Drop any leftover functions that might exist
DROP FUNCTION IF EXISTS validate_income_breakdown_total() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMIT;

-- After running this, you should see "Success. No rows returned"
-- Then proceed to run the migration script: migration-income-categories-final.sql