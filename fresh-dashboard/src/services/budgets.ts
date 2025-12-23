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

const TABLE_NAME = 'app_72505145eb_budgets';

export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([budget])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, budget: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...budget, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};