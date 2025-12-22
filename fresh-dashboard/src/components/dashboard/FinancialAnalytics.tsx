import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, LineChart } from 'lucide-react';
import { formatCurrencyMUR } from '@/lib/utils';

interface FinancialAnalyticsProps {
  className?: string;
}

const FinancialAnalytics = ({ className }: FinancialAnalyticsProps) => {
  // Mock data for analytics
  const cashFlowData = [
    { month: 'Jan', income: 1250000, expenses: 980000 },
    { month: 'Feb', income: 1320000, expenses: 1050000 },
    { month: 'Mar', income: 1410000, expenses: 1120000 },
    { month: 'Apr', income: 1280000, expenses: 990000 },
    { month: 'May', income: 1350000, expenses: 1010000 },
    { month: 'Jun', income: 1480000, expenses: 1180000 },
  ];

  const departmentPerformance = [
    { department: 'mōris', revenue: 850000, expenses: 420000, profit: 430000 },
    { department: 'ë', revenue: 620000, expenses: 310000, profit: 310000 },
    { department: 'ëx', revenue: 480000, expenses: 250000, profit: 230000 },
    { department: 'ëy', revenue: 320000, expenses: 180000, profit: 140000 },
  ];

  const profitLossData = [
    { category: 'Revenue', amount: 2270000 },
    { category: 'Cost of Goods', amount: 1160000 },
    { category: 'Gross Profit', amount: 1110000 },
    { category: 'Operating Expenses', amount: 680000 },
    { category: 'Net Profit', amount: 430000 },
  ];

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const latestMonth = cashFlowData[cashFlowData.length - 1];
  const previousMonth = cashFlowData[cashFlowData.length - 2];
  const incomeTrend = calculateTrend(latestMonth.income, previousMonth.income);
  const expenseTrend = calculateTrend(latestMonth.expenses, previousMonth.expenses);
  const netCashFlow = latestMonth.income - latestMonth.expenses;

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
                  const maxIncome = Math.max(...cashFlowData.map(m => m.income));
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
                    {((profitLossData[2].amount / profitLossData[0].amount) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Margin</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {((profitLossData[4].amount / profitLossData[0].amount) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
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
                          style={{ width: `${(dept.revenue / Math.max(...departmentPerformance.map(d => d.revenue))) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Expenses</span>
                        <span className="text-red-500">{formatCurrencyMUR(dept.expenses)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ width: `${(dept.expenses / Math.max(...departmentPerformance.map(d => d.expenses))) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm font-medium pt-2 border-t">
                        <span>Profit Margin</span>
                        <span className={dept.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {((dept.profit / dept.revenue) * 100).toFixed(1)}%
                        </span>
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
  );
};

export default FinancialAnalytics;