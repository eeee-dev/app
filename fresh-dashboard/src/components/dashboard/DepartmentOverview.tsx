import React from 'react';
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Department {
  id: string;
  name: string;
  code: string;
  allocated: number;
  spent: number;
  utilization: number;
  icon: string;
}

interface DepartmentOverviewProps {
  departments: Department[];
}

const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({ departments }) => {
  const departmentIcons: Record<string, string> = {
    'musiquë': '/assets/department-music-icon.png',
    'zimazë': '/assets/department-visual-icon.png',
    'bōucan': '/assets/department-studio-icon.png',
    'talënt': '/assets/department-talent-icon.png',
    'mōris': '/assets/department-store-icon.png'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Department Overview</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {departments.map((dept) => {
            const remaining = dept.allocated - dept.spent;
            const isOverBudget = dept.spent > dept.allocated;
            const iconSrc = departmentIcons[dept.name] || '/assets/logo-ë-ecosystem_variant_2.png';

            return (
              <div key={dept.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <img 
                      src={iconSrc} 
                      alt={dept.name} 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{dept.name}</h4>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {dept.code}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">${dept.spent.toLocaleString()}</span>
                        <span className="text-gray-400"> / ${dept.allocated.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        {isOverBudget ? (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-600 font-medium">
                              Over budget
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 font-medium">
                              ${remaining.toLocaleString()} remaining
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-48">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Utilization</span>
                      <span className={`font-medium ${dept.utilization > 90 ? 'text-red-600' : 'text-gray-700'}`}>
                        {dept.utilization.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(dept.utilization, 100)} 
                      className={`h-2 ${dept.utilization > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {dept.utilization > 90 
                        ? 'Critical - Review immediately' 
                        : dept.utilization > 70 
                        ? 'Monitor closely' 
                        : 'Healthy'}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Adjust Budget</DropdownMenuItem>
                      <DropdownMenuItem>View Expenses</DropdownMenuItem>
                      <DropdownMenuItem>Generate Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${departments.filter(d => d.utilization < 70).length}
              </div>
              <p className="text-sm text-gray-600">Departments on track</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                ${departments.filter(d => d.utilization >= 70 && d.utilization <= 90).length}
              </div>
              <p className="text-sm text-gray-600">Need monitoring</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ${departments.filter(d => d.utilization > 90).length}
              </div>
              <p className="text-sm text-gray-600">Critical attention</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentOverview;