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
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify the record exists and belongs to the user
    const { data: existingRecord, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error('Income record not found');
    }

    if (existingRecord.user_id !== user.id) {
      throw new Error('Unauthorized: You can only delete your own income records');
    }

    // Perform the deletion
    const { error: deleteError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (deleteError) throw deleteError;

    // Verify deletion was successful
    const { data: verifyData } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('id', id)
      .single();

    if (verifyData) {
      throw new Error('Failed to delete income record - record still exists');
    }
  }
};