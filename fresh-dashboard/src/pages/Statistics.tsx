import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileImage, 
  Download, 
  Eye, 
  Calendar, 
  Filter, 
  Search, 
  Upload,
  Trash2,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  DollarSign,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { expensesService } from '@/services/expenses';
import { incomeService } from '@/services/income';
import { departmentsService } from '@/services/departments';
import { getBudgets } from '@/services/budgets';
import { formatCurrencyMUR } from '@/lib/utils';
import { toast } from 'sonner';

interface ScreenshotFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'dashboard' | 'report' | 'analysis' | 'other';
  description?: string;
  path: string;
}

interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface DepartmentStats {
  name: string;
  budget: number;
  spent: number;
  utilization: number;
  remaining: number;
}

const Statistics: React.FC = () => {
  // Screenshot state
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([
    {
      id: '1',
      name: 'Screenshot 2025-12-17 at /images/photo1766006180.jpg',
      size: '57.9 KB',
      date: '2025-12-17',
      type: 'dashboard',
      description: 'Dashboard overview with financial metrics',
      path: '/uploads/Screenshot 2025-12-17 at /images/photo1766006180.jpg'
    },
    {
      id: '2',
      name: 'Screenshot 2025-12-17 at 06.09.17 (1).png',
      size: '62.4 KB',
      date: '2025-12-17',
      type: 'report',
      description: 'Department creation error screenshot',
      path: '/uploads/Screenshot 2025-12-17 at 06.09.17 (1).png'
    },
    {
      id: '3',
      name: 'Screenshot 2025-12-18 at 00.53.46 (1).png',
      size: '62.4 KB',
      date: '2025-12-18',
      type: 'report',
      description: 'Monthly financial report summary',
      path: '/uploads/Screenshot 2025-12-18 at 00.53.46 (1).png'
    },
    {
      id: '4',
      name: 'e_logo.png',
      size: '1.36 MB',
      date: '2025-12-15',
      type: 'other',
      description: 'ë ecosystem logo',
      path: '/uploads/e_logo.png'
    },
    {
      id: '5',
      name: 'FinancialAnalysis.jpg',
      size: '1.16 MB',
      date: '2025-12-15',
      type: 'analysis',
      description: 'Financial analysis data',
      path: '/images/FinancialAnalysis.jpg'
    }
  ]);

  // Financial statistics state
  const [expenseCategories, setExpenseCategories] = useState<CategoryData[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [avgTransactionSize, setAvgTransactionSize] = useState(0);

  // Screenshot filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<ScreenshotFile | null>(null);

  useEffect(() => {
    fetchFinancialStatistics();
  }, []);

  const fetchFinancialStatistics = async () => {
    try {
      setLoading(true);
      
      const [expenses, income, departments, budgets] = await Promise.all([
        expensesService.getAll(),
        incomeService.getAll(),
        departmentsService.getAll(),
        getBudgets()
      ]);

      // Calculate expense categories
      const expenseCategoryMap = new Map<string, { amount: number; count: number }>();
      expenses.forEach(exp => {
        const category = exp.category || 'Uncategorized';
        const existing = expenseCategoryMap.get(category) || { amount: 0, count: 0 };
        expenseCategoryMap.set(category, {
          amount: existing.amount + exp.amount,
          count: existing.count + 1
        });
      });

      const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const expenseCats: CategoryData[] = Array.from(expenseCategoryMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenseAmount > 0 ? (data.amount / totalExpenseAmount) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);

      setExpenseCategories(expenseCats);

      // Calculate income categories (by department)
      const incomeCategoryMap = new Map<string, { amount: number; count: number }>();
      income.forEach(inc => {
        const dept = departments.find(d => d.id === inc.department_id);
        const category = dept?.name || 'General';
        const existing = incomeCategoryMap.get(category) || { amount: 0, count: 0 };
        incomeCategoryMap.set(category, {
          amount: existing.amount + inc.amount,
          count: existing.count + 1
        });
      });

      const totalIncomeAmount = income.reduce((sum, inc) => sum + inc.amount, 0);
      const incomeCats: CategoryData[] = Array.from(incomeCategoryMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalIncomeAmount > 0 ? (data.amount / totalIncomeAmount) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);

      setIncomeCategories(incomeCats);

      // Calculate monthly trends (last 6 months)
      const now = new Date();
      const trends: MonthlyTrend[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const monthExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() + 1 === month && expDate.getFullYear() === year;
        });
        
        const monthIncome = income.filter(inc => {
          const incDate = new Date(inc.date);
          return incDate.getMonth() + 1 === month && incDate.getFullYear() === year;
        });
        
        const expenseTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const incomeTotal = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
        
        trends.push({
          month: monthName,
          income: incomeTotal,
          expenses: expenseTotal,
          net: incomeTotal - expenseTotal
        });
      }
      
      setMonthlyTrends(trends);

      // Calculate department budget utilization
      const deptStats: DepartmentStats[] = departments.map(dept => {
        const deptExpenses = expenses.filter(exp => exp.department_id === dept.id);
        const spent = deptExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const budget = dept.budget || 0;
        
        return {
          name: dept.name,
          budget,
          spent,
          utilization: budget > 0 ? (spent / budget) * 100 : 0,
          remaining: budget - spent
        };
      }).filter(d => d.budget > 0).sort((a, b) => b.utilization - a.utilization);

      setDepartmentStats(deptStats);

      // Calculate totals and averages
      setTotalIncome(totalIncomeAmount);
      setTotalExpenses(totalExpenseAmount);
      
      const totalTransactions = expenses.length + income.length;
      const avgSize = totalTransactions > 0 ? (totalIncomeAmount + totalExpenseAmount) / totalTransactions : 0;
      setAvgTransactionSize(avgSize);

    } catch (error) {
      console.error('Error fetching financial statistics:', error);
      toast.error('Failed to load financial statistics');
    } finally {
      setLoading(false);
    }
  };

  const filteredScreenshots = screenshots.filter(screenshot => {
    const matchesSearch = screenshot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         screenshot.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || screenshot.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleViewImage = (screenshot: ScreenshotFile) => {
    setSelectedImage(screenshot);
  };

  const handleDownload = (screenshot: ScreenshotFile) => {
    const link = document.createElement('a');
    link.href = screenshot.path;
    link.download = screenshot.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this screenshot?')) {
      setScreenshots(prev => prev.filter(s => s.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newScreenshot: ScreenshotFile = {
          id: Date.now().toString(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          date: format(new Date(), 'yyyy-MM-dd'),
          type: 'other',
          description: 'Newly uploaded screenshot',
          path: URL.createObjectURL(file)
        };
        setScreenshots(prev => [newScreenshot, ...prev]);
      }
    };
    input.click();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dashboard': return 'bg-blue-100 text-blue-800';
      case 'report': return 'bg-green-100 text-green-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground uppercase tracking-wider text-sm">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Statistics & Analytics</h1>
          <p className="text-muted-foreground mt-1 uppercase tracking-wider text-sm">
            Financial insights and screenshot management
          </p>
        </div>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Financial Statistics
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Screenshots
          </TabsTrigger>
        </TabsList>

        {/* Financial Statistics Tab */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-minimal">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Income</p>
                    <p className="text-2xl font-bold">{formatCurrencyMUR(totalIncome)}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-minimal">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Expenses</p>
                    <p className="text-2xl font-bold">{formatCurrencyMUR(totalExpenses)}</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-minimal">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Net Position</p>
                    <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrencyMUR(totalIncome - totalExpenses)}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-minimal">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Avg Transaction</p>
                    <p className="text-2xl font-bold">{formatCurrencyMUR(avgTransactionSize)}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card className="card-minimal">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">Monthly Trends (Last 6 Months)</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                Income vs Expenses comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((trend, index) => {
                  const maxValue = Math.max(...monthlyTrends.map(t => Math.max(t.income, t.expenses)));
                  const incomeWidth = maxValue > 0 ? (trend.income / maxValue) * 100 : 0;
                  const expenseWidth = maxValue > 0 ? (trend.expenses / maxValue) * 100 : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium uppercase tracking-wider text-sm">{trend.month}</span>
                        <span className={`font-bold ${trend.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrencyMUR(trend.net)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Income</span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500"
                              style={{ width: `${incomeWidth}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-24 text-right">{formatCurrencyMUR(trend.income)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-16">Expenses</span>
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500"
                              style={{ width: `${expenseWidth}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-24 text-right">{formatCurrencyMUR(trend.expenses)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Categories and Department Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card className="card-minimal">
              <CardHeader>
                <CardTitle className="uppercase tracking-wider text-sm flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Expense Categories
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wider">
                  Top spending categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenseCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No expense data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenseCategories.slice(0, 5).map((cat, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium uppercase tracking-wider">{cat.category}</span>
                          <span className="text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={getCategoryColor(index)}
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-24 text-right">{formatCurrencyMUR(cat.amount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{cat.count} transactions</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income Sources */}
            <Card className="card-minimal">
              <CardHeader>
                <CardTitle className="uppercase tracking-wider text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Income Sources
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wider">
                  Revenue by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incomeCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">No income data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomeCategories.slice(0, 5).map((cat, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium uppercase tracking-wider">{cat.category}</span>
                          <span className="text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500"
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-24 text-right">{formatCurrencyMUR(cat.amount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{cat.count} transactions</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Department Budget Utilization */}
          <Card className="card-minimal">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">Department Budget Utilization</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                Budget vs actual spending by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {departmentStats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No department budget data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium uppercase tracking-wider text-sm">{dept.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrencyMUR(dept.spent)} of {formatCurrencyMUR(dept.budget)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${dept.utilization > 100 ? 'text-red-500' : dept.utilization > 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {dept.utilization.toFixed(1)}%
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {dept.remaining >= 0 ? 'Remaining' : 'Over'}: {formatCurrencyMUR(Math.abs(dept.remaining))}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${dept.utilization > 100 ? 'bg-red-500' : dept.utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(dept.utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screenshots Tab */}
        <TabsContent value="screenshots" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search screenshots..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
            <Button onClick={handleUpload} className="gap-2 btn-primary-minimal">
              <Upload className="h-4 w-4" />
              Upload Screenshot
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="card-minimal">
                <CardHeader>
                  <CardTitle className="uppercase tracking-wider text-sm">Screenshot Gallery</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider">
                    {filteredScreenshots.length} screenshot{filteredScreenshots.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" onValueChange={setSelectedType}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                      <TabsTrigger value="report">Reports</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredScreenshots.map((screenshot) => (
                        <Card key={screenshot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-video bg-secondary/50 flex items-center justify-center overflow-hidden">
                            <img
                              src={screenshot.path}
                              alt={screenshot.name}
                              className="w-full h-full object-contain p-2 cursor-pointer"
                              onClick={() => handleViewImage(screenshot)}
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate text-sm uppercase tracking-wider" title={screenshot.name}>
                                  {screenshot.name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate" title={screenshot.description}>
                                  {screenshot.description}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(screenshot.type)}`}>
                                {screenshot.type}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {screenshot.date}
                                </span>
                                <span>{screenshot.size}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2 btn-minimal"
                                onClick={() => handleViewImage(screenshot)}
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2 btn-minimal"
                                onClick={() => handleDownload(screenshot)}
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(screenshot.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {filteredScreenshots.length === 0 && (
                      <div className="text-center py-12">
                        <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No screenshots found</h3>
                        <p className="text-muted-foreground text-sm">
                          {searchTerm ? 'Try a different search term' : 'Upload your first screenshot to get started'}
                        </p>
                      </div>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="card-minimal">
                <CardHeader>
                  <CardTitle className="uppercase tracking-wider text-sm">Summary</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider">Overview of content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileImage className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Total Files</p>
                          <p className="text-xs text-muted-foreground">{screenshots.length} screenshots</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{screenshots.length}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <ImageIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Total Size</p>
                          <p className="text-xs text-muted-foreground">All files</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {screenshots.reduce((acc, s) => {
                          const size = parseFloat(s.size);
                          return acc + size;
                        }, 0).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-minimal">
                <CardHeader>
                  <CardTitle className="uppercase tracking-wider text-sm">Quick Actions</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider">Common tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2 btn-minimal" onClick={handleUpload}>
                      <Upload className="h-4 w-4" />
                      Upload New
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 btn-minimal">
                      <Download className="h-4 w-4" />
                      Export All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="font-bold text-lg uppercase tracking-wider">{selectedImage.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedImage.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedImage)}
                  className="gap-2 btn-minimal"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="btn-minimal"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[70vh]">
              <img
                src={selectedImage.path}
                alt={selectedImage.name}
                className="w-full h-auto max-h-[60vh] object-contain mx-auto"
              />
            </div>
            <div className="p-4 border-t border-white/10 text-sm text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>Size: {selectedImage.size}</span>
                <span>Date: {selectedImage.date}</span>
                <span className={`px-2 py-1 rounded-full ${getTypeColor(selectedImage.type)}`}>
                  {selectedImage.type}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  handleDelete(selectedImage.id);
                  setSelectedImage(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;