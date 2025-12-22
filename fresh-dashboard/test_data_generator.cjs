const fs = require('fs');
const path = require('path');

console.log("=== Financial Dashboard Test Data Generator ===\n");

// Test data for departments
const departments = [
  {
    id: 'dept_001',
    name: 'Marketing',
    budget: 50000,
    spent: 32000,
    manager: 'Alice Johnson',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dept_002',
    name: 'Sales',
    budget: 75000,
    spent: 62000,
    manager: 'Bob Smith',
    status: 'active',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dept_003',
    name: 'Engineering',
    budget: 120000,
    spent: 98000,
    manager: 'Charlie Davis',
    status: 'active',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dept_004',
    name: 'Operations',
    budget: 45000,
    spent: 38000,
    manager: 'Diana Miller',
    status: 'active',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Test data for expenses
const expenses = [
  {
    id: 'exp_001',
    department_id: 'dept_001',
    description: 'Google Ads Campaign',
    amount: 2500,
    vat_amount: 375,
    vat_rate: 0.15,
    vat_exempt: false,
    category: 'Advertising',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved'
  },
  {
    id: 'exp_002',
    department_id: 'dept_002',
    description: 'Sales Conference Tickets',
    amount: 1200,
    vat_amount: 180,
    vat_rate: 0.15,
    vat_exempt: false,
    category: 'Training',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: 'exp_003',
    department_id: 'dept_003',
    description: 'Development Software License',
    amount: 4500,
    vat_amount: 0,
    vat_rate: 0.15,
    vat_exempt: true,
    category: 'Software',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved'
  },
  {
    id: 'exp_004',
    department_id: 'dept_004',
    description: 'Office Supplies',
    amount: 850,
    vat_amount: 127.5,
    vat_rate: 0.15,
    vat_exempt: false,
    category: 'Supplies',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved'
  }
];

// Test data for income
const income = [
  {
    id: 'inc_001',
    description: 'Client Project - Website Redesign',
    amount: 25000,
    vat_amount: 3750,
    vat_rate: 0.15,
    vat_exempt: false,
    client: 'TechCorp Inc.',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'received'
  },
  {
    id: 'inc_002',
    description: 'Monthly Retainer - Marketing Services',
    amount: 15000,
    vat_amount: 2250,
    vat_rate: 0.15,
    vat_exempt: false,
    client: 'Global Retail',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'received'
  },
  {
    id: 'inc_003',
    description: 'Software License Sale',
    amount: 8000,
    vat_amount: 0,
    vat_rate: 0.15,
    vat_exempt: true,
    client: 'StartupXYZ',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: 'inc_004',
    description: 'Consulting Services',
    amount: 12000,
    vat_amount: 1800,
    vat_rate: 0.15,
    vat_exempt: false,
    client: 'Manufacturing Co.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'received'
  }
];

// Test data for invoices
const invoices = [
  {
    id: 'inv_001',
    invoice_number: 'INV-2024-001',
    client: 'TechCorp Inc.',
    amount: 25000,
    vat_amount: 3750,
    vat_rate: 0.15,
    vat_exempt: false,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'paid'
  },
  {
    id: 'inv_002',
    invoice_number: 'INV-2024-002',
    client: 'Global Retail',
    amount: 15000,
    vat_amount: 2250,
    vat_rate: 0.15,
    vat_exempt: false,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'paid'
  },
  {
    id: 'inv_003',
    invoice_number: 'INV-2024-003',
    client: 'StartupXYZ',
    amount: 8000,
    vat_amount: 0,
    vat_rate: 0.15,
    vat_exempt: true,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  }
];

// Create test data summary
const testData = {
  departments,
  expenses,
  income,
  invoices,
  summary: {
    total_departments: departments.length,
    total_expenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    total_income: income.reduce((sum, inc) => sum + inc.amount, 0),
    total_vat_collected: income.filter(inc => !inc.vat_exempt).reduce((sum, inc) => sum + inc.vat_amount, 0),
    total_vat_paid: expenses.filter(exp => !exp.vat_exempt).reduce((sum, exp) => sum + exp.vat_amount, 0),
    net_vat_liability: function() {
      return this.total_vat_collected - this.total_vat_paid;
    }
  }
};

// Save test data to JSON files
const dataDir = path.join(__dirname, 'public', 'test-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(
  path.join(dataDir, 'test_data.json'),
  JSON.stringify(testData, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'departments.json'),
  JSON.stringify(departments, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'expenses.json'),
  JSON.stringify(expenses, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'income.json'),
  JSON.stringify(income, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'invoices.json'),
  JSON.stringify(invoices, null, 2)
);

console.log("✅ Test data generated successfully!");
console.log(`📁 Data saved to: ${dataDir}`);
console.log("\n📊 Test Data Summary:");
console.log("=====================");
console.log(`Departments: ${testData.summary.total_departments}`);
console.log(`Total Expenses: $${testData.summary.total_expenses.toLocaleString()}`);
console.log(`Total Income: $${testData.summary.total_income.toLocaleString()}`);
console.log(`VAT Collected: $${testData.summary.total_vat_collected.toLocaleString()}`);
console.log(`VAT Paid: $${testData.summary.total_vat_paid.toLocaleString()}`);
console.log(`Net VAT Liability: $${testData.summary.net_vat_liability().toLocaleString()}`);
console.log("\n💡 How to use:");
console.log("1. Open the dashboard at http://localhost:3000");
console.log("2. Navigate to different sections to see test data");
console.log("3. Test VAT calculations with exempt vs non-exempt items");
console.log("4. Test department budget tracking");
console.log("5. Test notification system with pending items");