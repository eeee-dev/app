import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Final Fix for Financial Dashboard ===\n');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTableSchema() {
  console.log('=== Checking Table Schemas ===');
  
  // Check departments table schema
  try {
    const { data: schemaData, error } = await supabaseAdmin
      .from('app_40611b53f9_departments')
      .select('*')
      .limit(0);
    
    if (error) {
      console.log(`❌ Error checking departments schema: ${error.message}`);
      return false;
    }
    
    console.log('✅ Departments table exists');
    
    // Try to get column information by attempting to insert with minimal data
    const testInsert = {
      name: 'Test Department Schema Check'
    };
    
    const { error: insertError } = await supabaseAdmin
      .from('app_40611b53f9_departments')
      .insert([testInsert]);
    
    if (insertError && insertError.message.includes('description')) {
      console.log('⚠️ Departments table might not have description column');
      console.log('Trying without description...');
      return true;
    } else if (insertError) {
      console.log(`❌ Insert test failed: ${insertError.message}`);
      return false;
    } else {
      console.log('✅ Departments table has expected schema');
      // Clean up test record
      await supabaseAdmin
        .from('app_40611b53f9_departments')
        .delete()
        .eq('name', 'Test Department Schema Check');
      return true;
    }
  } catch (err) {
    console.log(`❌ Error in checkTableSchema: ${err.message}`);
    return false;
  }
}

async function importDepartments() {
  console.log('\n=== Importing Departments ===');
  
  // Check if departments already exist
  const { data: existingDepts, error: checkError } = await supabaseAdmin
    .from('app_40611b53f9_departments')
    .select('*');
  
  if (checkError) {
    console.log(`❌ Error checking departments: ${checkError.message}`);
    return false;
  }
  
  if (existingDepts && existingDepts.length > 0) {
    console.log(`✅ Departments already exist (${existingDepts.length} rows)`);
    console.log('Existing departments:');
    existingDepts.forEach(dept => {
      console.log(`  - ${dept.name}`);
    });
    return true;
  }
  
  // Departments to import (without description if column doesn't exist)
  const departments = [
    { name: 'ë • visuals (formerly zimazë)' },
    { name: 'ë • media' },
    { name: 'ë • tech' },
    { name: 'ë • events' },
    { name: 'ë • academy' },
    { name: 'ë • foundation' }
  ];
  
  console.log('Importing 6 departments...');
  
  try {
    const { data, error } = await supabaseAdmin
      .from('app_40611b53f9_departments')
      .insert(departments)
      .select();
    
    if (error) {
      console.log(`❌ Error importing departments: ${error.message}`);
      
      // Try without description
      console.log('Trying simplified import (name only)...');
      const simplifiedDepts = departments.map(dept => ({ name: dept.name }));
      
      const { data: simpleData, error: simpleError } = await supabaseAdmin
        .from('app_40611b53f9_departments')
        .insert(simplifiedDepts)
        .select();
      
      if (simpleError) {
        console.log(`❌ Simplified import also failed: ${simpleError.message}`);
        return false;
      }
      
      console.log(`✅ Successfully imported ${simpleData?.length || 0} departments (simplified)`);
      return true;
    }
    
    console.log(`✅ Successfully imported ${data?.length || 0} departments`);
    return true;
  } catch (err) {
    console.log(`❌ Error in importDepartments: ${err.message}`);
    return false;
  }
}

