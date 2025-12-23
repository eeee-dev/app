import { supabase } from '@/lib/supabase';

export interface Income {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  amount: number;
  date: string;
  due_date?: string;
  status: 'pending' | 'received' | 'overdue' | 'cancelled';
  department_id?: string;
  project_id?: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const incomeService = {
  async getAll(): Promise<Income[]> {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Income | null> {
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(income: Omit<Income, 'created_at' | 'updated_at' | 'created_by'>): Promise<Income> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('income')
      .insert([{ ...income, created_by: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, income: Partial<Income>): Promise<Income> {
    const { data, error } = await supabase
      .from('income')
      .update({ ...income, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};