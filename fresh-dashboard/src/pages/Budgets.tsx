import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Target, PieChart, Trash2, RefreshCw } from 'lucide-react';
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
import { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget,
  getBudgetSummary,
  recalculateBudgetSpent,
  type Budget 
} from '@/services/budgets';
import { getDepartments, type Department as DepartmentType } from '@/services/departments';

interface DepartmentBudget {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
  fiscal_year: number;
  quarter: number;
  notes?: string;
}

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);
  const [isAdjustBudgetOpen, setIsAdjustBudgetOpen] = useState(false);
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [budgetNotes, setBudgetNotes] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    budgetCount: 0,
    overBudgetCount: 0,
    utilizationRate: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetsData, departmentsData] = await Promise.all([
        getBudgets(),
        getDepartments()
      ]);

      // Filter budgets by selected year
      const yearBudgets = budgetsData.filter(b => b.fiscal_year === selectedYear);

      // Map budgets to department budgets with department names
      const mappedBudgets: DepartmentBudget[] = yearBudgets.map(budget => {
        const dept = departmentsData.find(d => d.id === budget.department_id);
        const remaining = budget.allocated - budget.spent;
        const utilization = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;

        return {
          id: budget.id,
          name: dept?.name || 'Unknown Department',
          allocated: budget.allocated,
          spent: budget.spent,
          remaining,
          utilization,
          fiscal_year: budget.fiscal_year,
          quarter: budget.quarter,
          notes: budget.notes,
        };
      });

      setBudgets(mappedBudgets);
      setDepartments(departmentsData);

      // Load summary
      const summaryData = await getBudgetSummary(selectedYear);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  // Load budgets and departments
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateBudget = async () => {
    if (!selectedDepartment || budgetAmount < 0) {
      toast.error('Please select a department and enter a valid budget amount (0 or greater)');
      return;
    }

    try {
      await createBudget({
        department_id: selectedDepartment,
        allocated: budgetAmount,
        fiscal_year: selectedYear,
        quarter: selectedQuarter,
        notes: budgetNotes,
      });

      toast.success(`Budget of ${formatCurrencyMUR(budgetAmount)} created for Q${selectedQuarter} ${selectedYear}`);
      setIsCreateBudgetOpen(false);
      resetForm();
      await loadData();
    } catch (error: unknown) {
      console.error('Error creating budget:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        toast.error('A budget already exists for this department, year, and quarter. Please adjust the existing budget instead.');
      } else {
        toast.error('Failed to create budget');
      }
    }
  };

  const handleAdjustBudget = async () => {
    if (!editingBudgetId || budgetAmount < 0) {
      toast.error('Please enter a valid adjustment amount (0 or greater)');
      return;
    }

    try {
      await updateBudget(editingBudgetId, {
        allocated: budgetAmount,
        notes: budgetNotes,
      });

      if (budgetAmount === 0) {
        toast.success(`Budget set to ${formatCurrencyMUR(0)}`);
      } else {
        toast.success(`Budget adjusted to ${formatCurrencyMUR(budgetAmount)}`);
      }
      
      setIsAdjustBudgetOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error adjusting budget:', error);
      toast.error('Failed to adjust budget');
    }
  };

  const handleDeleteBudget = async (budgetId: string, departmentName: string) => {
    if (window.confirm(`Are you sure you want to delete the budget for ${departmentName}? This action cannot be undone.`)) {
      try {
        await deleteBudget(budgetId);
        toast.success(`Budget for ${departmentName} has been deleted`);
        await loadData();
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error('Failed to delete budget');
      }
    }
  };

  const handleRecalculateSpent = async (budgetId: string) => {
    try {
      await recalculateBudgetSpent(budgetId);
      toast.success('Budget spent amount recalculated from expenses');
      await loadData();
    } catch (error) {
      console.error('Error recalculating spent:', error);
      toast.error('Failed to recalculate spent amount');
    }
  };

  const openAdjustDialog = (budget: DepartmentBudget) => {
    setEditingBudgetId(budget.id);
    setSelectedDepartment(budget.name);
    setBudgetAmount(budget.allocated);
    setBudgetNotes(budget.notes || '');
    setIsAdjustBudgetOpen(true);
  };

  const resetForm = () => {
    setSelectedDepartment('');
    setBudgetAmount(0);
    setBudgetNotes('');
    setEditingBudgetId(null);
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

  // Group budgets by quarter for quarterly view
  const quarterlyData = [1, 2, 3, 4].map(quarter => {
    const quarterBudgets = budgets.filter(b => b.quarter === quarter);
    const allocated = quarterBudgets.reduce((sum, b) => sum + b.allocated, 0);
    const spent = quarterBudgets.reduce((sum, b) => sum + b.spent, 0);
    const variance = allocated - spent;

    return {
      name: `Q${quarter} ${selectedYear}`,
      allocated,
      spent,
      variance,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Planning</h1>
          <p className="text-gray-600 mt-1">Manage and allocate budgets across departments and projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            className="border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
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
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Fiscal Year</Label>
                    <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2023, 2024, 2025, 2026].map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quarter">Quarter</Label>
                    <Select value={selectedQuarter.toString()} onValueChange={(val) => setSelectedQuarter(parseInt(val))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Q1</SelectItem>
                        <SelectItem value="2">Q2</SelectItem>
                        <SelectItem value="3">Q3</SelectItem>
                        <SelectItem value="4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  <p className="text-xs text-gray-500">You can set the budget to 0 if needed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={budgetNotes}
                    onChange={(e) => setBudgetNotes(e.target.value)}
                    placeholder="Add any notes about this budget"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreateBudgetOpen(false); resetForm(); }}>
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
            <CardTitle>Department Budget Overview - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No budgets created yet for {selectedYear}</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Create Budget" to get started</p>
                </div>
              ) : (
                budgets.map((budget) => (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{budget.name}</span>
                        <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                          Q{budget.quarter} - {formatCurrencyMUR(budget.allocated)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrencyMUR(budget.spent)}</div>
                          <div className="text-sm text-gray-500">spent</div>
                        </div>
                        <div className={`flex items-center ${budget.utilization > 90 ? 'text-red-600' : 'text-green-600'}`}>
                          {budget.utilization > 90 ? (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          )}
                          <span>{budget.allocated > 0 ? budget.utilization.toFixed(0) : '0'}%</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleRecalculateSpent(budget.id)}
                          title="Recalculate spent from expenses"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteBudget(budget.id, budget.name)}
                          title="Delete budget"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={budget.utilization} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatCurrencyMUR(budget.spent)} spent</span>
                      <span>{formatCurrencyMUR(budget.remaining)} remaining</span>
                    </div>
                    {budget.notes && (
                      <p className="text-sm text-gray-500 italic">Note: {budget.notes}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAdjustDialog(budget)}
                      className="mt-2"
                    >
                      Adjust Budget
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Summary - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {formatCurrencyMUR(summary.totalAllocated)}
                </div>
                <p className="text-gray-600 mt-1">Total Annual Budget</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Budget Utilization</span>
                  </div>
                  <span className="font-medium">{summary.utilizationRate.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Remaining</span>
                  </div>
                  <span className="font-medium text-green-600">{formatCurrencyMUR(summary.totalRemaining)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Over Budget Depts</span>
                  </div>
                  <span className="font-medium text-red-600">{summary.overBudgetCount}</span>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Dialog open={isAdjustBudgetOpen} onOpenChange={setIsAdjustBudgetOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adjust Department Budget</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Input value={selectedDepartment} disabled />
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
                          <p className="text-xs text-gray-500">You can set the budget to 0 if needed</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="adjust-notes">Notes (Optional)</Label>
                          <Input
                            id="adjust-notes"
                            value={budgetNotes}
                            onChange={(e) => setBudgetNotes(e.target.value)}
                            placeholder="Add any notes about this adjustment"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsAdjustBudgetOpen(false); resetForm(); }}>
                          Cancel
                        </Button>
                        <Button onClick={handleAdjustBudget}>Adjust Budget</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isForecastOpen} onOpenChange={setIsForecastOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700">
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
                    className="w-full justify-start border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
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
          <CardTitle>Quarterly Performance - {selectedYear}</CardTitle>
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
                {quarterlyData.map((quarter) => (
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