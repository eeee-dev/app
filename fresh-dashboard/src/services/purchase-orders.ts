import { supabase } from '@/lib/supabase';

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface PurchaseOrder {
  id?: string;
  user_id?: string;
  po_number: string;
  supplier_name: string;
  supplier_email: string;
  order_date: string;
  expected_delivery: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  total_amount: number;
  currency: string;
  notes?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderData {
  supplier_name: string;
  supplier_email: string;
  order_date: string;
  expected_delivery: string;
  currency: string;
  notes?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id'>[];
}

/**
 * Generate a unique PO number
 */
export async function generatePONumber(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const year = new Date().getFullYear();
  
  // Get the count of existing POs for this year
  const { count } = await supabase
    .from('app_72505145eb_purchase_orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('order_date', `${year}-01-01`)
    .lte('order_date', `${year}-12-31`);

  const nextNumber = (count || 0) + 1;
  return `PO-${year}-${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Create a new purchase order with items
 */
export async function createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Calculate total amount
  const totalAmount = data.items.reduce((sum, item) => sum + item.total, 0);
  
  // Generate PO number
  const poNumber = await generatePONumber();

  // Insert purchase order
  const { data: purchaseOrder, error: poError } = await supabase
    .from('app_72505145eb_purchase_orders')
    .insert({
      user_id: user.id,
      po_number: poNumber,
      supplier_name: data.supplier_name,
      supplier_email: data.supplier_email,
      order_date: data.order_date,
      expected_delivery: data.expected_delivery,
      status: 'draft',
      total_amount: totalAmount,
      currency: data.currency,
      notes: data.notes,
      created_by: user.email || 'Unknown'
    })
    .select()
    .single();

  if (poError) throw poError;

  // Insert purchase order items
  const itemsToInsert = data.items.map(item => ({
    purchase_order_id: purchaseOrder.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total
  }));

  const { data: items, error: itemsError } = await supabase
    .from('app_72505145eb_purchase_order_items')
    .insert(itemsToInsert)
    .select();

  if (itemsError) throw itemsError;

  return {
    ...purchaseOrder,
    items: items || []
  };
}

/**
 * Get all purchase orders for the current user
 */
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: purchaseOrders, error: poError } = await supabase
    .from('app_72505145eb_purchase_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('order_date', { ascending: false });

  if (poError) throw poError;

  // Fetch items for each purchase order
  const purchaseOrdersWithItems = await Promise.all(
    (purchaseOrders || []).map(async (po) => {
      const { data: items } = await supabase
        .from('app_72505145eb_purchase_order_items')
        .select('*')
        .eq('purchase_order_id', po.id)
        .order('created_at', { ascending: true });

      return {
        ...po,
        items: items || []
      };
    })
  );

  return purchaseOrdersWithItems;
}

/**
 * Get a single purchase order by ID
 */
export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: purchaseOrder, error: poError } = await supabase
    .from('app_72505145eb_purchase_orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (poError) throw poError;

  const { data: items } = await supabase
    .from('app_72505145eb_purchase_order_items')
    .select('*')
    .eq('purchase_order_id', id)
    .order('created_at', { ascending: true });

  return {
    ...purchaseOrder,
    items: items || []
  };
}

/**
 * Update purchase order status
 */
export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrder['status']
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('app_72505145eb_purchase_orders')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Update purchase order
 */
export async function updatePurchaseOrder(
  id: string,
  updates: Partial<Omit<PurchaseOrder, 'id' | 'user_id' | 'po_number' | 'created_at' | 'updated_at' | 'items'>>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('app_72505145eb_purchase_orders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Delete a purchase order (will cascade delete items)
 */
export async function deletePurchaseOrder(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('app_72505145eb_purchase_orders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Get purchase order statistics
 */
export async function getPurchaseOrderStats(): Promise<{
  total: number;
  draft: number;
  pending: number;
  approved: number;
  received: number;
  cancelled: number;
  totalValue: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: purchaseOrders } = await supabase
    .from('app_72505145eb_purchase_orders')
    .select('status, total_amount')
    .eq('user_id', user.id);

  if (!purchaseOrders) {
    return {
      total: 0,
      draft: 0,
      pending: 0,
      approved: 0,
      received: 0,
      cancelled: 0,
      totalValue: 0
    };
  }

  return {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    pending: purchaseOrders.filter(po => po.status === 'pending').length,
    approved: purchaseOrders.filter(po => po.status === 'approved').length,
    received: purchaseOrders.filter(po => po.status === 'received').length,
    cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0)
  };
}