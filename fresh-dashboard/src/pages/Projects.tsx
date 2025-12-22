import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Calendar, DollarSign, Users, Plus, Download, Edit, Trash2, Eye, TrendingUp, Clock } from 'lucide-react';
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

interface NewProjectForm {
  name: string;
  code: string;
  department_id: string;
  description: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: string;
  manager: string;
  team_size: number;
}

interface Department {
  id: string;
  name: string;
  budget?: number;
  spent?: number;
  manager?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Album Production',
    code: 'ALB-2025',
    department_id: 'musique',
    department_name: 'musiquë',
    description: 'Production of new music album for international release',
    budget: 150000,
    spent: 95000,
    start_date: '2025-01-15',
    end_date: '2025-06-30',
    status: 'active',
    manager: 'Alexandre Dubois',
    team_size: 8
  },
  {
    id: 'proj-002',
    name: 'Visual Identity Redesign',
    code: 'VIR-2025',
    department_id: 'zimaze',
    department_name: 'zimazë',
    description: 'Complete visual identity redesign for corporate branding',
    budget: 80000,
    spent: 45000,
    start_date: '2025-02-01',
    end_date: '2025-05-31',
    status: 'active',
    manager: 'Sophie Martin',
    team_size: 6
  },
  {
    id: 'proj-003',
    name: 'Studio Equipment Upgrade',
    code: 'SEQ-2025',
    department_id: 'boucan',
    department_name: 'bōucan',
    description: 'Upgrade studio recording equipment and acoustic treatment',
    budget: 120000,
    spent: 85000,
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    status: 'completed',
    manager: 'Thomas Leroy',
    team_size: 4
  },
  {
    id: 'proj-004',
    name: 'Talent Recruitment Drive',
    code: 'TRD-2025',
    department_id: 'talent',
    department_name: 'talënt',
    description: 'Recruitment campaign for new artists and performers',
    budget: 60000,
    spent: 35000,
    start_date: '2025-03-01',
    end_date: '2025-08-31',
    status: 'active',
    manager: 'Isabelle Chen',
    team_size: 5
  },
  {
    id: 'proj-005',
    name: 'Retail Store Expansion',
    code: 'RSE-2025',
    department_id: 'moris',
    department_name: 'mōris',
    description: 'Expansion of retail store network in new regions',
    budget: 200000,
    spent: 125000,
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'active',
    manager: 'David Wilson',
    team_size: 12
  },
  {
    id: 'proj-006',
    name: 'Music Video Production',
    code: 'MVP-2025',
    department_id: 'musique',
    department_name: 'musiquë',
    description: 'Production of high-quality music videos for top artists',
    budget: 100000,
    spent: 65000,
    start_date: '2025-02-15',
    end_date: '2025-07-31',
    status: 'on-hold',
    manager: 'Alexandre Dubois',
    team_size: 7
  }
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([
    { id: 'musique', name: 'musiquë' },
    { id: 'zimaze', name: 'zimazë' },
    { id: 'boucan', name: 'bōucan' },
    { id: 'talent', name: 'talënt' },
    { id: 'moris', name: 'mōris' }
  ]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<NewProjectForm>({
    name: '',
    code: '',
    department_id: '',
    description: '',
    budget: 0,
    start_date: '',
    end_date: '',
    status: 'active',
    manager: '',
    team_size: 0
  });

  const loadData = useCallback(async () => {
    try {
      // Try to load departments from localStorage or API
      const storedDepartments = storage.getDepartments();
      if (storedDepartments && storedDepartments.length > 0) {
        setDepartments(storedDepartments.map((dept: Department) => ({
          id: dept.id,
          name: dept.name
        })));
      } else {
        const departmentsData = await financialDashboardAPI.getDepartments();
        if (departmentsData && departmentsData.length > 0) {
          setDepartments(departmentsData.map((dept: Department) => ({
            id: dept.id,
            name: dept.name
          })));
        }
      }
      
      // Try to load projects from localStorage first
      const storedProjects = storage.getProjects();
      if (storedProjects && storedProjects.length > 0) {
        setProjects(storedProjects);
        return;
      }

      // Try to load from API
      const projectsData = await financialDashboardAPI.getProjects();
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
        storage.saveProjects(projectsData);
        return;
      }

      // Use default data if nothing else is available
      setProjects(DEFAULT_PROJECTS);
      storage.saveProjects(DEFAULT_PROJECTS);
    } catch (error) {
      console.error('Error loading data:', error);
      // Use default data on error
      setProjects(DEFAULT_PROJECTS);
      storage.saveProjects(DEFAULT_PROJECTS);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      storage.saveProjects(projects);
    }
  }, [projects]);

  const handleCreateProject = async () => {
    try {
      // Validate required fields
      if (!newProject.name || !newProject.code || !newProject.department_id) {
        toast.error('Please fill in Project Name, Project Code, and select a Department.');
        return;
      }

      // Create project using API
      const createdProject = await financialDashboardAPI.addProject({
        name: newProject.name,
        code: newProject.code,
        department_id: newProject.department_id,
        budget: newProject.budget || 0,
        description: newProject.description,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        status: newProject.status,
        manager: newProject.manager,
        team_size: newProject.team_size
      });

      // Get department name
      const department = departments.find(d => d.id === newProject.department_id);
      
      // Create new project object for local state
      const newProj: Project = {
        id: createdProject?.id || Date.now().toString(),
        name: newProject.name,
        code: newProject.code,
        department_id: newProject.department_id,
        department_name: department?.name || 'Unknown Department',
        description: newProject.description,
        budget: newProject.budget || 0,
        spent: 0,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        status: newProject.status,
        manager: newProject.manager,
        team_size: newProject.team_size,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state (will trigger useEffect to save to localStorage)
      setProjects([...projects, newProj]);
      
      // Reset form
      setNewProject({
        name: '',
        code: '',
        department_id: '',
        description: '',
        budget: 0,
        start_date: '',
        end_date: '',
        status: 'active',
        manager: '',
        team_size: 0
      });

      // Close dialog
      setIsCreateDialogOpen(false);
      
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project. Please try again.');
    }
  };

  const handleInputChange = (field: keyof NewProjectForm, value: string | number) => {
    setNewProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportProjects = () => {
    try {
      const headers = ['Code', 'Name', 'Department', 'Manager', 'Budget', 'Spent', 'Utilization %', 'Status', 'Start Date', 'End Date', 'Team Size'];
      const csvContent = [
        headers.join(','),
        ...projects.map(proj => {
          const utilization = proj.budget > 0 ? ((proj.spent / proj.budget) * 100).toFixed(2) : '0';
          return [
            proj.code,
            `"${proj.name.replace(/"/g, '""')}"`,
            `"${proj.department_name.replace(/"/g, '""')}"`,
            `"${proj.manager.replace(/"/g, '""')}"`,
            formatCurrencyMUR(proj.budget).replace('₨', '').trim(),
            formatCurrencyMUR(proj.spent).replace('₨', '').trim(),
            utilization,
            proj.status,
            proj.start_date,
            proj.end_date,
            proj.team_size
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `projects_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Projects exported successfully!');
    } catch (error) {
      console.error('Error exporting projects:', error);
      toast.error('Error exporting projects. Please try again.');
    }
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const updatedProjects = projects.filter(proj => proj.id !== id);
      setProjects(updatedProjects);
      toast.success('Project deleted successfully!');
    }
  };

  const handleEditProject = (project: Project) => {
    toast.info(`Editing project: ${project.name}\n\nThis would open an edit form with pre-filled data.`);
  };

  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, proj) => sum + proj.budget, 0);
  const totalSpent = projects.reduce((sum, proj) => sum + proj.spent, 0);
  const totalTeamSize = projects.reduce((sum, proj) => sum + proj.team_size, 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage projects, track progress, and allocate resources</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="border border-gray-300 bg-transparent hover:bg-gray-100"
            onClick={() => toast.info('Project analytics dashboard would open')}
          >
            View Analytics
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Website Redesign"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Project Code *</Label>
                    <Input
                      id="code"
                      value={newProject.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="e.g., WEB-2025"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department *</Label>
                    <Select 
                      value={newProject.department_id} 
                      onValueChange={(value) => handleInputChange('department_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Project Manager</Label>
                    <Input
                      id="manager"
                      value={newProject.manager}
                      onChange={(e) => handleInputChange('manager', e.target.value)}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Project Budget (MUR)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_size">Team Size</Label>
                    <Input
                      id="team_size"
                      type="number"
                      value={newProject.team_size}
                      onChange={(e) => handleInputChange('team_size', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newProject.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newProject.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter project description, objectives, and notes..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProject}>
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalProjects}</div>
              <div className="p-2 bg-blue-50 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-600" />
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
            <p className="text-sm text-gray-500 mt-1">Allocated budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{activeProjects}</div>
              <div className="p-2 bg-green-50 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalTeamSize}</div>
              <div className="p-2 bg-orange-50 rounded-full">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">People working on projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100"
          onClick={handleExportProjects}
        >
          <Download className="h-4 w-4" />
          Export Projects
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="space-y-6">
            {projects.map((project) => {
              const utilization = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
              const daysRemaining = getDaysRemaining(project.end_date);
              const isOverdue = daysRemaining < 0;
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg">{project.name}</h3>
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{project.code}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                                {project.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{project.department_name} • {project.manager}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700">{project.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{project.start_date} → {project.end_date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{project.team_size} team members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 min-w-[200px]">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Budget Utilization</span>
                            <span className={`font-medium ${utilization > 90 ? 'text-red-600' : 'text-gray-700'}`}>
                              {utilization.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={utilization} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="font-bold">{formatCurrencyMUR(project.budget)}</div>
                            <div className="text-xs text-gray-600">Budget</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{formatCurrencyMUR(project.spent)}</div>
                            <div className="text-xs text-gray-600">Spent</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100"
                            onClick={() => toast.info(`Viewing project: ${project.name}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <div className="space-y-6">
            {projects.filter(p => p.status === 'active').map((project) => {
              const utilization = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
              const daysRemaining = getDaysRemaining(project.end_date);
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.department_name} • {project.manager}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{project.description}</p>
                      </div>
                      
                      <div className="space-y-3 min-w-[200px]">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{utilization.toFixed(1)}%</span>
                          </div>
                          <Progress value={utilization} className="h-2" />
                        </div>
                        
                        <div className="text-center">
                          <div className="font-bold">{daysRemaining} days remaining</div>
                          <div className="text-xs text-gray-600">Deadline: {project.end_date}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Projects;