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
import { financialDashboardAPI } from '@/lib/supabase';
import { formatCurrencyMUR } from '@/lib/utils';
import { storage } from '@/lib/localStorage';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  budget: number;
  spent: number;
  manager?: string;
  description?: string;
  status: string;
  employees: number;
  projects: number;
  code: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
}

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

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'musique',
    name: 'ë • musique',
    code: 'MUS',
    manager: 'Alexandre Dubois',
    employees: 24,
    budget: 50000,
    spent: 42000,
    projects: 8,
    status: 'active',
    icon: '/assets/department-music-icon_variant_1_variant_3.png'
  },
  {
    id: 'boucan',
    name: 'bōucan',
    code: 'BOU',
    manager: 'Thomas Leroy',
    employees: 32,
    budget: 120000,
    spent: 105000,
    projects: 6,
    status: 'active',
    icon: '/assets/department-studio-icon_variant_1_variant_3.png'
  },
  {
    id: 'talent',
    name: 'talënt',
    code: 'TAL',
    manager: 'Isabelle Chen',
    employees: 15,
    budget: 45000,
    spent: 32000,
    projects: 10,
    status: 'active',
    icon: '/assets/department-talent-icon_variant_1_variant_3.png'
  },
  {
    id: 'moris',
    name: 'mōris',
    code: 'MOR',
    manager: 'David Wilson',
    employees: 8,
    budget: 30000,
    spent: 28000,
    projects: 5,
    status: 'active',
    icon: '/assets/department-store-icon_variant_1_variant_3.png'
  }
];

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const getDepartmentIcon = useCallback((name: string) => {
    const icons: Record<string, string> = {
      'ë • musique': '/assets/department-music-icon_variant_1_variant_4.png',
      'musiquë': '/assets/department-music-icon_variant_1_variant_4_variant_1.png',
      'bōucan': '/assets/department-studio-icon_variant_1_variant_4.png',
      'talënt': '/assets/department-talent-icon_variant_1_variant_4.png',
      'mōris': '/assets/department-store-icon_variant_1_variant_4.png'
    };
    
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(icons)) {
      if (lowerName.includes(key.toLowerCase().replace(/ë|•/g, '').replace(/ō/g, 'o'))) {
        return value;
      }
    }
    
    // Default icon based on department type
    if (lowerName.includes('music') || lowerName.includes('audio')) return '/assets/department-music-icon_variant_1_variant_5.png';
    if (lowerName.includes('visual') || lowerName.includes('design')) return '/assets/department-visual-icon_variant_1_variant_5.png';
    if (lowerName.includes('studio') || lowerName.includes('production')) return '/assets/department-studio-icon_variant_1_variant_5.png';
    if (lowerName.includes('talent') || lowerName.includes('hr')) return '/assets/department-talent-icon_variant_1_variant_5.png';
    if (lowerName.includes('store') || lowerName.includes('retail')) return '/assets/department-store-icon_variant_1_variant_5.png';
    
    return '/images/photo1765933878.jpg';
  }, []);

  const loadData = useCallback(async () => {
    try {
      // Try to load from localStorage first
      const storedDepartments = storage.getDepartments();
      if (storedDepartments && storedDepartments.length > 0) {
        setDepartments(storedDepartments);
        return;
      }

      // Try to load from API
      const departmentsData = await financialDashboardAPI.getDepartments();
      if (departmentsData && departmentsData.length > 0) {
        const transformedData = departmentsData.map((dept: Department) => ({
          id: dept.id,
          name: dept.name,
          code: dept.code || dept.name.substring(0, 3).toUpperCase(),
          manager: dept.manager || 'Not assigned',
          employees: dept.employees || 0,
          budget: dept.budget || 0,
          spent: dept.spent || 0,
          projects: dept.projects || 0,
          status: 'active',
          icon: getDepartmentIcon(dept.name),
          description: dept.description || ''
        }));
        setDepartments(transformedData);
        storage.saveDepartments(transformedData);
        return;
      }

      // Use default data if nothing else is available
      setDepartments(DEFAULT_DEPARTMENTS);
      storage.saveDepartments(DEFAULT_DEPARTMENTS);
    } catch (error) {
      console.error('Error loading departments:', error);
      // Use default data on error
      setDepartments(DEFAULT_DEPARTMENTS);
      storage.saveDepartments(DEFAULT_DEPARTMENTS);
    }
  }, [getDepartmentIcon]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save to localStorage whenever departments change
  useEffect(() => {
    if (departments.length > 0) {
      storage.saveDepartments(departments);
    }
  }, [departments]);

  const handleCreateDepartment = async () => {
    setErrorMessage('');
    
    // Validate required fields
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

    // Check if code already exists
    if (departments.some(dept => dept.code === newDepartment.code.toUpperCase())) {
      setErrorMessage('Department code already exists. Please use a different code.');
      return;
    }

    setIsCreating(true);
    
    try {
      // Create department using API - only send required fields
      const departmentData = {
        name: newDepartment.name.trim(),
        budget: newDepartment.budget || 0,
        manager: newDepartment.manager.trim() || undefined
      };

      const createdDepartment = await financialDashboardAPI.addDepartment(departmentData);

      // Create new department object for local state
      const newDept: Department = {
        id: createdDepartment?.id || Date.now().toString(),
        name: newDepartment.name.trim(),
        code: newDepartment.code.toUpperCase().trim(),
        manager: newDepartment.manager.trim(),
        employees: newDepartment.employees,
        budget: newDepartment.budget || 0,
        spent: 0,
        projects: newDepartment.projects,
        status: newDepartment.status,
        icon: getDepartmentIcon(newDepartment.name),
        description: newDepartment.description.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state (will trigger useEffect to save to localStorage)
      setDepartments([...departments, newDept]);
      
      // Reset form
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

      // Close dialog
      setIsCreateDialogOpen(false);
      
      toast.success('Department created successfully!');
    } catch (error: unknown) {
      console.error('Error creating department:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      setErrorMessage(`Error creating department: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof NewDepartmentForm, value: string | number) => {
    setNewDepartment(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error message when user starts typing
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

  const handleDeleteDepartment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      const updatedDepartments = departments.filter(dept => dept.id !== id);
      setDepartments(updatedDepartments);
      toast.success('Department deleted successfully!');
    }
  };

  const totalDepartments = departments.length;
  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employees, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const totalSpent = departments.reduce((sum, dept) => sum + dept.spent, 0);
  const totalProjects = departments.reduce((sum, dept) => sum + dept.projects, 0);

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
                    <Label htmlFor="budget">Annual Budget (MUR) - Optional</Label>
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
                    <p className="text-xs text-gray-500">Leave as 0 if no budget allocated</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Department Manager - Optional</Label>
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
                    <Label htmlFor="employees">Number of Employees - Optional</Label>
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
                    <Label htmlFor="projects">Active Projects - Optional</Label>
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
                      <div key={dept.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <img 
                              src={dept.icon} 
                              alt={dept.name} 
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{dept.name}</h3>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{dept.code}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{dept.manager}</p>
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
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                              onClick={() => toast.info(`Viewing department: ${dept.name}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                              onClick={() => toast.info(`Editing department: ${dept.name}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600 hover:text-red-700"
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
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                    onClick={() => toast.info('Opening department analytics dashboard')}
                  >
                    View Department Analytics
                  </Button>
                  <Button 
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                    onClick={() => toast.info('Opening budget adjustment interface')}
                  >
                    Adjust Budget Allocation
                  </Button>
                  <Button 
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                    onClick={() => toast.info('Opening team management interface')}
                  >
                    Manage Team Members
                  </Button>
                  <Button 
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                    onClick={() => toast.info('Generating department report')}
                  >
                    Generate Department Report
                  </Button>
                  <Button 
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                    onClick={() => toast.info('Setting performance goals')}
                  >
                    Set Performance Goals
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Performance</span>
                      <span className="font-medium">
                        {departments.filter(d => d.projects > 5 && d.employees > 10).length}
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