// Income Category Types
export interface IncomeCategory {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
  created_at?: string;
}

export interface IncomeBreakdown {
  id: string;
  income_id: string;
  category_id: string;
  amount: number;
  notes?: string;
  created_at?: string;
}

export interface IncomeBreakdownWithCategory extends IncomeBreakdown {
  categories?: {
    name: string;
    description?: string;
    department_id?: string;
  };
}

export interface EnhancedIncomeWithBreakdowns {
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
  breakdowns?: IncomeBreakdownWithCategory[];
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

// Form types
export interface IncomeCategoryFormData {
  name: string;
  description?: string;
  department_id?: string;
}

export interface IncomeBreakdownFormData {
  category_id: string;
  amount: number;
  notes?: string;
}