import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Search, Eye, Edit, Trash2, Mail, CheckCircle, XCircle, Clock, FileText, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { financialDashboardAPI } from '@/lib/supabase';
import { formatCurrencyMUR } from '@/lib/utils';

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  department_id?: string;
  amount: number;
  date: string;
  due_date: string;
  status: string;
  tax_amount: number;
  total_amount: number;
  created_at?: string;
  updated_at?: string;
  departments?: {
    name: string;
    budget: number;
    spent: number;
  };
}

interface Department {
  id: string;
  name: string;
  budget: number;
  spent: number;
  manager?: string;
  created_at?: string;
  updated_at?: string;
}

interface NewInvoiceForm {
  invoice_number: string;
  client_name: string;
  department_id: string;
  amount: number;
  date: string;
  due_date: string;
  status: string;
  tax_amount: number;
  total_amount: number;
  description?: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<NewInvoiceForm>({
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    client_name: '',
    department_id: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    tax_amount: 0,
    total_amount: 0,
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, departmentsData] = await Promise.all([
        financialDashboardAPI.getInvoices(),
        financialDashboardAPI.getDepartments()
      ]);
      setInvoices(invoicesData as Invoice[]);
      setDepartments(departmentsData as Department[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesClient = clientFilter === 'all' || invoice.client_name === clientFilter;
    const matchesDepartment = departmentFilter === 'all' || invoice.department_id === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesClient && matchesDepartment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>;
      default:
        return <Badge className="border border-gray-300 bg-transparent">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await financialDashboardAPI.updateInvoiceStatus(id, status);
      await loadData();
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleSendReminder = async (invoiceId: string, clientName: string) => {
    try {
      // In a real implementation, this would call an API to send email
      console.log(`Sending reminder for invoice ${invoiceId} to client ${clientName}`);
      alert(`Reminder email would be sent to ${clientName} for invoice ${invoiceId}`);
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error sending reminder. Please try again.');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        // In a real implementation, this would call an API to delete
        // For now, we'll just update locally
        const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
        setInvoices(updatedInvoices);
        console.log(`Invoice ${id} deleted locally`);
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice. Please try again.');
      }
    }
  };

  const handleCreateInvoice = async () => {
    try {
      // Calculate total amount including tax
      const total = newInvoice.amount + newInvoice.tax_amount;
      
      // In a real implementation, this would call an API to create invoice
      // For now, we'll create a local invoice
      const newInvoiceData: Invoice = {
        id: `inv-${Date.now()}`,
        invoice_number: newInvoice.invoice_number,
        client_name: newInvoice.client_name,
        department_id: newInvoice.department_id || undefined,
        amount: newInvoice.amount,
        date: newInvoice.date,
        due_date: newInvoice.due_date,
        status: newInvoice.status,
        tax_amount: newInvoice.tax_amount,
        total_amount: total,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state
      setInvoices([...invoices, newInvoiceData]);
      
      // Reset form
      setNewInvoice({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        client_name: '',
        department_id: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        tax_amount: 0,
        total_amount: 0,
        description: ''
      });

      // Close dialog
      setIsCreateDialogOpen(false);
      
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice. Please try again.');
    }
  };

  const handleInputChange = (field: keyof NewInvoiceForm, value: string | number) => {
    setNewInvoice(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total amount when amount or tax changes
      if (field === 'amount' || field === 'tax_amount') {
        const amount = field === 'amount' ? Number(value) : prev.amount;
        const tax = field === 'tax_amount' ? Number(value) : prev.tax_amount;
        updated.total_amount = amount + tax;
      }
      
      return updated;
    });
  };

  const handleExportInvoices = () => {
    try {
      // Create CSV content
      const headers = ['Invoice #', 'Client', 'Department', 'Amount', 'Tax', 'Total', 'Date', 'Due Date', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredInvoices.map(invoice => [
          invoice.invoice_number,
          `"${invoice.client_name.replace(/"/g, '""')}"`,
          invoice.department_id ? departments.find(d => d.id === invoice.department_id)?.name || 'Unknown' : 'Not assigned',
          invoice.amount,
          invoice.tax_amount,
          invoice.total_amount,
          invoice.date,
          invoice.due_date,
          invoice.status
        ].join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Invoices exported successfully!');
    } catch (error) {
      console.error('Error exporting invoices:', error);
      alert('Error exporting invoices. Please try again.');
    }
  };

  const handleFilterInvoices = () => {
    // Open advanced filter panel
    const filterOptions = {
      dateRange: 'last30days',
      amountMin: 0,
      amountMax: 1000000,
      department: departmentFilter === 'all' ? 'all' : departments.find(d => d.id === departmentFilter)?.name || 'all'
    };
    
    const filterMessage = `Opening advanced filter panel with options:
    - Date Range: ${filterOptions.dateRange}
    - Amount Range: ${formatCurrencyMUR(filterOptions.amountMin)} - ${formatCurrencyMUR(filterOptions.amountMax)}
    - Department: ${filterOptions.department}`;
    
    alert(filterMessage);
    
    // In a real implementation, this would open a filter dialog
    // For now, we'll apply some sample filters
    setStatusFilter('pending');
    setDepartmentFilter('all');
    alert('Applied filter: Show only pending invoices');
  };

  const handleGenerateMonthlyReport = () => {
    try {
      // Calculate monthly totals
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
      });
      
      const totalAmount = monthlyInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const totalTax = monthlyInvoices.reduce((sum, invoice) => sum + invoice.tax_amount, 0);
      const paidInvoices = monthlyInvoices.filter(inv => inv.status === 'paid').length;
      const pendingInvoices = monthlyInvoices.filter(inv => inv.status === 'pending').length;
      
      // Group by department for report
      const departmentTotals: Record<string, { count: number; amount: number }> = {};
      monthlyInvoices.forEach(invoice => {
        const deptName = invoice.department_id ? departments.find(d => d.id === invoice.department_id)?.name || 'Unassigned' : 'Unassigned';
        if (!departmentTotals[deptName]) {
          departmentTotals[deptName] = { count: 0, amount: 0 };
        }
        departmentTotals[deptName].count++;
        departmentTotals[deptName].amount += invoice.amount;
      });
      
      // Create report content
      const reportContent = `
Monthly Invoice Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

Total Invoices: ${monthlyInvoices.length}
Total Amount: ${formatCurrencyMUR(totalAmount)}
Total Tax: ${formatCurrencyMUR(totalTax)}
Paid Invoices: ${paidInvoices}
Pending Invoices: ${pendingInvoices}

Department Breakdown:
${Object.entries(departmentTotals).map(([dept, data]) => `- ${dept}: ${data.count} invoices, ${formatCurrencyMUR(data.amount)}`).join('\n')}

Invoice Details:
${monthlyInvoices.map(inv => `- ${inv.invoice_number}: ${inv.client_name} - ${formatCurrencyMUR(inv.amount)} (${inv.status})${inv.department_id ? ` [${departments.find(d => d.id === inv.department_id)?.name || 'Unknown'}]` : ''}`).join('\n')}
      `.trim();

      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `monthly_invoice_report_${currentYear}_${currentMonth + 1}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Monthly report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  const handleSendBulkReminders = () => {
    try {
      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'overdue' || 
        (inv.status === 'pending' && new Date(inv.due_date) < new Date())
      );
      
      if (overdueInvoices.length === 0) {
        alert('No overdue invoices found to send reminders.');
        return;
      }
      
      const clientNames = [...new Set(overdueInvoices.map(inv => inv.client_name))];
      alert(`Would send reminders to ${clientNames.length} clients for ${overdueInvoices.length} overdue invoices.`);
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      alert('Error sending bulk reminders. Please try again.');
    }
  };

  const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'pending').reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);

  const uniqueClients = Array.from(new Set(invoices.map(inv => inv.client_name)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Create, track, and manage client invoices with department classification</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
            onClick={handleFilterInvoices}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button 
            className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
            onClick={handleExportInvoices}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_number">Invoice Number</Label>
                    <Input
                      id="invoice_number"
                      value={newInvoice.invoice_number}
                      onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                      placeholder="INV-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name</Label>
                    <Input
                      id="client_name"
                      value={newInvoice.client_name}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department (Optional)</Label>
                    <Select 
                      value={newInvoice.department_id} 
                      onValueChange={(value) => handleInputChange('department_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Not assigned to department</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (MUR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newInvoice.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_amount">Tax Amount (MUR)</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      value={newInvoice.tax_amount}
                      onChange={(e) => handleInputChange('tax_amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newInvoice.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Invoice Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newInvoice.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newInvoice.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newInvoice.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter invoice description or notes..."
                    rows={3}
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span>{formatCurrencyMUR(newInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Tax:</span>
                    <span>{formatCurrencyMUR(newInvoice.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-lg">{formatCurrencyMUR(newInvoice.total_amount)}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice}>
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyMUR(totalInvoices)}</div>
            <p className="text-sm text-gray-500 mt-1">{invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrencyMUR(pendingInvoices)}</div>
            <p className="text-sm text-gray-500 mt-1">{invoices.filter(i => i.status === 'pending').length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrencyMUR(overdueInvoices)}</div>
            <p className="text-sm text-gray-500 mt-1">{invoices.filter(i => i.status === 'overdue').length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrencyMUR(paidInvoices)}</div>
            <p className="text-sm text-gray-500 mt-1">{invoices.filter(i => i.status === 'paid').length} invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Invoices</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search invoices..." 
                    className="w-full md:w-64 pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {uniqueClients.map(client => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Invoices</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading invoices...</p>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No invoices found</div>
                  <p className="text-gray-500">Try adjusting your filters or create a new invoice</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => {
                        const isOverdue = invoice.status === 'overdue' || 
                          (invoice.status === 'pending' && new Date(invoice.due_date) < new Date());
                        
                        return (
                          <TableRow key={invoice.id} className={isOverdue ? 'bg-red-50' : ''}>
                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{invoice.client_name}</TableCell>
                            <TableCell>
                              {invoice.department_id ? (
                                <div className="flex items-center space-x-1">
                                  <Building className="h-3 w-3 text-gray-500" />
                                  <span>{departments.find(d => d.id === invoice.department_id)?.name || 'Unknown Department'}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrencyMUR(invoice.amount)}</TableCell>
                            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                            <TableCell className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {new Date(invoice.due_date).toLocaleDateString()}
                              {isOverdue && <Clock className="h-3 w-3 inline ml-1" />}
                            </TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100"
                                  onClick={() => alert(`Viewing invoice: ${invoice.invoice_number}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100"
                                  onClick={() => handleSendReminder(invoice.id, invoice.client_name)}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                {invoice.status === 'pending' && (
                                  <Button 
                                    className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-green-600 hover:text-green-700"
                                    onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['draft', 'sent', 'pending', 'paid', 'overdue'].map(status => {
                const count = invoices.filter(i => i.status === status).length;
                const percentage = invoices.length > 0 ? (count / invoices.length * 100).toFixed(1) : '0';
                const amount = invoices.filter(i => i.status === status).reduce((sum, i) => sum + i.amount, 0);
                
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status}</span>
                      <span className="font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'paid' ? 'bg-green-500' :
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'overdue' ? 'bg-red-500' :
                          status === 'sent' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Total: {formatCurrencyMUR(amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start gap-2"
                onClick={handleGenerateMonthlyReport}
              >
                <FileText className="h-4 w-4" />
                Generate Monthly Report
              </Button>
              <Button 
                className="w-full justify-start gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
                onClick={handleSendBulkReminders}
              >
                <Mail className="h-4 w-4" />
                Send Bulk Reminders
              </Button>
              <Button 
                className="w-full justify-start gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
                onClick={handleExportInvoices}
              >
                <Download className="h-4 w-4" />
                Export All Invoices
              </Button>
              <Button 
                className="w-full justify-start gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
                onClick={() => {
                  setStatusFilter('overdue');
                  alert('Filtered to show overdue invoices');
                }}
              >
                <Filter className="h-4 w-4" />
                View Overdue Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;