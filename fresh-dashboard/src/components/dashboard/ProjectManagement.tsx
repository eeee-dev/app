import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, Target, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  department: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  teamSize: number;
  progress: number;
  vatIncluded: boolean;
}

const ProjectManagement: React.FC = () => {
  const projects: Project[] = [
    {
      id: 'PROJ-001',
      name: 'Studio Equipment Upgrade',
      department: 'bōucan',
      status: 'active',
      budget: 500000,
      spent: 325000,
      startDate: '2024-11-01',
      endDate: '2025-02-28',
      teamSize: 8,
      progress: 65,
      vatIncluded: true
    },
    {
      id: 'PROJ-002',
      name: 'Music Festival Production',
      department: 'musiquë',
      status: 'active',
      budget: 1200000,
      spent: 850000,
      startDate: '2024-10-15',
      endDate: '2025-01-31',
      teamSize: 15,
      progress: 71,
      vatIncluded: true
    },
    {
      id: 'PROJ-003',
      name: 'Visual Identity Redesign',
      department: 'zimazë',
      status: 'on-hold',
      budget: 300000,
      spent: 120000,
      startDate: '2024-12-01',
      endDate: '2025-03-15',
      teamSize: 5,
      progress: 40,
      vatIncluded: true
    },
    {
      id: 'PROJ-004',
      name: 'Talent Recruitment Drive',
      department: 'talënt',
      status: 'planning',
      budget: 200000,
      spent: 0,
      startDate: '2025-01-15',
      endDate: '2025-04-30',
      teamSize: 3,
      progress: 0,
      vatIncluded: false
    },
    {
      id: 'PROJ-005',
      name: 'Store Expansion Project',
      department: 'mōris',
      status: 'completed',
      budget: 800000,
      spent: 780000,
      startDate: '2024-08-01',
      endDate: '2024-11-30',
      teamSize: 12,
      progress: 100,
      vatIncluded: true
    }
  ];

  const formatCurrency = (value: number) => {
    return `₨ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case 'on-hold':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">On Hold</Badge>;
      case 'planning':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Planning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'on-hold':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'planning':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateVAT = (amount: number) => {
    return amount * 0.15;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Management
            </CardTitle>
            <CardDescription>
              Track and manage projects across all departments
            </CardDescription>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Project Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Active Projects</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Total Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(3000000)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Team Members</p>
                  <p className="text-2xl font-bold">43</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">VAT Liability</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculateVAT(3000000))}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Project</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Budget</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Progress</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">VAT</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline">{project.department}</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        {getStatusBadge(project.status)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium">{formatCurrency(project.budget)}</p>
                        <p className="text-xs text-gray-500">
                          Spent: {formatCurrency(project.spent)}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{project.progress}%</span>
                          <span>{project.teamSize} people</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.progress < 30 ? 'bg-red-500' :
                              project.progress < 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {project.startDate} → {project.endDate}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-center">
                        {project.vatIncluded ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            15% VAT
                          </Badge>
                        ) : (
                          <Badge variant="outline">No VAT</Badge>
                        )}
                        {project.vatIncluded && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(calculateVAT(project.budget))}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-4">
              <p className="text-sm text-gray-600">Total Projects Value</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(3000000)}</p>
            </div>
            <div className="text-center p-4">
              <p className="text-sm text-gray-600">Average Progress</p>
              <p className="text-2xl font-bold mt-1">55%</p>
            </div>
            <div className="text-center p-4">
              <p className="text-sm text-gray-600">Total VAT Liability</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(calculateVAT(3000000))}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectManagement;