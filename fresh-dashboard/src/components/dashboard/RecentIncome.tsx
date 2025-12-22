import React from 'react';
import { ArrowUpRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyMUR } from '@/lib/utils';

interface Income {
  id: string;
  clientName: string;
  description: string;
  amount: number;
  status: 'pending' | 'received' | 'overdue';
  date: string;
  invoiceNumber: string;
}

interface RecentIncomeProps {
  income: Income[];
}

const RecentIncome: React.FC<RecentIncomeProps> = ({ income }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Income</CardTitle>
          <CardDescription>Latest income transactions</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {income.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No income records yet</div>
            <p className="text-sm text-gray-500">Add income to see recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {income.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{item.clientName}</p>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(item.status)}
                          <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>{item.invoiceNumber}</span>
                      <span>•</span>
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrencyMUR(item.amount)}</p>
                  <p className="text-xs text-gray-500">Income</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recent Income</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrencyMUR(income.reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Average per transaction</p>
              <p className="text-lg font-medium mt-1">
                {income.length > 0 
                  ? formatCurrencyMUR(income.reduce((sum, item) => sum + item.amount, 0) / income.length)
                  : formatCurrencyMUR(0)
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentIncome;