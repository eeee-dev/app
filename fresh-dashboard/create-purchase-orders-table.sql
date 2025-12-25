-- Create Purchase Orders Table
-- This script creates the necessary tables and policies for the Purchase Orders feature

BEGIN;

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS app_72505145eb_purchase_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    po_number TEXT NOT NULL UNIQUE,
    supplier_name TEXT NOT NULL,
    supplier_email TEXT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'received', 'cancelled')),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'MUR',
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS app_72505145eb_purchase_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID REFERENCES app_72505145eb_purchase_orders(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15, 2) NOT NULL CHECK (unit_price >= 0),
    total DECIMAL(15, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON app_72505145eb_purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON app_72505145eb_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON app_72505145eb_purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON app_72505145eb_purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON app_72505145eb_purchase_order_items(purchase_order_id);

-- Enable Row Level Security
ALTER TABLE app_72505145eb_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_72505145eb_purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_orders table
-- Allow users to view their own purchase orders
CREATE POLICY "allow_read_own_purchase_orders" 
ON app_72505145eb_purchase_orders 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Allow users to insert their own purchase orders
CREATE POLICY "allow_insert_own_purchase_orders" 
ON app_72505145eb_purchase_orders 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own purchase orders
CREATE POLICY "allow_update_own_purchase_orders" 
ON app_72505145eb_purchase_orders 
FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own purchase orders
CREATE POLICY "allow_delete_own_purchase_orders" 
ON app_72505145eb_purchase_orders 
FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- RLS Policies for purchase_order_items table
-- Allow users to view items of their own purchase orders
CREATE POLICY "allow_read_own_purchase_order_items" 
ON app_72505145eb_purchase_order_items 
FOR SELECT 
TO authenticated 
USING (
    purchase_order_id IN (
        SELECT id FROM app_72505145eb_purchase_orders WHERE user_id = auth.uid()
    )
);

-- Allow users to insert items for their own purchase orders
CREATE POLICY "allow_insert_own_purchase_order_items" 
ON app_72505145eb_purchase_order_items 
FOR INSERT 
TO authenticated 
WITH CHECK (
    purchase_order_id IN (
        SELECT id FROM app_72505145eb_purchase_orders WHERE user_id = auth.uid()
    )
);

-- Allow users to update items of their own purchase orders
CREATE POLICY "allow_update_own_purchase_order_items" 
ON app_72505145eb_purchase_order_items 
FOR UPDATE 
TO authenticated 
USING (
    purchase_order_id IN (
        SELECT id FROM app_72505145eb_purchase_orders WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    purchase_order_id IN (
        SELECT id FROM app_72505145eb_purchase_orders WHERE user_id = auth.uid()
    )
);

-- Allow users to delete items of their own purchase orders
CREATE POLICY "allow_delete_own_purchase_order_items" 
ON app_72505145eb_purchase_order_items 
FOR DELETE 
TO authenticated 
USING (
    purchase_order_id IN (
        SELECT id FROM app_72505145eb_purchase_orders WHERE user_id = auth.uid()
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON app_72505145eb_purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON app_72505145eb_purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;