export interface IncomeCategory {
  id: string;
  name: string;
  amount: number;
  department?: string;
  notes?: string;
}

export interface Income {
  id: string;
  user_id: string;
  project_name: string;
  client_name: string;
  total_amount: number;
  categories: IncomeCategory[];
  invoice_number?: string;
  invoice_date: string;
  payment_status: 'pending' | 'partial' | 'paid';
  payment_date?: string;
  vat_rate: number;
  vat_amount: number;
  subtotal: number;
  discount?: number;
  agency_fee?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}