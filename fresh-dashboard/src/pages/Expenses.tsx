import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Search, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, FileUp, Briefcase, Percent, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { expensesService, Expense } from '@/services/expenses';
import { departmentsService, Department } from '@/services/departments';
import { projectsService, Project } from '@/services/projects';
import { formatCurrencyMUR, calculateVAT, calculateTotalWithVAT, DEFAULT_VAT_RATE } from '@/lib/utils';
import { toast } from 'sonner';

interface NewExpenseForm {
  department_id: string;
  project_id: string;
  description: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  vat_rate: number;
  vat_applied: boolean;
  category: string;
  date: string;
  status: string;
  receipt_url?: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<NewExpenseForm>({
    department_id: '',
    project_id: '',
    description: '',
    amount: 0,
    vat_amount: 0,
    total_amount: 0,
    vat_rate: DEFAULT_VAT_RATE,
    vat_applied: true,
    category: 'equipment',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    receipt_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, departmentsData, projectsData] = await Promise.all([
        expensesService.getAll(),
        departmentsService.getAll(),
        projectsService.getAll()
      ]);
      setExpenses(expensesData);
      setDepartments(departmentsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (amount: number, vatRate: number = DEFAULT_VAT_RATE, vatApplied: boolean = true) => {
    const vat = vatApplied ? calculateVAT(amount, vatRate) : 0;
    const total = vatApplied ? calculateTotalWithVAT(amount, vatRate) : amount;
    setNewExpense(prev => ({
      ...prev,
      amount,
      vat_amount: vat,
      total_amount: total
    }));
  };

  const handleVATRateChange = (vatRate: number, amount: number, vatApplied: boolean = true) => {
    const vat = vatApplied ? calculateVAT(amount, vatRate) : 0;
    const total = vatApplied ? calculateTotalWithVAT(amount, vatRate) : amount;
    setNewExpense(prev => ({
      ...prev,
      vat_rate: vatRate,
      vat_amount: vat,
      total_amount: total
    }));
  };

  const handleVATAppliedChange = (vatApplied: boolean, amount: number, vatRate: number = DEFAULT_VAT_RATE) => {
    const vat = vatApplied ? calculateVAT(amount, vatRate) : 0;
    const total = vatApplied ? calculateTotalWithVAT(amount, vatRate) : amount;
    setNewExpense(prev => ({
      ...prev,
      vat_applied: vatApplied,
      vat_amount: vat,
      total_amount: total
    }));
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === '' || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || expense.department_id === departmentFilter;
    const matchesProject = projectFilter === 'all' || expense.project_id === projectFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesProject && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="border border-gray-300 bg-transparent">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equipment':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Equipment</Badge>;
      case 'software':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Software</Badge>;
      case 'travel':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Travel</Badge>;
      case 'inventory':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Inventory</Badge>;
      default:
        return <Badge className="border border-gray-300 bg-transparent">{category}</Badge>;
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await expensesService.update(id, { status: status as 'pending' | 'approved' | 'rejected' | 'paid' });
      await loadData();
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesService.delete(id);
        await loadData();
        toast.success('Expense deleted successfully');
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleCreateExpense = async () => {
    try {
      if (!newExpense.department_id || !newExpense.description || newExpense.amount <= 0) {
        toast.error('Please fill in all required fields with valid values.');
        return;
      }

      await expensesService.create({
        id: `exp-${Date.now()}`,
        department_id: newExpense.department_id,
        project_id: newExpense.project_id || undefined,
        description: newExpense.description,
        amount: newExpense.amount,
        vat_amount: newExpense.vat_amount,
        total_amount: newExpense.total_amount,
        category: newExpense.category,
        date: newExpense.date,
        status: newExpense.status as 'pending' | 'approved' | 'rejected' | 'paid',
        receipt_url: newExpense.receipt_url
      });

      await loadData();
      
      setNewExpense({
        department_id: '',
        project_id: '',
        description: '',
        amount: 0,
        vat_amount: 0,
        total_amount: 0,
        vat_rate: DEFAULT_VAT_RATE,
        vat_applied: true,
        category: 'equipment',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        receipt_url: ''
      });

      setIsCreateDialogOpen(false);
      toast.success('Expense created successfully!');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Error creating expense. Please try again.');
    }
  };

  const handleInputChange = (field: keyof NewExpenseForm, value: string | number | boolean) => {
    if (field === 'amount') {
      handleAmountChange(value as number, newExpense.vat_rate, newExpense.vat_applied);
    } else if (field === 'vat_rate') {
      handleVATRateChange(value as number, newExpense.amount, newExpense.vat_applied);
    } else if (field === 'vat_applied') {
      handleVATAppliedChange(value as boolean, newExpense.amount, newExpense.vat_rate);
    } else {
      setNewExpense(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleExportExpenses = () => {
    try {
      const headers = ['ID', 'Description', 'Department', 'Project', 'Amount', 'VAT Amount', 'Total', 'Date', 'Category', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredExpenses.map(expense => [
          expense.id,
          `"${expense.description.replace(/"/g, '""')}"`,
          departments.find(d => d.id === expense.department_id)?.name || 'Unknown',
          expense.project_id ? projects.find(p => p.id === expense.project_id)?.name || 'Unknown Project' : 'Not assigned',
          expense.amount,
          expense.vat_amount,
          expense.total_amount,
          expense.date,
          expense.category,
          expense.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Expenses exported successfully!');
    } catch (error) {
      console.error('Error exporting expenses:', error);
      toast.error('Error exporting expenses. Please try again.');
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.total_amount, 0);
  const totalAmountExcludingVAT = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.total_amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, expense) => sum + expense.total_amount, 0);
  const totalVAT = expenses.reduce((sum, expense) => sum + expense.vat_amount, 0);

  const filteredProjects = newExpense.department_id 
    ? projects.filter(project => project.department_id === newExpense.department_id)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600 mt-1">Track, approve, and manage all expenses across departments and projects with VAT calculation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
            onClick={() => toast.info('Filter functionality would open filter panel')}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button 
            className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
            onClick={handleExportExpenses}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department *</Label>
                    <Select 
                      value={newExpense.department_id} 
                      onValueChange={(value) => {
                        handleInputChange('department_id', value);
                        handleInputChange('project_id', '');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.length > 0 ? (
                          departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No departments available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project_id">Project (Optional)</Label>
                    <Select 
                      value={newExpense.project_id} 
                      onValueChange={(value) => handleInputChange('project_id', value)}
                      disabled={!newExpense.department_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={newExpense.department_id ? "Select project" : "Select department first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not assigned to project</SelectItem>
                        {filteredProjects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.code} - {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vat_applied">VAT Applied</Label>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${newExpense.vat_applied ? 'text-green-600' : 'text-red-600'}`}>
                        {newExpense.vat_applied ? 'Yes' : 'No'}
                      </span>
                      <Switch
                        id="vat_applied"
                        checked={newExpense.vat_applied}
                        onCheckedChange={(checked) => handleInputChange('vat_applied', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (MUR) excl. VAT *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat_rate">VAT Rate (%)</Label>
                    <div className="flex items-center">
                      <Input
                        id="vat_rate"
                        type="number"
                        value={newExpense.vat_rate}
                        onChange={(e) => handleInputChange('vat_rate', parseFloat(e.target.value) || DEFAULT_VAT_RATE)}
                        placeholder="15"
                        min="0"
                        max="100"
                        step="0.1"
                        disabled={!newExpense.vat_applied}
                      />
                      <Percent className="h-4 w-4 ml-2 text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_amount">Total Amount</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      value={newExpense.total_amount.toFixed(2)}
                      readOnly
                      className="bg-gray-50 font-medium"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter expense description..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newExpense.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal (excl. VAT):</span>
                    <span>{formatCurrencyMUR(newExpense.amount)}</span>
                  </div>
                  {newExpense.vat_applied && (
                    <>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">VAT ({newExpense.vat_rate}%):</span>
                        <span className="text-purple-600 font-medium">{formatCurrencyMUR(newExpense.vat_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span className="font-bold">Total (incl. VAT):</span>
                        <span className="font-bold text-lg">{formatCurrencyMUR(newExpense.total_amount)}</span>
                      </div>
                    </>
                  )}
                  {!newExpense.vat_applied && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="font-bold">Total (VAT exempt):</span>
                      <span className="font-bold text-lg">{formatCurrencyMUR(newExpense.total_amount)}</span>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExpense}>
                  Create Expense
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrencyMUR(totalExpenses)}</div>
            <p className="text-sm text-gray-500 mt-1">All time (incl. VAT)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total VAT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrencyMUR(totalVAT)}</div>
            <p className="text-sm text-gray-500 mt-1">VAT paid on expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrencyMUR(totalAmountExcludingVAT)}</div>
            <p className="text-sm text-gray-500 mt-1">Excluding VAT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrencyMUR(pendingExpenses)}</div>
            <p className="text-sm text-gray-500 mt-1">{expenses.filter(e => e.status === 'pending').length} expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrencyMUR(paidExpenses)}</div>
            <p className="text-sm text-gray-500 mt-1">{expenses.filter(e => e.status === 'paid').length} expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Expenses</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search expenses..." 
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Expenses</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">No expenses found</div>
                  <p className="text-gray-500">Try adjusting your filters or add a new expense</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>VAT</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>
                            {departments.find(d => d.id === expense.department_id)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrencyMUR(expense.amount)}</TableCell>
                          <TableCell className="text-purple-600">{formatCurrencyMUR(expense.vat_amount)}</TableCell>
                          <TableCell className="font-bold">{formatCurrencyMUR(expense.total_amount)}</TableCell>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                          <TableCell>{getStatusBadge(expense.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {expense.status === 'pending' && (
                                <Button 
                                  className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-green-600"
                                  onClick={() => handleUpdateStatus(expense.id, 'paid')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600"
                                onClick={() => handleDeleteExpense(expense.id)}
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

export default Expenses;