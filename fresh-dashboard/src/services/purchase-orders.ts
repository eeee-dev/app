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
    
    if (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
    return data || [];
  },

  async getById(id: string): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching purchase order:', error);
      throw error;
    }
    return data;
  },

  async create(purchaseOrder: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...purchaseOrder, user_id: user?.id }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, purchaseOrder: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...purchaseOrder, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    // First verify the record exists and belongs to the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if the record exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching record before delete:', fetchError);
      throw new Error('Purchase order not found or access denied');
    }

    if (!existingRecord) {
      throw new Error('Purchase order not found');
    }

    // Perform the deletion
    const { error: deleteError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own records
    
    if (deleteError) {
      console.error('Error deleting purchase order:', deleteError);
      throw new Error(`Failed to delete purchase order: ${deleteError.message}`);
    }

    // Verify deletion was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (verifyData) {
      console.error('Purchase order still exists after deletion');
      throw new Error('Deletion verification failed - record still exists');
    }

    console.log('Purchase order deleted successfully:', id);
  }
};