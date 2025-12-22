import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  IncomeCategory, 
  IncomeBreakdown, 
  IncomeBreakdownWithCategory,
  IncomeCategoryFormData,
  IncomeBreakdownFormData 
} from './incomeCategoryTypes';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client only if URL and key are provided
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL or Anon Key not configured. Using mock data mode.');
}

// Interface for expense
interface Expense {
  id: string;
  user_id: string;
  department_id: string;
  project_id?: string;
  amount: number;
  vat_amount?: number;
  total_amount?: number;
  vat_rate?: number;
  description: string;
  category: string;
  date: string;
  status: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for income
interface Income {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  source: string;
  date: string;
  invoice_number?: string;
  invoice_url?: string;
  ocr_data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Interface for enhanced income with project/client classification
interface EnhancedIncome {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  department_id?: string;
  project_id?: string;
  project_name?: string;
  project_reference?: string;
  amount: number;
  date: string;
  due_date: string;
  status: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  departments?: {
    name: string;
    budget: number;
    spent: number;
  };
  projects?: {
    name: string;
    code: string;
  };
}

// Interface for invoice
interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  date: string;
  due_date: string;
  status: string;
  items?: Record<string, unknown>;
  tax_amount: number;
  total_amount: number;
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for purchase order
interface PurchaseOrder {
  id: string;
  user_id: string;
  po_number: string;
  vendor_name: string;
  amount: number;
  date: string;
  status: string;
  items?: Record<string, unknown>;
  department_id: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for department
interface Department {
  id: string;
  name: string;
  budget: number;
  spent: number;
  manager?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for project
interface Project {
  id: string;
  name: string;
  code: string;
  department_id: string;
  description: string;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  status: string;
  manager: string;
  team_size: number;
  created_at?: string;
  updated_at?: string;
}

// Interface for client
interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  contact_person?: string;
  payment_terms?: string;
  status: string;
  total_transactions: number;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
}

// Interface for bank statement
interface BankStatement {
  id: string;
  user_id: string;
  bank_name: string;
  account_number?: string;
  statement_date: string;
  file_url: string;
  file_size?: number;
  parsed_data?: Record<string, unknown>;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for transaction
interface Transaction {
  id: string;
  user_id: string;
  bank_statement_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: string;
  category?: string;
  matched_expense_id?: string;
  matched_income_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for bulk import
interface BulkImport {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  import_type: string;
  total_records: number;
  processed_records: number;
  failed_records: number;
  status: string;
  errors?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Interface for settings
interface Settings {
  id: string;
  user_id: string;
  currency: string;
  timezone: string;
  date_format: string;
  decimal_places: number;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for financial dashboard
export const financialDashboardAPI = {
  // Income Category operations
  getIncomeCategories: async (departmentId?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_income_categories')
        .select('*')
        .order('name');

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncomeCategory[];
    } catch (error) {
      console.error('Error fetching income categories:', error);
      return [];
    }
  },

  addIncomeCategory: async (category: IncomeCategoryFormData) => {
    if (!supabase) {
      // Mock response
      const newCategory: IncomeCategory = {
        id: Date.now().toString(),
        ...category,
        created_at: new Date().toISOString()
      };
      return newCategory;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_income_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data as IncomeCategory;
    } catch (error) {
      console.error('Error adding income category:', error);
      return null;
    }
  },

  updateIncomeCategory: async (id: string, updates: Partial<IncomeCategoryFormData>) => {
    if (!supabase) {
      // Mock response
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_income_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as IncomeCategory;
    } catch (error) {
      console.error('Error updating income category:', error);
      return null;
    }
  },

  deleteIncomeCategory: async (id: string) => {
    if (!supabase) {
      // Mock response
      return true;
    }
    
    try {
      const { error } = await supabase
        .from('app_40611b53f9_income_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting income category:', error);
      return false;
    }
  },

  // Income Breakdown operations
  getIncomeBreakdowns: async (incomeId: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_income_breakdowns')
        .select(`
          *,
          categories:category_id (name, description, department_id)
        `)
        .eq('income_id', incomeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as IncomeBreakdownWithCategory[];
    } catch (error) {
      console.error('Error fetching income breakdowns:', error);
      return [];
    }
  },

  addIncomeBreakdown: async (incomeId: string, breakdown: IncomeBreakdownFormData) => {
    if (!supabase) {
      // Mock response
      const newBreakdown: IncomeBreakdown = {
        id: Date.now().toString(),
        income_id: incomeId,
        ...breakdown,
        created_at: new Date().toISOString()
      };
      return newBreakdown;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_income_breakdowns')
        .insert({
          income_id: incomeId,
          ...breakdown
        })
        .select()
        .single();

      if (error) throw error;
      return data as IncomeBreakdown;
    } catch (error) {
      console.error('Error adding income breakdown:', error);
      return null;
    }
  },

  updateIncomeBreakdown: async (id: string, updates: Partial<IncomeBreakdownFormData>) => {
    if (!supabase) {
      // Mock response
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_income_breakdowns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as IncomeBreakdown;
    } catch (error) {
      console.error('Error updating income breakdown:', error);
      return null;
    }
  },

