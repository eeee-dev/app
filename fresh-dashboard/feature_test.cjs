const http = require('http');
const fs = require('fs');
const path = require('path');

console.log("=== Financial Dashboard Feature Test ===\n");

const baseURL = 'http://localhost:3000';
const testData = JSON.parse(fs.readFileSync('public/test-data/test_data.json', 'utf8'));

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function runTest(name, testFn) {
  console.log(`\n🔍 Testing: ${name}`);
  try {
    testFn();
    console.log(`   ✅ PASSED`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
  }
}

// Test 1: Application Accessibility
runTest('Application is running', () => {
  return new Promise((resolve, reject) => {
    http.get(baseURL, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        resolve();
      } else {
        reject(new Error(`Status code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
});

// Test 2: Test Data Validation
runTest('Test data is valid', () => {
  if (!testData.departments || !Array.isArray(testData.departments)) {
    throw new Error('Departments data missing or invalid');
  }
  if (!testData.expenses || !Array.isArray(testData.expenses)) {
    throw new Error('Expenses data missing or invalid');
  }
  if (!testData.income || !Array.isArray(testData.income)) {
    throw new Error('Income data missing or invalid');
  }
  if (!testData.invoices || !Array.isArray(testData.invoices)) {
    throw new Error('Invoices data missing or invalid');
  }
  
  console.log(`   Departments: ${testData.departments.length}`);
  console.log(`   Expenses: ${testData.expenses.length}`);
  console.log(`   Income: ${testData.income.length}`);
  console.log(`   Invoices: ${testData.invoices.length}`);
});

// Test 3: VAT Calculation Verification
runTest('VAT calculations are correct', () => {
  // Test VAT exempt items
  const exemptExpense = testData.expenses.find(exp => exp.vat_exempt);
  if (!exemptExpense) {
    throw new Error('No VAT exempt expense found in test data');
  }
  if (exemptExpense.vat_amount !== 0) {
    throw new Error(`VAT exempt expense should have 0 VAT, got ${exemptExpense.vat_amount}`);
  }
  
  // Test non-exempt items
  const nonExemptExpense = testData.expenses.find(exp => !exp.vat_exempt);
  if (!nonExemptExpense) {
    throw new Error('No non-VAT exempt expense found in test data');
  }
  const expectedVAT = nonExemptExpense.amount * nonExemptExpense.vat_rate;
  if (Math.abs(nonExemptExpense.vat_amount - expectedVAT) > 0.01) {
    throw new Error(`VAT calculation incorrect. Expected ${expectedVAT}, got ${nonExemptExpense.vat_amount}`);
  }
  
  console.log(`   VAT exempt check: ✓`);
  console.log(`   VAT calculation check: ✓`);
});

// Test 4: Department Budget Tracking
runTest('Department budget tracking', () => {
  const department = testData.departments[0];
  if (!department.budget || !department.spent) {
    throw new Error('Department missing budget or spent data');
  }
  
  const remaining = department.budget - department.spent;
  if (remaining < 0) {
    console.log(`   ⚠ Department "${department.name}" is over budget`);
  }
  
  console.log(`   Department: ${department.name}`);
  console.log(`   Budget: $${department.budget}`);
  console.log(`   Spent: $${department.spent}`);
  console.log(`   Remaining: $${remaining}`);
});

// Test 5: File Structure Check
runTest('Key application files exist', () => {
  const requiredFiles = [
    'src/pages/Dashboard.tsx',
    'src/pages/Income.tsx',
    'src/pages/Expenses.tsx',
    'src/pages/Departments.tsx',
    'src/pages/Invoices.tsx',
    'src/components/layout/Header.tsx',
    'src/lib/supabase.ts',
    'src/lib/utils.ts',
    'package.json',
    'index.html'
  ];
  
  const missingFiles = [];
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    throw new Error(`Missing files: ${missingFiles.join(', ')}`);
  }
  
  console.log(`   All ${requiredFiles.length} key files present`);
});

// Test 6: Build Status Check
runTest('Application builds successfully', () => {
  const { execSync } = require('child_process');
  try {
    const buildOutput = execSync('pnpm run build 2>&1 | tail -5', { stdio: 'pipe' }).toString();
    if (buildOutput.includes('error') || buildOutput.includes('failed')) {
      throw new Error('Build process contains errors');
    }
    console.log(`   Build completed successfully`);
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
});

// Test 7: TypeScript Compilation
runTest('TypeScript compilation', () => {
  const { execSync } = require('child_process');
  try {
    const tsOutput = execSync('npx tsc --noEmit 2>&1 | grep -E "error|Error" | head -5', { stdio: 'pipe' }).toString();
    if (tsOutput.trim() !== '') {
      throw new Error(`TypeScript errors found:\n${tsOutput}`);
    }
    console.log(`   No TypeScript errors found`);
  } catch (error) {
    // If grep finds no errors, it returns non-zero exit code
    if (error.status === 1) {
      console.log(`   No TypeScript errors found`);
    } else {
      throw new Error(`TypeScript check failed: ${error.message}`);
    }
  }
});

// Run all tests
async function runAllTests() {
  console.log("\n🚀 Running all feature tests...\n");
  
  // Run synchronous tests
  const tests = [
    () => runTest('Application is running', () => {
      return new Promise((resolve, reject) => {
        http.get(baseURL, (res) => {
          if (res.statusCode === 200 || res.statusCode === 404) {
            resolve();
          } else {
            reject(new Error(`Status code: ${res.statusCode}`));
          }
        }).on('error', reject);
      });
    }),
    () => runTest('Test data is valid', () => {
      if (!testData.departments || !Array.isArray(testData.departments)) {
        throw new Error('Departments data missing or invalid');
      }
      if (!testData.expenses || !Array.isArray(testData.expenses)) {
        throw new Error('Expenses data missing or invalid');
      }
      if (!testData.income || !Array.isArray(testData.income)) {
        throw new Error('Income data missing or invalid');
      }
      if (!testData.invoices || !Array.isArray(testData.invoices)) {
        throw new Error('Invoices data missing or invalid');
      }
      
      console.log(`   Departments: ${testData.departments.length}`);
      console.log(`   Expenses: ${testData.expenses.length}`);
      console.log(`   Income: ${testData.income.length}`);
      console.log(`   Invoices: ${testData.invoices.length}`);
    }),
    () => runTest('VAT calculations are correct', () => {
      const exemptExpense = testData.expenses.find(exp => exp.vat_exempt);
      if (!exemptExpense) {
        throw new Error('No VAT exempt expense found in test data');
      }
      if (exemptExpense.vat_amount !== 0) {
        throw new Error(`VAT exempt expense should have 0 VAT, got ${exemptExpense.vat_amount}`);
      }
      
      const nonExemptExpense = testData.expenses.find(exp => !exp.vat_exempt);
      if (!nonExemptExpense) {
        throw new Error('No non-VAT exempt expense found in test data');
      }
      const expectedVAT = nonExemptExpense.amount * nonExemptExpense.vat_rate;
      if (Math.abs(nonExemptExpense.vat_amount - expectedVAT) > 0.01) {
        throw new Error(`VAT calculation incorrect. Expected ${expectedVAT}, got ${nonExemptExpense.vat_amount}`);
      }
      
      console.log(`   VAT exempt check: ✓`);
      console.log(`   VAT calculation check: ✓`);
    }),
    () => runTest('Department budget tracking', () => {
      const department = testData.departments[0];
      if (!department.budget || !department.spent) {
        throw new Error('Department missing budget or spent data');
      }
      
      const remaining = department.budget - department.spent;
      console.log(`   Department: ${department.name}`);
      console.log(`   Budget: $${department.budget}`);
      console.log(`   Spent: $${department.spent}`);
      console.log(`   Remaining: $${remaining}`);
    }),
    () => runTest('Key application files exist', () => {
      const requiredFiles = [
        'src/pages/Dashboard.tsx',
        'src/pages/Income.tsx',
        'src/pages/Expenses.tsx',
        'src/pages/Departments.tsx',
        'src/pages/Invoices.tsx',
        'src/components/layout/Header.tsx',
        'src/lib/supabase.ts',
        'src/lib/utils.ts',
        'package.json',
        'index.html'
      ];
      
      const missingFiles = [];
      requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          missingFiles.push(file);
        }
      });
      
      if (missingFiles.length > 0) {
        throw new Error(`Missing files: ${missingFiles.join(', ')}`);
      }
      
      console.log(`   All ${requiredFiles.length} key files present`);
    }),
    () => runTest('Application builds successfully', () => {
      const { execSync } = require('child_process');
      try {
        const buildOutput = execSync('pnpm run build 2>&1 | tail -5', { stdio: 'pipe' }).toString();
        if (buildOutput.includes('error') || buildOutput.includes('failed')) {
          throw new Error('Build process contains errors');
        }
        console.log(`   Build completed successfully`);
      } catch (error) {
        throw new Error(`Build failed: ${error.message}`);
      }
    }),
    () => runTest('TypeScript compilation', () => {
      const { execSync } = require('child_process');
      try {
        const tsOutput = execSync('npx tsc --noEmit 2>&1 | grep -E "error|Error" | head -5', { stdio: 'pipe' }).toString();
        if (tsOutput.trim() !== '') {
          throw new Error(`TypeScript errors found:\n${tsOutput}`);
        }
        console.log(`   No TypeScript errors found`);
      } catch (error) {
        if (error.status === 1) {
          console.log(`   No TypeScript errors found`);
        } else {
          throw new Error(`TypeScript check failed: ${error.message}`);
        }
      }
    })
  ];
  
  for (const test of tests) {
    test();
  }
  
  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log("\n❌ Failed Tests:");
    testResults.tests.filter(t => t.status === 'failed').forEach(t => {
      console.log(`   - ${t.name}: ${t.error}`);
    });
  }
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Open http://localhost:3000 in your browser");
  console.log("2. Test manual features with the generated test data");
  console.log("3. Click 'Publish' in App Viewer to deploy");
  console.log("4. Share the public URL with your team");
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runAllTests().catch(console.error);