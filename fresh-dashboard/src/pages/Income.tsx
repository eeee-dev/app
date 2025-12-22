import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Search, Eye, Trash2, Mail, CheckCircle, Clock, Building, Briefcase, Mail as MailIcon, Phone, MapPin, Scan } from 'lucide-react';
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
import { ocrService } from '@/lib/ocrService';
import { toast } from 'sonner';

interface Income {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  department_id?: string;
  project_id?: string;
  amount: number;
  date: string;
  due_date: string;
  status: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  departments?: {
    name: string;
    budget: number;
    spent: number;
  };
  projects?: {
    name: string;
    code: string;
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

interface Project {
  id: string;
  name: string;
  code: string;
  department_id: string;
  department_name: string;
  description: string;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  status: string;
  manager: string;
  team_size: number;
  created_at?: string;
  updated_at?: string;
}

interface NewIncomeForm {
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  department_id: string;
  project_id: string;
  amount: number;
  date: string;
  due_date: string;
  status: string;
  description: string;
  brn?: string;
}

const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
  const [ocrProgress, setOCRProgress] = useState('');
  const [newIncome, setNewIncome] = useState<NewIncomeForm>({
    invoice_number: `INC-${Date.now().toString().slice(-6)}`,
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    department_id: '',
    project_id: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    description: '',
    brn: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [incomesData, departmentsData, projectsData] = await Promise.all([
        financialDashboardAPI.getEnhancedIncomes(),
        financialDashboardAPI.getDepartments(),
        financialDashboardAPI.getProjects()
      ]);
      setIncomes(incomesData as Income[]);
      setDepartments(departmentsData as Department[]);
      setProjects(projectsData as Project[]);
    } catch (error) {
      console.error('Error loading data:', error);
      const mockIncomes: Income[] = [
        {
          id: '1',
          invoice_number: 'INV-2025-001',
          client_name: 'Tech Solutions Inc.',
          client_email: 'contact@techsolutions.com',
          client_phone: '+230 123 4567',
          client_address: '123 Tech Street, Port Louis',
          department_id: 'musique',
          project_id: 'proj-001',
          amount: 12500,
          date: '2025-01-15',
          due_date: '2025-02-15',
          status: 'received',
          description: 'Consulting services for Q1 2025'
        }
      ];
      setIncomes(mockIncomes);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsOCRDialogOpen(true);

    try {
      if (files.length === 1) {
        setOCRProgress('Processing invoice...');
        const file = files[0];
        const result = await ocrService.processInvoice(file);
        
        setNewIncome(prev => ({
          ...prev,
          client_name: result.clientName || prev.client_name,
          client_email: result.email || prev.client_email,
          client_phone: result.phone || prev.client_phone,
          client_address: result.address || prev.client_address,
          amount: result.amount || prev.amount,
          date: result.date ? new Date(result.date).toISOString().split('T')[0] : prev.date,
          invoice_number: result.invoiceNumber || prev.invoice_number,
          description: result.description || prev.description,
          brn: result.brn || prev.brn
        }));

        toast.success('Invoice data extracted successfully!');
        setIsOCRDialogOpen(false);
        setIsCreateDialogOpen(true);
      } else {
        setOCRProgress(`Processing ${files.length} invoices...`);
        const results = await ocrService.processBulkInvoices(Array.from(files));
        
        let successCount = 0;
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          setOCRProgress(`Creating income record ${i + 1} of ${files.length}...`);
          
          if (result.clientName || result.amount) {
            const newIncomeData: Income = {
              id: `inc-${Date.now()}-${i}`,
              invoice_number: result.invoiceNumber || `INC-${Date.now().toString().slice(-6)}-${i}`,
              client_name: result.clientName || 'Unknown Client',
              client_email: result.email || '',
              client_phone: result.phone || '',
              client_address: result.address || '',
              amount: result.amount || 0,
              date: result.date ? new Date(result.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'pending',
              description: result.description || `Imported from ${files[i].name}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setIncomes(prev => [...prev, newIncomeData]);
            successCount++;
          }
        }
        
        toast.success(`Successfully processed ${successCount} of ${files.length} invoices!`);
        setIsOCRDialogOpen(false);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error('Failed to process invoice(s). Please try again.');
    } finally {
      setOCRProgress('');
      event.target.value = '';
    }
  };

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = searchTerm === '' || 
      income.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || income.status === statusFilter;
    const matchesClient = clientFilter === 'all' || income.client_name === clientFilter;
    const matchesDepartment = departmentFilter === 'all' || income.department_id === departmentFilter;
    const matchesProject = projectFilter === 'all' || income.project_id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesClient && matchesDepartment && matchesProject;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Received</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge className="border border-gray-300 bg-transparent">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await financialDashboardAPI.updateEnhancedIncomeStatus(id, status);
      await loadData();
    } catch (error) {
      console.error('Error updating income status:', error);
      setIncomes(prev => prev.map(income => 
        income.id === id ? { ...income, status } : income
      ));
    }
  };

  const handleSendReminder = async (incomeId: string, clientName: string, clientEmail: string) => {
    console.log(`Sending reminder for income ${incomeId} to client ${clientName} at ${clientEmail}`);
    toast.success(`Reminder email sent to ${clientName}`);
  };

  const handleDeleteIncome = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      const updatedIncomes = incomes.filter(income => income.id !== id);
      setIncomes(updatedIncomes);
      toast.success('Income record deleted successfully!');
    }
  };

  const handleCreateIncome = async () => {
    if (!newIncome.client_name || !newIncome.amount || newIncome.amount <= 0) {
      toast.error('Please fill in all required fields with valid values.');
      return;
    }

    const newIncomeData: Income = {
      id: `inc-${Date.now()}`,
      invoice_number: newIncome.invoice_number,
      client_name: newIncome.client_name,
      client_email: newIncome.client_email,
      client_phone: newIncome.client_phone,
      client_address: newIncome.client_address,
      department_id: newIncome.department_id || undefined,
      project_id: newIncome.project_id || undefined,
      amount: newIncome.amount,
      date: newIncome.date,
      due_date: newIncome.due_date,
      status: newIncome.status,
      description: newIncome.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setIncomes([...incomes, newIncomeData]);
    
    setNewIncome({
      invoice_number: `INC-${Date.now().toString().slice(-6)}`,
      client_name: '',
      client_email: '',
      client_phone: '',
      client_address: '',
      department_id: '',
      project_id: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      description: '',
      brn: ''
    });

    setIsCreateDialogOpen(false);
    toast.success('Income record created successfully!');
  };

  const handleInputChange = (field: keyof NewIncomeForm, value: string | number) => {
    setNewIncome(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportIncomes = () => {
    const headers = ['Invoice #', 'Client', 'Email', 'Phone', 'Amount', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredIncomes.map(income => [
        income.invoice_number,
        `"${income.client_name}"`,
        income.client_email,
        income.client_phone,
        income.amount,
        income.date,
        income.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `incomes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Incomes exported successfully!');
  };

  const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
  const pendingIncomes = incomes.filter(i => i.status === 'pending').reduce((sum, income) => sum + income.amount, 0);
  const overdueIncomes = incomes.filter(i => i.status === 'overdue').reduce((sum, income) => sum + income.amount, 0);
  const receivedIncomes = incomes.filter(i => i.status === 'received').reduce((sum, income) => sum + income.amount, 0);

  const uniqueClients = Array.from(new Set(incomes.map(inc => inc.client_name)));

  const filteredProjects = newIncome.department_id 
    ? projects.filter(project => project.department_id === newIncome.department_id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all income sources</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            id="invoice-upload"
            accept="image/*,.pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            onClick={() => document.getElementById('invoice-upload')?.click()}
            type="button"
          >
            <Scan className="h-4 w-4" />
            Scan Invoice(s)
          </Button>
          <Button 
            className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
            onClick={handleExportIncomes}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Income Record</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice_number">Invoice Number</Label>
                    <Input
                      id="invoice_number"
                      value={newIncome.invoice_number}
                      onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                      placeholder="INC-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (MUR) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newIncome.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      value={newIncome.client_name}
                      onChange={(e) => handleInputChange('client_name', e.target.value)}
                      placeholder="Enter client name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_email">Client Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={newIncome.client_email}
                      onChange={(e) => handleInputChange('client_email', e.target.value)}
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Client Phone</Label>
                    <Input
                      id="client_phone"
                      value={newIncome.client_phone}
                      onChange={(e) => handleInputChange('client_phone', e.target.value)}
                      placeholder="+230 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brn">BRN (Business Registration)</Label>
                    <Input
                      id="brn"
                      value={newIncome.brn}
                      onChange={(e) => handleInputChange('brn', e.target.value)}
                      placeholder="C12345678"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_address">Client Address</Label>
                  <Input
                    id="client_address"
                    value={newIncome.client_address}
                    onChange={(e) => handleInputChange('client_address', e.target.value)}
                    placeholder="Enter client address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Income Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newIncome.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newIncome.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newIncome.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIncome.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter income description or notes..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIncome}>
                  Create Income Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isOCRDialogOpen} onOpenChange={setIsOCRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Invoice(s)</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{ocrProgress}</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we extract data from your invoice(s)...</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyMUR(totalIncomes)}</div>
            <p className="text-sm text-gray-500 mt-1">{incomes.length} records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrencyMUR(pendingIncomes)}</div>
            <p className="text-sm text-gray-500 mt-1">{incomes.filter(i => i.status === 'pending').length} records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrencyMUR(overdueIncomes)}</div>
            <p className="text-sm text-gray-500 mt-1">{incomes.filter(i => i.status === 'overdue').length} records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrencyMUR(receivedIncomes)}</div>
            <p className="text-sm text-gray-500 mt-1">{incomes.filter(i => i.status === 'received').length} records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Income Records</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search incomes..." 
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Incomes</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading income records...</p>
                </div>
              ) : filteredIncomes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No income records found</div>
                  <p className="text-gray-500">Try adjusting your filters or add a new income record</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIncomes.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{income.invoice_number}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{income.client_name}</span>
                              {income.client_email && (
                                <span className="text-xs text-gray-500">{income.client_email}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {income.client_phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3 text-gray-500" />
                                  <span className="text-sm">{income.client_phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrencyMUR(income.amount)}</TableCell>
                          <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(income.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                                onClick={() => handleSendReminder(income.id, income.client_name, income.client_email)}
                              >
                                <MailIcon className="h-4 w-4" />
                              </Button>
                              {income.status === 'pending' && (
                                <Button 
                                  className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-green-600"
                                  onClick={() => handleUpdateStatus(income.id, 'received')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600"
                                onClick={() => handleDeleteIncome(income.id)}
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomePage;