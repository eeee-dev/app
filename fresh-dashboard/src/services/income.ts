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
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const TABLE_NAME = 'app_72505145eb_enhanced_income';

export const incomeService = {
  async getAll(): Promise<Income[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Income | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(income: Omit<Income, 'id' | 'created_at' | 'updated_at'>): Promise<Income> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const incomeData = {
      ...income,
      user_id: user?.id
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([incomeData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, income: Partial<Income>): Promise<Income> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...income, updated_at: new Date().toISOString() })
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