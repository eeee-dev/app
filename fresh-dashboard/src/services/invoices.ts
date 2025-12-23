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
  created_at?: string;
  updated_at?: string;
}

export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(invoice: Omit<Invoice, 'created_at' | 'updated_at' | 'created_by'>): Promise<Invoice> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, created_by: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...invoice, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};