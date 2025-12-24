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
import { purchaseOrdersService, PurchaseOrder } from '@/services/purchase-orders';
import { departmentsService, Department } from '@/services/departments';
import { projectsService, Project } from '@/services/projects';

interface NewPOForm {
  vendor_name: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  department_id: string;
  project_id: string;
  po_number: string;
}

const PurchaseOrders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [newPO, setNewPO] = useState<NewPOForm>({
    vendor_name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    department_id: '',
    project_id: '',
    po_number: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [posData, departmentsData, projectsData] = await Promise.all([
        purchaseOrdersService.getAll(),
        departmentsService.getAll(),
        projectsService.getAll()
      ]);
      setPurchaseOrders(posData);
      setDepartments(departmentsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = purchaseOrders.filter(
    (order) =>
      order.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const generatePONumber = () => {
    const year = new Date().getFullYear();
    const count = purchaseOrders.length + 1;
    return `PO-${year}-${count.toString().padStart(4, '0')}`;
  };

  const handleCreatePO = async () => {
    if (!newPO.vendor_name || newPO.amount <= 0) {
      toast.error('Please fill in vendor name and amount');
      return;
    }

    try {
      await purchaseOrdersService.create({
        po_number: newPO.po_number || generatePONumber(),
        vendor_name: newPO.vendor_name,
        amount: newPO.amount,
        date: newPO.date,
        status: newPO.status,
        department_id: newPO.department_id || undefined,
        project_id: newPO.project_id || undefined
      });

      await loadData();
      toast.success('Purchase order created successfully');
      setIsCreateDialogOpen(false);
      setNewPO({
        vendor_name: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        department_id: '',
        project_id: '',
        po_number: ''
      });
    } catch (error) {
      console.error('Error creating PO:', error);
      toast.error('Failed to create purchase order');
    }
  };

  const handleViewPO = (order: PurchaseOrder) => {
    setSelectedPO(order);
    setIsViewDialogOpen(true);
  };

  const handleEditPO = (order: PurchaseOrder) => {
    setSelectedPO(order);
    setNewPO({
      vendor_name: order.vendor_name,
      amount: order.amount,
      date: order.date,
      status: order.status,
      department_id: order.department_id || '',
      project_id: order.project_id || '',
      po_number: order.po_number
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePO = async () => {
    if (!selectedPO || !newPO.vendor_name || newPO.amount <= 0) {
      toast.error('Please fill in vendor name and amount');
      return;
    }

    try {
      await purchaseOrdersService.update(selectedPO.id, {
        vendor_name: newPO.vendor_name,
        amount: newPO.amount,
        date: newPO.date,
        status: newPO.status,
        department_id: newPO.department_id || undefined,
        project_id: newPO.project_id || undefined
      });

      await loadData();
      toast.success('Purchase order updated successfully');
      setIsEditDialogOpen(false);
      setSelectedPO(null);
      setNewPO({
        vendor_name: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        department_id: '',
        project_id: '',
        po_number: ''
      });
    } catch (error) {
      console.error('Error updating PO:', error);
      toast.error('Failed to update purchase order');
    }
  };

  const handleDeletePO = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await purchaseOrdersService.delete(id);
        await loadData();
        toast.success('Purchase order deleted successfully');
        if (isViewDialogOpen) {
          setIsViewDialogOpen(false);
        }
      } catch (error) {
        console.error('Error deleting PO:', error);
        toast.error('Failed to delete purchase order');
      }
    }
  };

  const handleExport = () => {
    try {
      const headers = ['PO Number', 'Vendor', 'Amount', 'Date', 'Department', 'Project', 'Status'];
      const csvContent = [
        headers.join(','),
        ...purchaseOrders.map(order => [
          order.po_number,
          `"${order.vendor_name}"`,
          order.amount,
          order.date,
          order.department_id ? departments.find(d => d.id === order.department_id)?.name || 'Unknown' : 'Not assigned',
          order.project_id ? projects.find(p => p.id === order.project_id)?.name || 'Unknown' : 'Not assigned',
          order.status
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
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const POFormFields = ({ formData, setFormData }: { formData: NewPOForm; setFormData: (data: NewPOForm) => void }) => (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Flexible Assignment:</strong> You can assign this PO to a department, a project, or both. For general purchases, leave both unselected.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="po_number">PO Number</Label>
          <Input
            id="po_number"
            value={formData.po_number}
            onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
            placeholder={generatePONumber()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor_name">Vendor Name *</Label>
          <Input
            id="vendor_name"
            value={formData.vendor_name}
            onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
            placeholder="Enter vendor name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="date">Order Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department_id">Department (Optional)</Label>
          <Select 
            value={formData.department_id} 
            onValueChange={(value) => setFormData({ ...formData, department_id: value === 'none' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No department</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project_id">Project (Optional)</Label>
          <Select 
            value={formData.project_id} 
            onValueChange={(value) => setFormData({ ...formData, project_id: value === 'none' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.code} - {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled') => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

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
                  <TableHead>Department</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.po_number}</TableCell>
                    <TableCell>{order.vendor_name}</TableCell>
                    <TableCell>
                      {order.department_id 
                        ? departments.find(d => d.id === order.department_id)?.name || 'Unknown'
                        : <span className="text-gray-400 italic">Not assigned</span>
                      }
                    </TableCell>
                    <TableCell>
                      {order.project_id 
                        ? projects.find(p => p.id === order.project_id)?.name || 'Unknown'
                        : <span className="text-gray-400 italic">Not assigned</span>
                      }
                    </TableCell>
                    <TableCell>{formatCurrencyMUR(order.amount)}</TableCell>
                    <TableCell>{order.date}</TableCell>
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
                  <p className="font-medium">{selectedPO.po_number}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPO.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Vendor</Label>
                  <p className="font-medium">{selectedPO.vendor_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <p className="font-medium">{formatCurrencyMUR(selectedPO.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Department</Label>
                  <p className="font-medium">
                    {selectedPO.department_id 
                      ? departments.find(d => d.id === selectedPO.department_id)?.name || 'Unknown'
                      : 'Not assigned'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Project</Label>
                  <p className="font-medium">
                    {selectedPO.project_id 
                      ? projects.find(p => p.id === selectedPO.project_id)?.name || 'Unknown'
                      : 'Not assigned'
                    }
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Order Date</Label>
                <p className="font-medium">{selectedPO.date}</p>
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