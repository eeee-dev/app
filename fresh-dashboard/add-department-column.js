const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDepartmentColumn() {
  try {
    console.log('Adding department_id column to income_breakdowns table...');
    
    // First, check if the column already exists
    const checkSql = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'app_40611b53f9_income_breakdowns' 
      AND column_name = 'department_id'
    `;
    
    const { data: checkData, error: checkError } = await supabase.rpc('exec_sql', { sql_query: checkSql });
    
    if (checkError) {
      console.error('Error checking column:', checkError);
    } else if (checkData && checkData.length > 0) {
      console.log('Column department_id already exists in income_breakdowns table');
      return;
    }
    
    // Add the column
    const alterSql = `
      ALTER TABLE app_40611b53f9_income_breakdowns 
      ADD COLUMN department_id UUID REFERENCES app_40611b53f9_departments(id)
    `;
    
    const { error: alterError } = await supabase.rpc('exec_sql', { sql_query: alterSql });
    
    if (alterError) {
      console.error('Error adding column:', alterError);
      return;
    }
    
    console.log('Successfully added department_id column');
    
    // Create index
    const indexSql = `
      CREATE INDEX idx_income_breakdowns_department_id 
      ON app_40611b53f9_income_breakdowns(department_id)
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql_query: indexSql });
    
    if (indexError) {
      console.error('Error creating index:', indexError);
    } else {
      console.log('Successfully created index');
    }
    
    // Update existing breakdowns with department IDs
    const updateSql = `
      UPDATE app_40611b53f9_income_breakdowns ib
      SET department_id = d.id
      FROM app_40611b53f9_departments d
      WHERE ib.category_id IN (
        SELECT id FROM app_40611b53f9_income_categories 
        WHERE default_division = d.name
      )
    `;
    
    const { error: updateError } = await supabase.rpc('exec_sql', { sql_query: updateSql });
    
    if (updateError) {
      console.error('Error updating records:', updateError);
    } else {
      console.log('Successfully updated existing breakdowns with department IDs');
    }
    
    // Verify the column was added
    const verifySql = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'app_40611b53f9_income_breakdowns' 
      ORDER BY ordinal_position
    `;
    
    const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', { sql_query: verifySql });
    
    if (!tableError && tableInfo) {
      console.log('\nCurrent columns in income_breakdowns table:');
      console.log(tableInfo);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addDepartmentColumn();