async function checkExistingData() {
  console.log('\n=== Checking Existing Data ===');
  
  const tables = [
    { name: 'app_40611b53f9_departments', description: 'Departments' },
    { name: 'app_40611b53f9_enhanced_income', description: 'Income Records' },
    { name: 'app_40611b53f9_income_breakdowns', description: 'Income Breakdowns' },
    { name: 'app_40611b53f9_expenses', description: 'Expenses' },
    { name: 'app_40611b53f9_income_categories', description: 'Income Categories' }
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabaseAdmin
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table.description}: ${error.message}`);
      } else {
        console.log(`📊 ${table.description}: ${count} rows`);
        
        // Show sample data for non-empty tables
        if (count > 0 && count <= 20) {
          const { data: sampleData } = await supabaseAdmin
            .from(table.name)
            .select('*')
            .limit(3);
          
          if (sampleData && sampleData.length > 0) {
            console.log('  Sample:');
            sampleData.forEach((item, index) => {
              if (table.name === 'app_40611b53f9_enhanced_income') {
                console.log(`    ${index + 1}. ${item.project_name}: Rs ${item.total_amount}`);
              } else if (table.name === 'app_40611b53f9_income_breakdowns') {
                console.log(`    ${index + 1}. ${item.department_name}: Rs ${item.amount}`);
              } else if (table.name === 'app_40611b53f9_departments') {
                console.log(`    ${index + 1}. ${item.name}`);
              }
            });
          }
        }
      }
    } catch (err) {
      console.log(`❌ ${table.description}: ${err.message}`);
    }
  }
}

async function testUserAccess() {
  console.log('\n=== Testing User Access ===');
  
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test reading departments
    const { data: deptData, error: deptError } = await supabaseAnon
      .from('app_40611b53f9_departments')
      .select('*');
    
    if (deptError) {
      console.log(`❌ User cannot read departments: ${deptError.message}`);
      return false;
    }
    
    console.log(`✅ User can read departments (${deptData?.length || 0} rows)`);
    
    // Test reading income
    const { data: incomeData, error: incomeError } = await supabaseAnon
      .from('app_40611b53f9_enhanced_income')
      .select('*');
    
    if (incomeError) {
      console.log(`❌ User cannot read income: ${incomeError.message}`);
      return false;
    }
    
    console.log(`✅ User can read income records (${incomeData?.length || 0} rows)`);
    
    // Test reading income breakdowns
    const { data: breakdownData, error: breakdownError } = await supabaseAnon
      .from('app_40611b53f9_income_breakdowns')
      .select('*');
    
    if (breakdownError) {
      console.log(`❌ User cannot read income breakdowns: ${breakdownError.message}`);
      return false;
    }
    
    console.log(`✅ User can read income breakdowns (${breakdownData?.length || 0} rows)`);
    
    return true;
  } catch (err) {
    console.log(`❌ Error testing user access: ${err.message}`);
    return false;
  }
}

async function calculateTotalIncome() {
  console.log('\n=== Calculating Total Income ===');
  
  try {
    // Get all income records
    const { data: incomeRecords, error } = await supabaseAdmin
      .from('app_40611b53f9_enhanced_income')
      .select('total_amount');
    
    if (error) {
      console.log(`❌ Error calculating income: ${error.message}`);
      return 0;
    }
    
    const totalIncome = incomeRecords.reduce((sum, record) => sum + (record.total_amount || 0), 0);
    console.log(`💰 Total Income in database: Rs ${totalIncome.toLocaleString()}`);
    
    // Get breakdown total
    const { data: breakdowns, error: breakdownError } = await supabaseAdmin
      .from('app_40611b53f9_income_breakdowns')
      .select('amount');
    
    if (!breakdownError && breakdowns) {
      const breakdownTotal = breakdowns.reduce((sum, breakdown) => sum + (breakdown.amount || 0), 0);
      console.log(`📊 Total from breakdowns: Rs ${breakdownTotal.toLocaleString()}`);
    }
    
    return totalIncome;
  } catch (err) {
    console.log(`❌ Error in calculateTotalIncome: ${err.message}`);
    return 0;
  }
}

async function main() {
  console.log('Starting final fix for Financial Dashboard...\n');
  
  // Step 1: Check table schemas
  const schemaOk = await checkTableSchema();
  
  // Step 2: Import departments
  const departmentsImported = await importDepartments();
  
  // Step 3: Check existing data
  await checkExistingData();
  
  // Step 4: Calculate total income
  await calculateTotalIncome();
  
  // Step 5: Test user access
  const userAccess = await testUserAccess();
  
  console.log('\n=== Final Fix Summary ===');
  console.log(`1. Table Schema Check: ${schemaOk ? '✅ OK' : '❌ Issues'}`);
  console.log(`2. Departments Import: ${departmentsImported ? '✅ Imported' : '❌ Failed'}`);
  console.log(`3. User Access Test: ${userAccess ? '✅ Passed' : '❌ Failed'}`);
  
  if (departmentsImported && userAccess) {
    console.log('\n🎉 Dashboard should now show correct financial data!');
    console.log('\nNext steps:');
    console.log('1. Refresh the dashboard at: http://localhost:5175/');
    console.log('2. Log in with your credentials');
    console.log('3. Check if financial data is displayed correctly');
    console.log('4. If data shows Rs 0, check if RLS policies need manual fixing');
  } else {
    console.log('\n⚠️ Some issues remain:');
    if (!departmentsImported) {
      console.log('- Departments were not imported (table might have different schema)');
    }
    if (!userAccess) {
      console.log('- User cannot access data (RLS policies might be too restrictive)');
      console.log('  Run the SQL from CURRENT_ISSUES.md in Supabase SQL Editor');
    }
  }
}

main().catch(console.error);