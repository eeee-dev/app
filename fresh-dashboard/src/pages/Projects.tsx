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
import { projectsService, Project } from '@/services/projects';
import { departmentsService, Department } from '@/services/departments';
import { formatCurrencyMUR } from '@/lib/utils';
import { toast } from 'sonner';

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

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const [projectsData, departmentsData] = await Promise.all([
        projectsService.getAll(),
        departmentsService.getAll()
      ]);
      setProjects(projectsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProject = async () => {
    try {
      if (!newProject.name || !newProject.code || !newProject.department_id) {
        toast.error('Please fill in Project Name, Project Code, and select a Department.');
        return;
      }

      await projectsService.create({
        id: `proj-${Date.now()}`,
        name: newProject.name,
        code: newProject.code,
        department_id: newProject.department_id,
        budget: newProject.budget || 0,
        spent: 0,
        description: newProject.description || undefined,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        status: newProject.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
        manager: newProject.manager || undefined,
        team_size: newProject.team_size
      });

      await loadData();
      
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
          const dept = departments.find(d => d.id === proj.department_id);
          return [
            proj.code,
            `"${proj.name.replace(/"/g, '""')}"`,
            `"${dept?.name || 'Unknown'}"`,
            `"${proj.manager?.replace(/"/g, '""') || 'Not assigned'}"`,
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

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectsService.delete(id);
        await loadData();
        toast.success('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage projects, track progress, and allocate resources</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
          className="gap-2 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
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
              const dept = departments.find(d => d.id === project.department_id);
              
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
                            <p className="text-sm text-gray-600">{dept?.name || 'Unknown'} • {project.manager || 'No manager'}</p>
                          </div>
                        </div>
                        
                        {project.description && (
                          <p className="text-sm text-gray-700">{project.description}</p>
                        )}
                        
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
                            className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                            onClick={() => toast.info(`Viewing project: ${project.name}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                            onClick={() => toast.info(`Editing project: ${project.name}`)}
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
      </Tabs>
    </div>
  );
};

export default Projects;