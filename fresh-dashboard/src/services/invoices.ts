import { supabase } from '@/lib/supabase';

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  department_id?: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  date: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  description?: string;
  created_by?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

const TABLE_NAME = 'app_72505145eb_invoices';

export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const invoiceData = {
      ...invoice,
      user_id: user?.id
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([invoiceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...invoice, updated_at: new Date().toISOString() })
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