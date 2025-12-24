import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, LineChart } from 'lucide-react';
import { formatCurrencyMUR } from '@/lib/utils';
import { expensesService } from '@/services/expenses';
import { incomeService } from '@/services/income';
import { departmentsService } from '@/services/departments';
import { toast } from 'sonner';

interface FinancialAnalyticsProps {
  className?: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface DepartmentPerformance {
  department: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const FinancialAnalytics = ({ className }: FinancialAnalyticsProps) => {
  const [cashFlowData, setCashFlowData] = useState<MonthlyData[]>([]);
  const [departmentPerformance, setDepartmentPerformance] = useState<DepartmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data from Supabase
        const [expenses, income, departments] = await Promise.all([
          expensesService.getAll(),
          incomeService.getAll(),
          departmentsService.getAll()
        ]);

        // Calculate monthly cash flow for the last 6 months
        const now = new Date();
        const monthlyData: MonthlyData[] = [];
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          
          // Filter expenses and income for this month
          const monthExpenses = expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() + 1 === month && expDate.getFullYear() === year;
          });
          
          const monthIncome = income.filter(inc => {
            const incDate = new Date(inc.date);
            return incDate.getMonth() + 1 === month && incDate.getFullYear() === year;
          });
          
          const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
          const totalIncome = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
          
          monthlyData.push({
            month: monthName,
            income: totalIncome,
            expenses: totalExpenses
          });
        }
        
        setCashFlowData(monthlyData);

        // Calculate department performance
        const deptPerformance: DepartmentPerformance[] = departments.map(dept => {
          // Get expenses for this department
          const deptExpenses = expenses.filter(exp => exp.department_id === dept.id);
          const totalExpenses = deptExpenses.reduce((sum, exp) => sum + exp.amount, 0);
          
          // Get income for this department
          const deptIncome = income.filter(inc => inc.department_id === dept.id);
          const totalRevenue = deptIncome.reduce((sum, inc) => sum + inc.amount, 0);
          
          return {
            department: dept.name,
            revenue: totalRevenue,
            expenses: totalExpenses,
            profit: totalRevenue - totalExpenses
          };
        }).filter(dept => dept.revenue > 0 || dept.expenses > 0); // Only show departments with activity

        setDepartmentPerformance(deptPerformance);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
        
        // Set empty data on error
        setCashFlowData([]);
        setDepartmentPerformance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate profit & loss data from real data
  const totalRevenue = cashFlowData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = cashFlowData.reduce((sum, month) => sum + month.expenses, 0);
  const grossProfit = totalRevenue - totalExpenses;
  const operatingExpenses = totalExpenses * 0.6; // Estimate 60% as operating expenses
  const netProfit = grossProfit - operatingExpenses;

  const profitLossData = [
    { category: 'Revenue', amount: totalRevenue },
    { category: 'Cost of Goods', amount: totalExpenses * 0.4 },
    { category: 'Gross Profit', amount: grossProfit },
    { category: 'Operating Expenses', amount: operatingExpenses },
    { category: 'Net Profit', amount: netProfit },
  ];

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const latestMonth = cashFlowData[cashFlowData.length - 1] || { month: '', income: 0, expenses: 0 };
  const previousMonth = cashFlowData[cashFlowData.length - 2] || { month: '', income: 0, expenses: 0 };
  const incomeTrend = calculateTrend(latestMonth.income, previousMonth.income);
  const expenseTrend = calculateTrend(latestMonth.expenses, previousMonth.expenses);
  const netCashFlow = latestMonth.income - latestMonth.expenses;

  // Show message if no data
  if (cashFlowData.length === 0 && departmentPerformance.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Analytics
          </CardTitle>
          <CardDescription>Detailed financial analysis and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              Start adding expenses and income to see financial analytics here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Financial Analytics
        </CardTitle>
        <CardDescription>Detailed financial analysis and insights from real data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cashflow" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="profitloss" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              P&L
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cashflow" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Income</p>
                      <p className="text-2xl font-bold">{formatCurrencyMUR(latestMonth.income)}</p>
                    </div>
                    <div className={`flex items-center ${incomeTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {incomeTrend >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      <span className="ml-1 text-sm">{Math.abs(incomeTrend).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                      <p className="text-2xl font-bold">{formatCurrencyMUR(latestMonth.expenses)}</p>
                    </div>
                    <div className={`flex items-center ${expenseTrend <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {expenseTrend <= 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                      <span className="ml-1 text-sm">{Math.abs(expenseTrend).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                      <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrencyMUR(netCashFlow)}
                      </p>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="text-sm">This month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Cash Flow Trend (Last 6 Months)</h4>
              <div className="space-y-2">
                {cashFlowData.map((month, index) => {
                  const netFlow = month.income - month.expenses;
                  const maxIncome = Math.max(...cashFlowData.map(m => m.income), 1);
                  const incomeWidth = (month.income / maxIncome) * 100;
                  const expenseWidth = (month.expenses / maxIncome) * 100;

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span className={netFlow >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrencyMUR(netFlow)}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${incomeWidth}%` }}
                            title={`Income: ${formatCurrencyMUR(month.income)}`}
                          />
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${expenseWidth}%` }}
                            title={`Expenses: ${formatCurrencyMUR(month.expenses)}`}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Income: {formatCurrencyMUR(month.income)}</span>
                        <span>Expenses: {formatCurrencyMUR(month.expenses)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profitloss" className="space-y-4">
            <div className="space-y-4">
              {profitLossData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <span className="font-medium">{item.category}</span>
                  <span className={`font-bold ${item.category.includes('Profit') ? 'text-green-500' : item.category.includes('Cost') || item.category.includes('Expenses') ? 'text-red-500' : 'text-blue-500'}`}>
                    {formatCurrencyMUR(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                  <p className="text-2xl font-bold text-green-500">
                    {totalRevenue > 0 ? ((profitLossData[2].amount / profitLossData[0].amount) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Margin</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {totalRevenue > 0 ? ((profitLossData[4].amount / profitLossData[0].amount) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            {departmentPerformance.length === 0 ? (
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Department Data</h3>
                <p className="text-muted-foreground">
                  Assign expenses and income to departments to see performance metrics.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {departmentPerformance.map((dept, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{dept.department}</p>
                          <p className="text-sm text-muted-foreground">Department Performance</p>
                        </div>
                        <div className={`text-lg font-bold ${dept.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrencyMUR(dept.profit)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Revenue</span>
                          <span className="text-green-500">{formatCurrencyMUR(dept.revenue)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${dept.revenue > 0 ? (dept.revenue / Math.max(...departmentPerformance.map(d => d.revenue))) * 100 : 0}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Expenses</span>
                          <span className="text-red-500">{formatCurrencyMUR(dept.expenses)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500" 
                            style={{ width: `${dept.expenses > 0 ? (dept.expenses / Math.max(...departmentPerformance.map(d => d.expenses))) * 100 : 0}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                          <span>Profit Margin</span>
                          <span className={dept.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {dept.revenue > 0 ? ((dept.profit / dept.revenue) * 100).toFixed(1) : '0.0'}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialAnalytics;