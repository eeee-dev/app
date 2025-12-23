import { supabase } from '@/lib/supabase';

export interface Budget {
  id: string;
  name: string;
  department_id?: string;
  amount: number;
  spent: number;
  period: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'exceeded' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(budget: Omit<Budget, 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([budget])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, budget: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update({ ...budget, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};