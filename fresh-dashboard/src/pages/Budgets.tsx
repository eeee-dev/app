import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatCurrencyMUR } from '@/lib/utils';

interface Department {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
}

const Budgets: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([
    { name: 'musiquë', allocated: 50000, spent: 42000, remaining: 8000, utilization: 84 },
    { name: 'zimazë', allocated: 75000, spent: 68000, remaining: 7000, utilization: 91 },
    { name: 'bōucan', allocated: 120000, spent: 105000, remaining: 15000, utilization: 88 },
    { name: 'talënt', allocated: 45000, spent: 32000, remaining: 13000, utilization: 71 },
    { name: 'mōris', allocated: 30000, spent: 28000, remaining: 2000, utilization: 93 },
  ]);

  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);
  const [isAdjustBudgetOpen, setIsAdjustBudgetOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [budgetAmount, setBudgetAmount] = useState(0);

  const quarters = [
    { name: 'Q1 2024', allocated: 250000, spent: 230000, variance: -20000 },
    { name: 'Q2 2024', allocated: 280000, spent: 265000, variance: -15000 },
    { name: 'Q3 2024', allocated: 300000, spent: 285000, variance: -15000 },
    { name: 'Q4 2024', allocated: 320000, spent: 275000, variance: 45000 },
  ];

  const handleCreateBudget = () => {
    if (!selectedDepartment || budgetAmount <= 0) {
      toast.error('Please select a department and enter a valid budget amount');
      return;
    }

    toast.success(`Budget of ${formatCurrencyMUR(budgetAmount)} created for ${selectedDepartment}`);
    setIsCreateBudgetOpen(false);
    setSelectedDepartment('');
    setBudgetAmount(0);
  };

  const handleAdjustBudget = () => {
    if (!selectedDepartment || budgetAmount <= 0) {
      toast.error('Please select a department and enter a valid adjustment amount');
      return;
    }

    // Update department budget
    setDepartments(departments.map(dept => {
      if (dept.name === selectedDepartment) {
        const newAllocated = budgetAmount;
        const newRemaining = newAllocated - dept.spent;
        const newUtilization = newAllocated > 0 ? (dept.spent / newAllocated) * 100 : 0;
        return {
          ...dept,
          allocated: newAllocated,
          remaining: newRemaining,
          utilization: newUtilization
        };
      }
      return dept;
    }));

    toast.success(`Budget adjusted for ${selectedDepartment}`);
    setIsAdjustBudgetOpen(false);
    setSelectedDepartment('');
    setBudgetAmount(0);
  };

  const handleCreateForecast = () => {
    toast.success('Quarterly forecast created successfully');
    setIsForecastOpen(false);
  };

  const handleGenerateReport = () => {
    toast.success('Budget report generated and downloaded');
    console.log('Generating budget report...');
  };

  const handleComparePeriods = () => {
    toast.info('Period comparison view opened');
    console.log('Opening period comparison...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Planning</h1>
          <p className="text-gray-600 mt-1">Manage and allocate budgets across departments and projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            className="border border-gray-300 bg-transparent hover:bg-gray-100"
            onClick={handleComparePeriods}
          >
            Compare Periods
          </Button>
          
          <Dialog open={isCreateBudgetOpen} onOpenChange={setIsCreateBudgetOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">Create Budget</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.name} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount (MUR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateBudgetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBudget}>Create Budget</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {departments.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                        {formatCurrencyMUR(dept.allocated)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrencyMUR(dept.spent)}</div>
                        <div className="text-sm text-gray-500">spent</div>
                      </div>
                      <div className={`flex items-center ${dept.utilization > 90 ? 'text-red-600' : 'text-green-600'}`}>
                        {dept.utilization > 90 ? (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        )}
                        <span>{dept.utilization}%</span>
                      </div>
                    </div>
                  </div>
                  <Progress value={dept.utilization} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatCurrencyMUR(dept.spent)} spent</span>
                    <span>{formatCurrencyMUR(dept.remaining)} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {formatCurrencyMUR(departments.reduce((sum, dept) => sum + dept.allocated, 0))}
                </div>
                <p className="text-gray-600 mt-1">Total Annual Budget</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Budget Utilization</span>
                  </div>
                  <span className="font-medium">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Under Budget</span>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrencyMUR(45000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Over Budget</span>
                  </div>
                  <span className="font-medium text-red-600">{formatCurrencyMUR(12000)}</span>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Dialog open={isAdjustBudgetOpen} onOpenChange={setIsAdjustBudgetOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100">
                        Adjust Department Budgets
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adjust Department Budget</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="adjust-department">Department</Label>
                          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(dept => (
                                <SelectItem key={dept.name} value={dept.name}>
                                  {dept.name} - Current: {formatCurrencyMUR(dept.allocated)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adjust-amount">New Budget Amount (MUR)</Label>
                          <Input
                            id="adjust-amount"
                            type="number"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            min="0"
                            step="1000"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAdjustBudgetOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAdjustBudget}>Adjust Budget</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isForecastOpen} onOpenChange={setIsForecastOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100">
                        Create Quarterly Forecast
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Quarterly Forecast</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="quarter">Quarter</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quarter" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="q1-2025">Q1 2025</SelectItem>
                              <SelectItem value="q2-2025">Q2 2025</SelectItem>
                              <SelectItem value="q3-2025">Q3 2025</SelectItem>
                              <SelectItem value="q4-2025">Q4 2025</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="forecast-amount">Forecast Amount (MUR)</Label>
                          <Input
                            id="forecast-amount"
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="1000"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsForecastOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateForecast}>Create Forecast</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100"
                    onClick={handleGenerateReport}
                  >
                    Generate Budget Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quarterly">
            <TabsList>
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
            </TabsList>
            <TabsContent value="quarterly" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {quarters.map((quarter) => (
                  <Card key={quarter.name}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{quarter.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-2xl font-bold">{formatCurrencyMUR(quarter.allocated)}</div>
                          <p className="text-sm text-gray-500">Allocated</p>
                        </div>
                        <div>
                          <div className={`text-xl font-bold ${quarter.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrencyMUR(quarter.spent)}
                          </div>
                          <p className="text-sm text-gray-500">Spent</p>
                        </div>
                        <div className="pt-2 border-t">
                          <div className={`flex items-center ${quarter.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {quarter.variance > 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            <span>{formatCurrencyMUR(Math.abs(quarter.variance))}</span>
                          </div>
                          <p className="text-xs text-gray-500">Variance</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Budgets;