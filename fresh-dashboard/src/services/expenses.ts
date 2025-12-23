import { supabase } from '@/lib/supabase';

export interface Expense {
  id: string;
  user_id?: string;
  department_id?: string;
  project_id?: string;
  description: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  receipt_url?: string;
  notes?: string;
  created_by?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const expensesService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('app_72505145eb_expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('app_72505145eb_expenses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(expense: Omit<Expense, 'created_at' | 'updated_at' | 'created_by'>): Promise<Expense> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('app_72505145eb_expenses')
      .insert([{ ...expense, created_by: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, expense: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase
      .from('app_72505145eb_expenses')
      .update({ ...expense, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_72505145eb_expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};