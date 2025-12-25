import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Filter, Download, Eye, Edit2, Trash2, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  supplier_email: string;
  order_date: string;
  expected_delivery: string;
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
  total_amount: number;
  currency: string;
  items: PurchaseOrderItem[];
  notes?: string;
  created_by: string;
  created_at: string;
}

interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface NewPurchaseOrder {
  supplier_name: string;
  supplier_email: string;
  order_date: string;
  expected_delivery: string;
  currency: string;
  notes: string;
  items: PurchaseOrderItem[];
}

const PurchaseOrders: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [newPO, setNewPO] = useState<NewPurchaseOrder>({
    supplier_name: '',
    supplier_email: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    currency: 'MUR',
    notes: '',
    items: [{ id: '1', description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data since we haven't created the database table yet
      // In production, this would query Supabase
      const mockData: PurchaseOrder[] = [
        {
          id: '1',
          po_number: 'PO-2024-001',
          supplier_name: 'Office Supplies Ltd',
          supplier_email: 'sales@officesupplies.mu',
          order_date: '2024-01-15',
          expected_delivery: '2024-01-25',
          status: 'approved',
          total_amount: 15000,
          currency: 'MUR',
          items: [
            { id: '1', description: 'Office Chairs (Ergonomic)', quantity: 10, unit_price: 1200, total: 12000 },
            { id: '2', description: 'Standing Desks', quantity: 5, unit_price: 600, total: 3000 }
          ],
          notes: 'Urgent delivery required for new office setup',
          created_by: 'd@eeee.mu',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          po_number: 'PO-2024-002',
          supplier_name: 'Tech Solutions Mauritius',
          supplier_email: 'orders@techsolutions.mu',
          order_date: '2024-01-18',
          expected_delivery: '2024-02-01',
          status: 'pending',
          total_amount: 45000,
          currency: 'MUR',
          items: [
            { id: '1', description: 'Laptops (Dell XPS 15)', quantity: 3, unit_price: 15000, total: 45000 }
          ],
          notes: 'Awaiting approval from finance department',
          created_by: 'd@eeee.mu',
          created_at: '2024-01-18T14:30:00Z'
        },
        {
          id: '3',
          po_number: 'PO-2024-003',
          supplier_name: 'Catering Services Plus',
          supplier_email: 'info@cateringplus.mu',
          order_date: '2024-01-20',
          expected_delivery: '2024-01-22',
          status: 'received',
          total_amount: 8500,
          currency: 'MUR',
          items: [
            { id: '1', description: 'Corporate Event Catering (50 pax)', quantity: 1, unit_price: 8500, total: 8500 }
          ],
          created_by: 'd@eeee.mu',
          created_at: '2024-01-20T09:00:00Z'
        },
        {
          id: '4',
          po_number: 'PO-2024-004',
          supplier_name: 'Marketing Materials Co',
          supplier_email: 'print@marketing.mu',
          order_date: '2024-01-22',
          expected_delivery: '2024-02-05',
          status: 'draft',
          total_amount: 12000,
          currency: 'MUR',
          items: [
            { id: '1', description: 'Business Cards (Premium)', quantity: 1000, unit_price: 5, total: 5000 },
            { id: '2', description: 'Brochures (A4, Full Color)', quantity: 500, unit_price: 14, total: 7000 }
          ],
          notes: 'Draft - awaiting final design approval',
          created_by: 'd@eeee.mu',
          created_at: '2024-01-22T11:00:00Z'
        }
      ];

      setPurchaseOrders(mockData);
      
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async () => {
    if (!newPO.supplier_name || !newPO.supplier_email || !newPO.expected_delivery) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newPO.items.length === 0 || newPO.items.some(item => !item.description || item.quantity <= 0)) {
      toast.error('Please add at least one valid item');
      return;
    }

    try {
      const totalAmount = newPO.items.reduce((sum, item) => sum + item.total, 0);
      const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

      const newPurchaseOrder: PurchaseOrder = {
        id: Date.now().toString(),
        po_number: poNumber,
        supplier_name: newPO.supplier_name,
        supplier_email: newPO.supplier_email,
        order_date: newPO.order_date,
        expected_delivery: newPO.expected_delivery,
        status: 'draft',
        total_amount: totalAmount,
        currency: newPO.currency,
        items: newPO.items,
        notes: newPO.notes,
        created_by: 'd@eeee.mu',
        created_at: new Date().toISOString()
      };

      setPurchaseOrders([newPurchaseOrder, ...purchaseOrders]);
      toast.success(`Purchase Order ${poNumber} created successfully!`);
      
      // Reset form
      setNewPO({
        supplier_name: '',
        supplier_email: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        currency: 'MUR',
        notes: '',
        items: [{ id: '1', description: '', quantity: 1, unit_price: 0, total: 0 }]
      });
      
      setIsCreateDialogOpen(false);
      
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('Failed to create purchase order');
    }
  };

  const handleAddItem = () => {
    const newItem: PurchaseOrderItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    };
    setNewPO({ ...newPO, items: [...newPO.items, newItem] });
  };

  const handleRemoveItem = (itemId: string) => {
    if (newPO.items.length > 1) {
      setNewPO({ ...newPO, items: newPO.items.filter(item => item.id !== itemId) });
    }
  };

  const handleItemChange = (itemId: string, field: keyof PurchaseOrderItem, value: string | number) => {
    const updatedItems = newPO.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    });
    setNewPO({ ...newPO, items: updatedItems });
  };

  const handleUpdateStatus = async (poId: string, newStatus: PurchaseOrder['status']) => {
    try {
      setPurchaseOrders(purchaseOrders.map(po => 
        po.id === poId ? { ...po, status: newStatus } : po
      ));
      toast.success(`Purchase order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeletePO = async (poId: string, poNumber: string) => {
    if (window.confirm(`Are you sure you want to delete ${poNumber}?`)) {
      try {
        setPurchaseOrders(purchaseOrders.filter(po => po.id !== poId));
        toast.success('Purchase order deleted successfully');
      } catch (error) {
        console.error('Error deleting purchase order:', error);
        toast.error('Failed to delete purchase order');
      }
    }
  };

  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsViewDialogOpen(true);
  };

  const handleExportPO = (po: PurchaseOrder) => {
    toast.success(`Exporting ${po.po_number} as PDF...`);
    console.log('Exporting PO:', po);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit2 className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      case 'received': return <Check className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredPurchaseOrders.reduce((sum, po) => sum + po.total_amount, 0);
  const statusCounts = {
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    pending: purchaseOrders.filter(po => po.status === 'pending').length,
    approved: purchaseOrders.filter(po => po.status === 'approved').length,
    received: purchaseOrders.filter(po => po.status === 'received').length,
    cancelled: purchaseOrders.filter(po => po.status === 'cancelled').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all purchase orders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-name">Supplier Name *</Label>
                  <Input
                    id="supplier-name"
                    placeholder="Enter supplier name"
                    value={newPO.supplier_name}
                    onChange={(e) => setNewPO({ ...newPO, supplier_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-email">Supplier Email *</Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    placeholder="supplier@example.com"
                    value={newPO.supplier_email}
                    onChange={(e) => setNewPO({ ...newPO, supplier_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-date">Order Date</Label>
                  <Input
                    id="order-date"
                    type="date"
                    value={newPO.order_date}
                    onChange={(e) => setNewPO({ ...newPO, order_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected-delivery">Expected Delivery *</Label>
                  <Input
                    id="expected-delivery"
                    type="date"
                    value={newPO.expected_delivery}
                    onChange={(e) => setNewPO({ ...newPO, expected_delivery: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newPO.currency} onValueChange={(value) => setNewPO({ ...newPO, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MUR">MUR (₨)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                {newPO.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-5 space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Total</Label>
                      <Input
                        type="number"
                        value={item.total.toFixed(2)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={newPO.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end p-4 bg-gray-50 rounded-lg">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {newPO.currency} {newPO.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or special instructions..."
                  rows={3}
                  value={newPO.notes}
                  onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePO}>
                Create Purchase Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.draft}</p>
              </div>
              <Edit2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.approved}</p>
              </div>
              <Check className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Received</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.received}</p>
              </div>
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₨{totalAmount.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by PO number or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders ({filteredPurchaseOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading purchase orders...</p>
            </div>
          ) : filteredPurchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No purchase orders found</p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Purchase Order
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.po_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{po.supplier_name}</p>
                        <p className="text-sm text-gray-500">{po.supplier_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(po.expected_delivery).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(po.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(po.status)}
                          {po.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {po.currency} {po.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPO(po)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportPO(po)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Select
                          value={po.status}
                          onValueChange={(value) => handleUpdateStatus(po.id, value as PurchaseOrder['status'])}
                        >
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePO(po.id, po.po_number)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View PO Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">PO Number</Label>
                  <p className="font-medium">{selectedPO.po_number}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedPO.status)}>
                    {selectedPO.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Supplier</Label>
                  <p className="font-medium">{selectedPO.supplier_name}</p>
                  <p className="text-sm text-gray-500">{selectedPO.supplier_email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Order Date</Label>
                  <p className="font-medium">{new Date(selectedPO.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Expected Delivery</Label>
                  <p className="font-medium">{new Date(selectedPO.expected_delivery).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Created By</Label>
                  <p className="font-medium">{selectedPO.created_by}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600 mb-2 block">Order Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPO.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{selectedPO.currency} {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">{selectedPO.currency} {item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end p-4 bg-gray-50 rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedPO.currency} {selectedPO.total_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedPO.notes && (
                <div>
                  <Label className="text-gray-600">Notes</Label>
                  <p className="mt-1 text-gray-700">{selectedPO.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedPO && handleExportPO(selectedPO)}>
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;