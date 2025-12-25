import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, Trash2, CheckCircle, Mail as MailIcon, Phone, Tag } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { incomeService, Income } from '@/services/income';
import { departmentsService, Department } from '@/services/departments';
import { projectsService, Project } from '@/services/projects';
import { incomeCategoriesService } from '@/services/income-categories';
import { IncomeCategory, IncomeBreakdownWithCategory } from '@/lib/incomeCategoryTypes';
import { CategoryBreakdownForm, BreakdownItem } from '@/components/income/CategoryBreakdownForm';
import { CategoryManager } from '@/components/income/CategoryManager';
import { BreakdownViewer } from '@/components/income/BreakdownViewer';
import { BulkDeleteToolbar } from '@/components/BulkDeleteToolbar';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { formatCurrencyMUR } from '@/lib/utils';
import { toast } from 'sonner';

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
  breakdowns: BreakdownItem[];
}

const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [incomeBreakdowns, setIncomeBreakdowns] = useState<Record<string, IncomeBreakdownWithCategory[]>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('incomes');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
    breakdowns: []
  });

  // Real-time sync setup
  useRealtimeSync<Income>({
    table: 'app_72505145eb_enhanced_income',
    onInsert: (newIncome) => {
      setIncomes(prev => {
        // Check if income already exists
        if (prev.some(i => i.id === newIncome.id)) return prev;
        toast.info('New income record added');
        return [newIncome, ...prev];
      });
    },
    onUpdate: (updatedIncome) => {
      setIncomes(prev => prev.map(i => i.id === updatedIncome.id ? updatedIncome : i));
      toast.info('Income record updated');
    },
    onDelete: ({ id }) => {
      setIncomes(prev => prev.filter(i => i.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.info('Income record deleted');
    },
    enabled: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [incomesData, departmentsData, projectsData, categoriesData] = await Promise.all([
        incomeService.getAll(),
        departmentsService.getAll(),
        projectsService.getAll(),
        incomeCategoriesService.getAllCategories()
      ]);
      setIncomes(incomesData);
      setDepartments(departmentsData);
      setProjects(projectsData);
      setCategories(categoriesData);

      // Load breakdowns for all incomes
      const breakdownsMap: Record<string, IncomeBreakdownWithCategory[]> = {};
      await Promise.all(
        incomesData.map(async (income) => {
          const breakdowns = await incomeCategoriesService.getBreakdownsByIncomeId(income.id);
          if (breakdowns.length > 0) {
            breakdownsMap[income.id] = breakdowns;
          }
        })
      );
      setIncomeBreakdowns(breakdownsMap);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = searchTerm === '' || 
      income.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (income.description && income.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || income.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || income.department_id === departmentFilter;
    const matchesProject = projectFilter === 'all' || income.project_id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesProject;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredIncomes.map(i => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} income record${count > 1 ? 's' : ''}? This will also delete all category breakdowns.`)) {
      return;
    }

    const idsToDelete = Array.from(selectedIds);
    const incomesToRestore = incomes.filter(i => selectedIds.has(i.id));

    // Optimistic update
    setIncomes(prev => prev.filter(i => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    toast.loading(`Deleting ${count} income record${count > 1 ? 's' : ''}...`, { id: 'bulk-delete' });

    try {
      await Promise.all(idsToDelete.map(id => incomeService.delete(id)));
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadData();
      toast.success(`${count} income record${count > 1 ? 's' : ''} deleted successfully!`, { id: 'bulk-delete' });
    } catch (error) {
      console.error('Error bulk deleting incomes:', error);
      setIncomes(prev => [...prev, ...incomesToRestore].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete income records';
      toast.error(errorMessage, { id: 'bulk-delete' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Received</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge className="border border-gray-300 bg-transparent">{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await incomeService.update(id, { status: status as 'pending' | 'received' | 'overdue' | 'cancelled' });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating income status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSendReminder = async (incomeId: string, clientName: string, clientEmail: string) => {
    console.log(`Sending reminder for income ${incomeId} to client ${clientName} at ${clientEmail}`);
    toast.success(`Reminder email sent to ${clientName}`);
  };

  const handleDeleteIncome = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this income record? This will also delete all category breakdowns.')) {
      return;
    }

    const incomeToDelete = incomes.find(i => i.id === id);
    if (!incomeToDelete) return;

    setIncomes(prevIncomes => prevIncomes.filter(i => i.id !== id));
    toast.loading('Deleting income record...', { id: 'delete-income' });

    try {
      await incomeService.delete(id);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Income record deleted successfully!', { id: 'delete-income' });
    } catch (error) {
      console.error('Error deleting income:', error);
      setIncomes(prevIncomes => [...prevIncomes, incomeToDelete].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete income';
      toast.error(errorMessage, { id: 'delete-income' });
    }
  };

  const handleCreateIncome = async () => {
    if (!newIncome.client_name || !newIncome.amount || newIncome.amount <= 0) {
      toast.error('Please fill in client name and amount with valid values.');
      return;
    }

    if (newIncome.breakdowns.length > 0) {
      const totalBreakdown = newIncome.breakdowns.reduce((sum, b) => sum + b.amount, 0);
      if (totalBreakdown > newIncome.amount) {
        toast.error('Total breakdown amount exceeds the income amount');
        return;
      }
      
      const hasInvalidBreakdown = newIncome.breakdowns.some(b => !b.category_id || b.amount <= 0);
      if (hasInvalidBreakdown) {
        toast.error('Please complete all breakdown entries or remove empty ones');
        return;
      }
    }

    try {
      const createdIncome = await incomeService.create({
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
        status: newIncome.status as 'pending' | 'received' | 'overdue' | 'cancelled',
        description: newIncome.description
      });

      if (newIncome.breakdowns.length > 0) {
        await incomeCategoriesService.createMultipleBreakdowns(
          createdIncome.id,
          newIncome.breakdowns.map(b => ({
            category_id: b.category_id,
            amount: b.amount,
            notes: b.notes
          }))
        );
      }
      
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
        breakdowns: []
      });

      setIsCreateDialogOpen(false);
      toast.success('Income record created successfully!');
    } catch (error) {
      console.error('Error creating income:', error);
      toast.error('Failed to create income');
    }
  };

  const handleInputChange = (field: keyof NewIncomeForm, value: string | number | BreakdownItem[]) => {
    setNewIncome(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportIncomes = () => {
    const headers = ['Invoice #', 'Client', 'Email', 'Phone', 'Department', 'Project', 'Amount', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredIncomes.map(income => [
        income.invoice_number,
        `"${income.client_name}"`,
        income.client_email || '',
        income.client_phone || '',
        income.department_id ? departments.find(d => d.id === income.department_id)?.name || 'Unknown' : 'Not assigned',
        income.project_id ? projects.find(p => p.id === income.project_id)?.name || 'Unknown' : 'Not assigned',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading income records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all income sources with category breakdowns</p>
        </div>
        <div className="flex items-center space-x-3">
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
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Income Record</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
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
                      <Label htmlFor="client_address">Client Address</Label>
                      <Input
                        id="client_address"
                        value={newIncome.client_address}
                        onChange={(e) => handleInputChange('client_address', e.target.value)}
                        placeholder="Enter client address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department_id">Department (Optional)</Label>
                      <Select 
                        value={newIncome.department_id} 
                        onValueChange={(value) => handleInputChange('department_id', value === 'none' ? '' : value)}
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
                        value={newIncome.project_id} 
                        onValueChange={(value) => handleInputChange('project_id', value === 'none' ? '' : value)}
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

                <div className="border-t pt-6">
                  <CategoryBreakdownForm
                    totalAmount={newIncome.amount}
                    categories={categories}
                    breakdowns={newIncome.breakdowns}
                    onChange={(breakdowns) => handleInputChange('breakdowns', breakdowns)}
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="incomes">Income Records</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="incomes" className="mt-6">
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
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(proj => (
                        <SelectItem key={proj.id} value={proj.id}>{proj.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              {filteredIncomes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No income records found</div>
                  <p className="text-gray-500">Try adjusting your filters or add a new income record</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIncomes.length > 0 && (
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Checkbox
                        checked={selectedIds.size === filteredIncomes.length && filteredIncomes.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-gray-600">
                        {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                      </span>
                    </div>
                  )}
                  {filteredIncomes.map((income) => (
                    <Card key={income.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={selectedIds.has(income.id)}
                              onCheckedChange={(checked) => handleSelectOne(income.id, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{income.invoice_number}</h3>
                                {getStatusBadge(income.status)}
                                {incomeBreakdowns[income.id] && (
                                  <Badge variant="outline" className="gap-1">
                                    <Tag className="h-3 w-3" />
                                    {incomeBreakdowns[income.id].length} categories
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Client</p>
                                  <p className="font-medium">{income.client_name}</p>
                                  {income.client_email && (
                                    <p className="text-xs text-gray-500">{income.client_email}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-gray-500">Amount</p>
                                  <p className="font-bold text-lg">{formatCurrencyMUR(income.amount)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Date</p>
                                  <p className="font-medium">{new Date(income.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Due Date</p>
                                  <p className="font-medium">{income.due_date ? new Date(income.due_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                              {(income.department_id || income.project_id) && (
                                <div className="flex gap-4 mt-3 text-sm">
                                  {income.department_id && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <span className="font-medium">Dept:</span>
                                      <span>{departments.find(d => d.id === income.department_id)?.name || 'Unknown'}</span>
                                    </div>
                                  )}
                                  {income.project_id && (
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <span className="font-medium">Project:</span>
                                      <span>{projects.find(p => p.id === income.project_id)?.name || 'Unknown'}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {income.client_email && (
                              <Button 
                                size="icon"
                                variant="outline"
                                onClick={() => handleSendReminder(income.id, income.client_name, income.client_email || '')}
                              >
                                <MailIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {income.status === 'pending' && (
                              <Button 
                                size="icon"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleUpdateStatus(income.id, 'received')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="icon"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteIncome(income.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {incomeBreakdowns[income.id] && (
                          <div className="mt-4 pt-4 border-t">
                            <BreakdownViewer
                              breakdowns={incomeBreakdowns[income.id]}
                              departments={departments}
                              totalAmount={income.amount}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      <BulkDeleteToolbar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onCancel={() => setSelectedIds(new Set())}
      />
    </div>
  );
};

export default IncomePage;