import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrencyMUR } from '@/lib/utils';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  amount: number;
  date: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  items: number;
  description?: string;
  deliveryDate?: string;
  contactPerson?: string;
  contactEmail?: string;
}

interface NewPOForm {
  vendor: string;
  amount: number;
  date: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  items: number;
  description: string;
  deliveryDate: string;
  contactPerson: string;
  contactEmail: string;
}

const STORAGE_KEY = 'purchase_orders_data';

const PurchaseOrders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPurchaseOrders(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading purchase orders:', error);
        setPurchaseOrders([]);
      }
    }
  }, []);

  // Save to localStorage whenever purchaseOrders changes
  useEffect(() => {
    if (purchaseOrders.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchaseOrders));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [purchaseOrders]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [newPO, setNewPO] = useState<NewPOForm>({
    vendor: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    items: 0,
    description: '',
    deliveryDate: '',
    contactPerson: '',
    contactEmail: ''
  });

  const filteredOrders = purchaseOrders.filter(
    (order) =>
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = purchaseOrders.reduce((sum, order) => sum + order.amount, 0);
  const pendingAmount = purchaseOrders
    .filter((order) => order.status === 'pending')
    .reduce((sum, order) => sum + order.amount, 0);
  const approvedAmount = purchaseOrders
    .filter((order) => order.status === 'approved')
    .reduce((sum, order) => sum + order.amount, 0);
  const completedAmount = purchaseOrders
    .filter((order) => order.status === 'completed')
    .reduce((sum, order) => sum + order.amount, 0);

  const handleCreatePO = () => {
    if (!newPO.vendor || newPO.amount <= 0) {
      toast.error('Please fill in vendor name and amount');
      return;
    }

    const createdPO: PurchaseOrder = {
      id: Date.now().toString(),
      poNumber: `PO-2024-${(purchaseOrders.length + 1).toString().padStart(3, '0')}`,
      vendor: newPO.vendor,
      amount: newPO.amount,
      date: newPO.date,
      status: newPO.status,
      items: newPO.items,
      description: newPO.description,
      deliveryDate: newPO.deliveryDate,
      contactPerson: newPO.contactPerson,
      contactEmail: newPO.contactEmail
    };

    setPurchaseOrders([...purchaseOrders, createdPO]);
    toast.success('Purchase order created successfully');
    setIsCreateDialogOpen(false);
    setNewPO({
      vendor: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      items: 0,
      description: '',
      deliveryDate: '',
      contactPerson: '',
      contactEmail: ''
    });
  };

  const handleViewPO = (order: PurchaseOrder) => {
    setSelectedPO(order);
    setIsViewDialogOpen(true);
  };

  const handleEditPO = (order: PurchaseOrder) => {
    setSelectedPO(order);
    setNewPO({
      vendor: order.vendor,
      amount: order.amount,
      date: order.date,
      status: order.status,
      items: order.items,
      description: order.description || '',
      deliveryDate: order.deliveryDate || '',
      contactPerson: order.contactPerson || '',
      contactEmail: order.contactEmail || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePO = () => {
    if (!selectedPO || !newPO.vendor || newPO.amount <= 0) {
      toast.error('Please fill in vendor name and amount');
      return;
    }

    setPurchaseOrders(purchaseOrders.map(po => 
      po.id === selectedPO.id 
        ? {
            ...po,
            vendor: newPO.vendor,
            amount: newPO.amount,
            date: newPO.date,
            status: newPO.status,
            items: newPO.items,
            description: newPO.description,
            deliveryDate: newPO.deliveryDate,
            contactPerson: newPO.contactPerson,
            contactEmail: newPO.contactEmail
          }
        : po
    ));

    toast.success('Purchase order updated successfully');
    setIsEditDialogOpen(false);
    setSelectedPO(null);
    setNewPO({
      vendor: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      items: 0,
      description: '',
      deliveryDate: '',
      contactPerson: '',
      contactEmail: ''
    });
  };

  const handleDeletePO = (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
      toast.success('Purchase order deleted successfully');
      if (isViewDialogOpen) {
        setIsViewDialogOpen(false);
      }
    }
  };

  const handleExport = () => {
    try {
      const headers = ['PO Number', 'Vendor', 'Amount', 'Date', 'Items', 'Status', 'Delivery Date'];
      const csvContent = [
        headers.join(','),
        ...purchaseOrders.map(order => [
          order.poNumber,
          `"${order.vendor}"`,
          order.amount,
          order.date,
          order.items,
          order.status,
          order.deliveryDate || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `purchase_orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Purchase orders exported successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export purchase orders');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100">Draft</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const POFormFields = ({ formData, setFormData }: { formData: NewPOForm; setFormData: (data: NewPOForm) => void }) => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor Name *</Label>
          <Input
            id="vendor"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            placeholder="Enter vendor name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (MUR) *</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            min="0"
            step="100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Order Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Delivery Date</Label>
          <Input
            id="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="items">Number of Items</Label>
          <Input
            id="items"
            type="number"
            value={formData.items}
            onChange={(e) => setFormData({ ...formData, items: parseInt(e.target.value) || 0 })}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed') => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="Enter contact name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter purchase order description..."
          rows={3}
        />
      </div>
    </>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage and track all purchase orders</p>
        </div>
        <div className="flex gap-2">
          <Button className="border border-gray-300 bg-transparent hover:bg-gray-100" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New PO
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <POFormFields formData={newPO} setFormData={setNewPO} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePO}>Create Purchase Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrencyMUR(totalAmount)}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">MUR</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{formatCurrencyMUR(pendingAmount)}</p>
              </div>
              <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{formatCurrencyMUR(approvedAmount)}</p>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{formatCurrencyMUR(completedAmount)}</p>
              </div>
              <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Purchase Orders</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by PO number or vendor..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>All purchase orders and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.poNumber}</TableCell>
                    <TableCell>{order.vendor}</TableCell>
                    <TableCell>{formatCurrencyMUR(order.amount)}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100"
                          onClick={() => handleViewPO(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100"
                          onClick={() => handleEditPO(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600"
                          onClick={() => handleDeletePO(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No purchase orders found. Click "New PO" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">PO Number</Label>
                  <p className="font-medium">{selectedPO.poNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPO.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Vendor</Label>
                  <p className="font-medium">{selectedPO.vendor}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <p className="font-medium">{formatCurrencyMUR(selectedPO.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Order Date</Label>
                  <p className="font-medium">{selectedPO.date}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Delivery Date</Label>
                  <p className="font-medium">{selectedPO.deliveryDate || 'Not specified'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Contact Person</Label>
                  <p className="font-medium">{selectedPO.contactPerson || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Contact Email</Label>
                  <p className="font-medium">{selectedPO.contactEmail || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Number of Items</Label>
                <p className="font-medium">{selectedPO.items}</p>
              </div>
              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="font-medium">{selectedPO.description || 'No description provided'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => selectedPO && handleDeletePO(selectedPO.id)}
            >
              Delete
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                if (selectedPO) {
                  setIsViewDialogOpen(false);
                  handleEditPO(selectedPO);
                }
              }}
            >
              Edit
            </Button>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <POFormFields formData={newPO} setFormData={setNewPO} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePO}>Update Purchase Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;