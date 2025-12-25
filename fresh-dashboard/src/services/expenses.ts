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
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify the record exists and belongs to the user
    const { data: existingRecord, error: fetchError } = await supabase
      .from('app_72505145eb_expenses')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error('Expense record not found');
    }

    if (existingRecord.user_id !== user.id) {
      throw new Error('Unauthorized: You can only delete your own expense records');
    }

    // Perform the deletion
    const { error: deleteError } = await supabase
      .from('app_72505145eb_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (deleteError) throw deleteError;

    // Verify deletion was successful
    const { data: verifyData } = await supabase
      .from('app_72505145eb_expenses')
      .select('id')
      .eq('id', id)
      .single();

    if (verifyData) {
      throw new Error('Failed to delete expense record - record still exists');
    }
  }
};