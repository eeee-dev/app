import { supabase } from '@/lib/supabase';

export interface PurchaseOrder {
  id: string;
  user_id?: string;
  po_number: string;
  vendor_name: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  items?: Record<string, unknown>;
  department_id?: string;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
}

const TABLE_NAME = 'app_72505145eb_purchase_orders';

export const purchaseOrdersService = {
  async getAll(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(purchaseOrder: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...purchaseOrder, user_id: user?.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, purchaseOrder: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...purchaseOrder, updated_at: new Date().toISOString() })
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