  deleteIncomeBreakdown: async (id: string) => {
    if (!supabase) {
      // Mock response
      return true;
    }
    
    try {
      const { error } = await supabase
        .from('app_40611b53f9_income_breakdowns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting income breakdown:', error);
      return false;
    }
  },

  // Enhanced Income operations with breakdowns
  getEnhancedIncomesWithBreakdowns: async (status?: string, clientName?: string, projectId?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_enhanced_income')
        .select(`
          *,
          departments:department_id (name, budget, spent),
          projects:project_id (name, code),
          breakdowns:app_40611b53f9_income_breakdowns (
            *,
            categories:category_id (name, description, department_id)
          )
        `)
        .order('date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (clientName) {
        query = query.ilike('client_name', `%${clientName}%`);
      }
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching enhanced incomes with breakdowns:', error);
      return [];
    }
  },

  // Department operations
  getDepartments: async () => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },

  addDepartment: async (department: {
    name: string;
    budget?: number;
    manager?: string;
  }) => {
    // Always return mock response for now since authentication is not set up
    const newDepartment: Department = {
      id: Date.now().toString(),
      ...department,
      budget: department.budget || 0,
      spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newDepartment;
  },

  // Project operations
  getProjects: async (departmentId?: string, status?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_projects')
        .select(`
          *,
          departments:department_id (name, budget, spent)
        `)
        .order('created_at', { ascending: false });

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  addProject: async (project: {
    name: string;
    code: string;
    department_id: string;
    description: string;
    budget: number;
    start_date: string;
    end_date: string;
    status: string;
    manager: string;
    team_size: number;
  }) => {
    // Always return mock response for now
    const newProject: Project = {
      id: Date.now().toString(),
      ...project,
      spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newProject;
  },

  updateProject: async (id: string, updates: {
    name?: string;
    description?: string;
    budget?: number;
    status?: string;
    manager?: string;
    team_size?: number;
  }) => {
    if (!supabase) {
      // Mock response
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_projects')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  // Client operations
  getClients: async (status?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_clients')
        .select('*')
        .order('name');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  },

  addClient: async (client: {
    name: string;
    email: string;
    phone: string;
    address: string;
    company?: string;
    contact_person?: string;
    payment_terms?: string;
    status?: string;
  }) => {
    // Always return mock response for now
    const newClient: Client = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      ...client,
      status: client.status || 'active',
      total_transactions: 0,
      total_amount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newClient;
  },

  // Enhanced Income operations
  getEnhancedIncomes: async (status?: string, clientName?: string, projectId?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_enhanced_income')
        .select(`
          *,
          departments:department_id (name, budget, spent),
          projects:project_id (name, code)
        `)
        .order('date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (clientName) {
        query = query.ilike('client_name', `%${clientName}%`);
      }
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching enhanced incomes:', error);
      return [];
    }
  },

  // Legacy income operations (for backward compatibility)
  getIncome: async (status?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_enhanced_income')
        .select('*')
        .order('date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching income:', error);
      return [];
    }
  },

  addEnhancedIncome: async (income: {
    invoice_number: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    client_address: string;
    department_id?: string;
    project_id?: string;
    project_name?: string;
    project_reference?: string;
    amount: number;
    date: string;
    due_date: string;
    description: string;
    status?: string;
  }) => {
    // Always return mock response for now
    const newIncome: EnhancedIncome = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      ...income,
      status: income.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newIncome;
  },

  updateEnhancedIncomeStatus: async (id: string, status: string) => {
    if (!supabase) {
      // Mock response
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_enhanced_income')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating income status:', error);
      return null;
    }
  },

  // Expense operations
  getExpenses: async (departmentId?: string, status?: string, projectId?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_expenses')
        .select(`
          *,
          departments:department_id (name, budget, spent),
          projects:project_id (name, code)
        `)
        .order('date', { ascending: false });

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  addExpense: async (expense: {
    department_id: string;
    project_id?: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    status?: string;
    receipt_url?: string;
  }) => {
    // Always return mock response for now
    const newExpense: Expense = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      ...expense,
      vat_amount: 0,
      total_amount: expense.amount,
      status: expense.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newExpense;
  },

  updateExpense: async (id: string, updates: {
    status?: string;
    description?: string;
    amount?: number;
    category?: string;
    project_id?: string;
  }) => {
    if (!supabase) {
      // Mock response
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_expenses')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating expense:', error);
      return null;
    }
  },

  // Invoice operations
  getInvoices: async (status?: string, clientName?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_invoices')
        .select('*')
        .order('due_date', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }
      if (clientName) {
        query = query.ilike('client_name', `%${clientName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },

  addInvoice: async (invoice: {
    invoice_number: string;
    client_name: string;
    amount: number;
    date: string;
    due_date: string;
    items?: Record<string, unknown>;
    tax_amount?: number;
    total_amount?: number;
    pdf_url?: string;
  }) => {
    // Always return mock response for now
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      ...invoice,
      status: 'pending',
      tax_amount: invoice.tax_amount || 0,
      total_amount: invoice.total_amount || invoice.amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newInvoice;
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    if (!supabase) {
      // Mock response
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_invoices')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return null;
    }
  },

  // Purchase order operations
  getPurchaseOrders: async (status?: string, vendorName?: string) => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      let query = supabase
        .from('app_40611b53f9_purchase_orders')
        .select(`
          *,
          departments:department_id (name)
        `)
        .order('date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (vendorName) {
        query = query.ilike('vendor_name', `%${vendorName}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return [];
    }
  },

  addPurchaseOrder: async (purchaseOrder: {
    po_number: string;
    vendor_name: string;
    amount: number;
    date: string;
    items?: Record<string, unknown>;
    department_id: string;
    status?: string;
  }) => {
    // Always return mock response for now
    const newPO: PurchaseOrder = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      ...purchaseOrder,
      status: purchaseOrder.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newPO;
  },

  // Bank statement operations
  getBankStatements: async () => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_bank_statements')
        .select('*')
        .order('statement_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bank statements:', error);
      return [];
    }
  },

  addBankStatement: async (bankStatement: {
    bank_name: string;
    account_number?: string;
    statement_date: string;
    file_url: string;
    file_size?: number;
  }) => {
    // Always return mock response for now
    const newStatement: BankStatement = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      ...bankStatement,
      status: 'uploaded',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newStatement;
  },

  // Bulk import operations
  getBulkImports: async () => {
    if (!supabase) {
      // Return empty array for mock data
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('app_40611b53f9_bulk_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bulk imports:', error);
      return [];
    }
  },

  addBulkImport: async (bulkImport: {
    file_name: string;
    file_url: string;
    file_type: string;
    import_type: string;
    total_records: number;
  }) => {
    // Always return mock response for now
    const newImport: BulkImport = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      ...bulkImport,
      processed_records: 0,
      failed_records: 0,
      status: 'processing',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newImport;
  },

  // Settings operations
  getSettings: async () => {
    // Return default settings
    return {
      id: '1',
      user_id: 'default-user',
      currency: 'MUR',
      timezone: 'Indian/Mauritius',
      date_format: 'DD/MM/YYYY',
      decimal_places: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  updateSettings: async (settings: {
    currency?: string;
    timezone?: string;
    date_format?: string;
    decimal_places?: number;
  }) => {
    // Mock response
    const defaultSettings = {
      id: '1',
      user_id: 'default-user',
      currency: 'MUR',
      timezone: 'Indian/Mauritius',
      date_format: 'DD/MM/YYYY',
      decimal_places: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { ...defaultSettings, ...settings };
  },

  // Dashboard statistics
  getDashboardStats: async () => {
    if (!supabase) {
      // Return empty stats
      return {
        totalExpenses: 0,
        totalIncome: 0,
        pendingInvoices: 0,
        totalBudget: 0,
        totalSpent: 0,
        budgetUtilization: 0,
        departments: []
      };
    }
    
    try {
      // Get total expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('app_40611b53f9_expenses')
        .select('amount');

      if (expensesError) throw expensesError;

      // Get total income
      const { data: incomes, error: incomesError } = await supabase
        .from('app_40611b53f9_enhanced_income')
        .select('amount');

      if (incomesError) throw incomesError;

      // Get pending invoices
      const { data: pendingInvoices, error: invoicesError } = await supabase
        .from('app_40611b53f9_invoices')
        .select('amount')
        .eq('status', 'pending');

      if (invoicesError) throw invoicesError;

      // Get department budgets
      const { data: departmentBudgets, error: budgetsError } = await supabase
        .from('app_40611b53f9_departments')
        .select('name, budget, spent');

      if (budgetsError) throw budgetsError;

      // Calculate totals
      const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const totalIncome = incomes?.reduce((sum, income) => sum + (income.amount || 0), 0) || 0;
      const totalPendingInvoices = pendingInvoices?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;
      const totalBudget = departmentBudgets?.reduce((sum, dept) => sum + (dept.budget || 0), 0) || 0;
      const totalSpent = departmentBudgets?.reduce((sum, dept) => sum + (dept.spent || 0), 0) || 0;

      return {
        totalExpenses,
        totalIncome,
        pendingInvoices: totalPendingInvoices,
        totalBudget,
        totalSpent,
        budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        departments: departmentBudgets?.map(dept => ({
          name: dept.name,
          budget: dept.budget || 0,
          spent: dept.spent || 0,
          utilization: dept.budget > 0 ? (dept.spent / dept.budget) * 100 : 0
        })) || []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalExpenses: 0,
        totalIncome: 0,
        pendingInvoices: 0,
        totalBudget: 0,
        totalSpent: 0,
        budgetUtilization: 0,
        departments: []
      };
    }
  }
};

// Export supabase client if configured
export { supabase };