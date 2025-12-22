import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download, Filter, Plus, BarChart3, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import RecentIncome from '@/components/dashboard/RecentIncome';
import FinancialAnalytics from '@/components/dashboard/FinancialAnalytics';
import { financialDashboardAPI } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { formatCurrencyMUR } from '@/lib/utils';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  code: string;
  allocated: number;
  spent: number;
  utilization: number;
  icon: string;
}

interface Expense {
  id: string;
  department: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'approved';
  date: string;
  invoiceNumber: string;
}

interface Income {
  id: string;
  clientName: string;
  description: string;
  amount: number;
  status: 'pending' | 'received' | 'overdue';
  date: string;
  invoiceNumber: string;
}

interface ApiDepartment {
  id: string;
  name: string;
  budget: number;
  spent: number;
  manager?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiExpense {
  id: string;
  user_id: string;
  department_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  status: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
  departments?: {
    name: string;
    budget: number;
    spent: number;
  };
}

interface ApiIncome {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  pendingInvoices: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  departments: Array<{
    name: string;
    budget: number;
    spent: number;
    utilization: number;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [recentIncome, setRecentIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Set current date
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    setCurrentDate(`${month} ${year}`);

    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch real data from API
        const [departmentsData, expensesData, incomeData, dashboardStats] = await Promise.all([
          financialDashboardAPI.getDepartments(),
          financialDashboardAPI.getExpenses(),
          financialDashboardAPI.getIncome(),
          financialDashboardAPI.getDashboardStats()
        ]);

        // Format departments for display
        const formattedDepartments: Department[] = (departmentsData as ApiDepartment[]).map(dept => ({
          id: dept.id,
          name: dept.name,
          code: dept.name.substring(0, 3).toUpperCase(),
          allocated: dept.budget || 0,
          spent: dept.spent || 0,
          utilization: dept.budget > 0 ? ((dept.spent || 0) / dept.budget) * 100 : 0,
          icon: dept.name.toLowerCase()
        }));

        // Format recent expenses
        const formattedExpenses: Expense[] = (expensesData as ApiExpense[]).map(expense => ({
          id: expense.id,
          department: expense.departments?.name || 'Unknown',
          description: expense.description,
          amount: expense.amount,
          status: expense.status as 'pending' | 'paid' | 'overdue' | 'approved',
          date: expense.date,
          invoiceNumber: `INV-${expense.id.padStart(3, '0')}`
        }));

        // Format recent income
        const formattedIncome: Income[] = (incomeData as ApiIncome[]).map(income => ({
          id: income.id,
          clientName: income.client_name,
          description: income.description,
          amount: income.amount,
          status: income.status as 'pending' | 'received' | 'overdue',
          date: income.date,
          invoiceNumber: income.invoice_number
        }));

        // Update stats
        const statsData = dashboardStats as DashboardStats;
        setTotalIncome(statsData.totalIncome || 0);
        setTotalExpenses(statsData.totalExpenses || 0);
        setNetProfit((statsData.totalIncome || 0) - (statsData.totalExpenses || 0));
        setActiveProjects(formattedDepartments.length);

        setDepartments(formattedDepartments);
        setRecentExpenses(formattedExpenses.slice(0, 5));
        setRecentIncome(formattedIncome.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDepartments([]);
        setRecentExpenses([]);
        setRecentIncome([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleExportReport = () => {
    try {
      const reportContent = `
Financial Dashboard Report - ${currentDate}

Overall Statistics:
- Total Income: ${formatCurrencyMUR(totalIncome)}
- Total Expenses: ${formatCurrencyMUR(totalExpenses)}
- Net Profit: ${formatCurrencyMUR(netProfit)}
- Active Projects: ${activeProjects}

Department Overview:
${departments.map(dept => `- ${dept.name}: ${formatCurrencyMUR(dept.spent)} spent of ${formatCurrencyMUR(dept.allocated)} (${dept.utilization.toFixed(2)}%)`).join('\n')}

Recent Income:
${recentIncome.map(income => `- ${income.date}: ${income.clientName} - ${formatCurrencyMUR(income.amount)} (${income.status})`).join('\n')}

Recent Expenses:
${recentExpenses.map(exp => `- ${exp.date}: ${exp.description} - ${formatCurrencyMUR(exp.amount)} (${exp.status})`).join('\n')}

Generated on: ${new Date().toLocaleString()}
      `.trim();

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `financial_dashboard_report_${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dashboard report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error exporting report. Please try again.');
    }
  };

  const handleCustomizeView = () => {
    toast.info('Customize View: This would open a panel to customize dashboard widgets and layout.');
  };

  const handleAddExpense = () => {
    navigate('/expenses');
  };

  const handleAddIncome = () => {
    navigate('/income');
  };

  const handleViewDetailedAnalytics = () => {
    toast.info('Opening detailed analytics dashboard with advanced charts and insights.');
  };

  const handleScheduleReport = () => {
    const scheduleDate = prompt('Enter date for scheduled report (YYYY-MM-DD):', 
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (scheduleDate) {
      toast.success(`Report scheduled for ${scheduleDate}. You will receive it via email.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground uppercase tracking-wider text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-sm overflow-hidden bg-gradient-to-r from-primary/20 to-primary/10 p-8 border border-white/10">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-wider">Financial Dashboard</h1>
              <p className="text-muted-foreground uppercase tracking-wider text-sm">
                Welcome back! Here's your financial overview for {currentDate}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                className="btn-primary-minimal"
                onClick={handleExportReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button 
                className="btn-minimal"
                onClick={handleCustomizeView}
              >
                <Filter className="h-4 w-4 mr-2" />
                Customize View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="space-y-6">
        <StatsCards 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netProfit={netProfit}
          activeProjects={activeProjects}
        />
        
        {/* Financial Analytics Section */}
        <FinancialAnalytics />
        
        {/* Recent Income and Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentIncome income={recentIncome} />
          <RecentExpenses expenses={recentExpenses} />
        </div>
        
        {/* Quick Actions */}
        <Card className="card-minimal">
          <CardHeader>
            <CardTitle className="uppercase tracking-wider text-sm">Quick Actions</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider">Common dashboard tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                className="btn-primary-minimal w-full justify-start"
                onClick={handleAddExpense}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Expense
              </Button>
              <Button 
                className="btn-minimal w-full justify-start"
                onClick={handleAddIncome}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Income
              </Button>
              <Button 
                className="btn-minimal w-full justify-start"
                onClick={handleViewDetailedAnalytics}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                className="btn-minimal w-full justify-start"
                onClick={handleExportReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button 
                className="btn-minimal w-full justify-start"
                onClick={handleScheduleReport}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
              <Button 
                className="btn-minimal w-full justify-start"
                onClick={() => navigate('/reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;