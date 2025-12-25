import React, { useState, useEffect, useCallback } from 'react';
import { Users, TrendingUp, DollarSign, Activity, Plus, Download, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { departmentsService, Department } from '@/services/departments';
import { formatCurrencyMUR } from '@/lib/utils';
import { toast } from 'sonner';

interface NewDepartmentForm {
  name: string;
  code: string;
  budget: number;
  manager: string;
  description: string;
  status: string;
  employees: number;
  projects: number;
}

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDepartment, setNewDepartment] = useState<NewDepartmentForm>({
    name: '',
    code: '',
    budget: 0,
    manager: '',
    description: '',
    status: 'active',
    employees: 0,
    projects: 0
  });
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await departmentsService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateDepartment = async () => {
    setErrorMessage('');
    
    if (!newDepartment.name.trim()) {
      setErrorMessage('Please enter a department name.');
      return;
    }
    
    if (!newDepartment.code.trim()) {
      setErrorMessage('Please enter a department code.');
      return;
    }
    
    if (newDepartment.code.length !== 3) {
      setErrorMessage('Department code must be exactly 3 characters.');
      return;
    }

    if (departments.some(dept => dept.code === newDepartment.code.toUpperCase())) {
      setErrorMessage('Department code already exists. Please use a different code.');
      return;
    }

    setIsCreating(true);
    
    try {
      const newDept: Omit<Department, 'created_at' | 'updated_at'> = {
        id: newDepartment.code.toLowerCase(),
        name: newDepartment.name.trim(),
        code: newDepartment.code.toUpperCase().trim(),
        manager: newDepartment.manager.trim() || undefined,
        employees: newDepartment.employees,
        budget: newDepartment.budget || 0,
        spent: 0,
        projects: newDepartment.projects,
        status: newDepartment.status as 'active' | 'inactive' | 'archived',
        description: newDepartment.description.trim() || undefined
      };

      await departmentsService.create(newDept);
      await loadData();
      
      setNewDepartment({
        name: '',
        code: '',
        budget: 0,
        manager: '',
        description: '',
        status: 'active',
        employees: 0,
        projects: 0
      });

      setIsCreateDialogOpen(false);
      toast.success('Department created successfully!');
    } catch (error: unknown) {
      console.error('Error creating department:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      setErrorMessage(`Error creating department: ${errorMessage}`);
      toast.error('Failed to create department');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof NewDepartmentForm, value: string | number) => {
    setNewDepartment(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleExportDepartments = () => {
    try {
      const headers = ['Code', 'Name', 'Manager', 'Employees', 'Budget', 'Spent', 'Utilization %', 'Projects', 'Status'];
      const csvContent = [
        headers.join(','),
        ...departments.map(dept => {
          const utilization = dept.budget > 0 ? ((dept.spent / dept.budget) * 100).toFixed(2) : '0';
          return [
            dept.code,
            `"${dept.name.replace(/"/g, '""')}"`,
            `"${dept.manager?.replace(/"/g, '""') || 'Not assigned'}"`,
            dept.employees,
            formatCurrencyMUR(dept.budget).replace('₨', '').trim(),
            formatCurrencyMUR(dept.spent).replace('₨', '').trim(),
            utilization,
            dept.projects,
            dept.status
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `departments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Departments exported successfully!');
    } catch (error) {
      console.error('Error exporting departments:', error);
      toast.error('Error exporting departments. Please try again.');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        await departmentsService.delete(id);
        await loadData();
        toast.success('Department deleted successfully!');
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department');
      }
    }
  };

  const totalDepartments = departments.length;
  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employees, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const totalSpent = departments.reduce((sum, dept) => sum + dept.spent, 0);
  const totalProjects = departments.reduce((sum, dept) => sum + dept.projects, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage departments, teams, and organizational structure</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
            onClick={() => toast.info('Add Team functionality would open team management')}
          >
            Add Team
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-department-button">
                Create Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Department Name *</Label>
                    <Input
                      id="name"
                      value={newDepartment.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Marketing"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Department Code * (3 characters)</Label>
                    <Input
                      id="code"
                      value={newDepartment.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="e.g., MKT"
                      maxLength={3}
                      disabled={isCreating}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Annual Budget (MUR)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newDepartment.budget}
                      onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="1000"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Department Manager</Label>
                    <Input
                      id="manager"
                      value={newDepartment.manager}
                      onChange={(e) => handleInputChange('manager', e.target.value)}
                      placeholder="e.g., John Doe"
                      disabled={isCreating}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employees">Number of Employees</Label>
                    <Input
                      id="employees"
                      type="number"
                      value={newDepartment.employees}
                      onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projects">Active Projects</Label>
                    <Input
                      id="projects"
                      type="number"
                      value={newDepartment.projects}
                      onChange={(e) => handleInputChange('projects', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      disabled={isCreating}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newDepartment.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newDepartment.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter department description, goals, or notes..."
                    rows={3}
                    disabled={isCreating}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setErrorMessage('');
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateDepartment}
                  disabled={isCreating || !newDepartment.name.trim() || !newDepartment.code.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Department'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalDepartments}</div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Active departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <div className="p-2 bg-green-50 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrencyMUR(totalBudget)}</div>
              <div className="p-2 bg-purple-50 rounded-full">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Annual allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalProjects}</div>
              <div className="p-2 bg-orange-50 rounded-full">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Ongoing initiatives</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
          onClick={handleExportDepartments}
        >
          <Download className="h-4 w-4" />
          Export Departments
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Department Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departments.map((dept) => {
                    const utilization = dept.budget > 0 ? (dept.spent / dept.budget) * 100 : 0;
                    return (
                      <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-500 transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{dept.name}</h3>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{dept.code}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{dept.manager || 'No manager assigned'}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">{dept.employees} employees</span>
                              <span className="text-sm text-gray-500">{dept.projects} projects</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrencyMUR(dept.budget)}</div>
                          <div className="text-sm text-gray-600">Budget</div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Utilization</span>
                              <span className={`font-medium ${utilization > 90 ? 'text-red-600' : 'text-gray-700'}`}>
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={utilization} className="h-2 w-32" />
                          </div>
                          <div className="mt-2 flex justify-end space-x-2">
                            <Button 
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-orange-50 hover:border-orange-500 text-gray-700 hover:text-orange-600 transition-all duration-200"
                              onClick={() => toast.info(`Viewing department: ${dept.name}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-orange-50 hover:border-orange-500 text-gray-700 hover:text-orange-600 transition-all duration-200"
                              onClick={() => toast.info(`Editing department: ${dept.name}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-red-50 hover:border-red-500 text-red-600 hover:text-red-700 transition-all duration-200"
                              onClick={() => handleDeleteDepartment(dept.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-orange-50 hover:border-orange-500 text-gray-700 hover:text-orange-600 transition-all duration-200"
                    onClick={() => toast.info('Opening department analytics dashboard')}
                  >
                    View Department Analytics
                  </Button>
                  <Button 
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-orange-50 hover:border-orange-500 text-gray-700 hover:text-orange-600 transition-all duration-200"
                    onClick={() => toast.info('Opening budget adjustment interface')}
                  >
                    Adjust Budget Allocation
                  </Button>
                  <Button 
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-orange-50 hover:border-orange-500 text-gray-700 hover:text-orange-600 transition-all duration-200"
                    onClick={() => toast.info('Opening team management interface')}
                  >
                    Manage Team Members
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-medium mb-3">Department Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active</span>
                      <span className="font-medium">{departments.filter(d => d.status === 'active').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Under Budget</span>
                      <span className="font-medium text-green-600">
                        {departments.filter(d => d.budget > 0 && (d.spent / d.budget) < 0.9).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Over Budget</span>
                      <span className="font-medium text-red-600">
                        {departments.filter(d => d.budget > 0 && (d.spent / d.budget) > 1).length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Departments;