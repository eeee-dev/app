import React from 'react';
import { Clock, AlertCircle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrencyMUR } from '@/lib/utils';

interface Expense {
  id: string;
  department: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'approved';
  date: string;
  invoiceNumber?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface RecentExpensesProps {
  expenses: Expense[];
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses }) => {
  const getStatusIcon = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: Expense['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority?: Expense['priority']) => {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Expenses</CardTitle>
          <Button variant="outline" size="sm">
            View All Expenses
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                  {getStatusIcon(expense.status)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{expense.description}</h4>
                    {expense.priority === 'critical' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {expense.department}
                    </Badge>
                    {expense.invoiceNumber && (
                      <span className="text-sm text-gray-600">
                        #{expense.invoiceNumber}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {formatCurrencyMUR(expense.amount)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`text-xs ${getStatusColor(expense.status)}`}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(expense.priority)}`}>
                      {getPriorityText(expense.priority)}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Approve Expense</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                    <DropdownMenuItem>Edit Expense</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {expenses.length} of 125 total expenses
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentExpenses;