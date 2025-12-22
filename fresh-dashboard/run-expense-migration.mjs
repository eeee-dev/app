import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ssekkfxkigyavgljszpc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0Njk4NiwiZXhwIjoyMDgxMzIyOTg2fQ.UqfZDevGXHTbijukszTeV2GthnAIzmT00SpeaJkSq4Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runExpenseMigration() {
  console.log('🚀 Starting Expense Tracking Migration...\n');
  
  try {
    // Read the SQL migration file
    const sql = fs.readFileSync('supabase-migrations/002_expense_tracking.sql', 'utf8');
    
    // Extract individual SQL statements (handling multi-line statements)
    const statements = [];
    let currentStatement = '';
    
    sql.split('\n').forEach(line => {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('--')) return;
      
      // Skip BEGIN and COMMIT
      if (trimmed === 'BEGIN;' || trimmed === 'COMMIT;') return;
      
      currentStatement += ' ' + trimmed;
      
      // If line ends with semicolon, we have a complete statement
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim().slice(0, -1); // Remove trailing semicolon
        if (stmt) statements.push(stmt);
        currentStatement = '';
      }
    });
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Execute using Supabase client's query method
        const { data, error } = await supabase.rpc('exec_sql', { query: statement });
        
        if (error) {
          // Check if it's an "already exists" error
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42P07' || // relation already exists
              error.code === '42710') { // object already exists
            console.log(`⚠️  Statement ${i + 1}/${statements.length} - Object already exists (skipped)`);
            successCount++;
          } else {
            console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error.message);
            errorCount++;
          }
        } else {
          successCount++;
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1}/${statements.length} error:`, err.message);
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migration completed: ${successCount} successful, ${errorCount} errors`);
    console.log('='.repeat(60) + '\n');
    
    // Verify tables were created
    console.log('🔍 Verifying expense tables...\n');
    
    const { data: categories, error: catError } = await supabase
      .from('app_40611b53f9_expense_categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('❌ Error checking expense_categories table:', catError.message);
    } else {
      console.log(`✅ expense_categories table exists with ${categories?.length || 0} sample records`);
      if (categories && categories.length > 0) {
        console.log('   Sample categories:', categories.map(c => c.name).join(', '));
      }
    }
    
    const { data: expenses, error: expError } = await supabase
      .from('app_40611b53f9_expenses')
      .select('*')
      .limit(1);
    
    if (expError) {
      console.error('❌ Error checking expenses table:', expError.message);
    } else {
      console.log(`✅ expenses table exists`);
    }
    
    const { data: receivables, error: recError } = await supabase
      .from('app_40611b53f9_receivables')
      .select('*')
      .limit(1);
    
    if (recError) {
      console.error('❌ Error checking receivables table:', recError.message);
    } else {
      console.log(`✅ receivables table exists`);
    }
    
    console.log('\n🎉 Expense migration verification complete!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runExpenseMigration();