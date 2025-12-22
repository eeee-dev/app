import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BankStatementUpload from '@/components/banking/BankStatementUpload';
import TransactionMatcher from '@/components/banking/TransactionMatcher';
import { FileText, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrencyMUR } from '@/lib/utils';

const BankStatements: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');

  const stats = {
    totalStatements: 8,
    processedStatements: 6,
    totalTransactions: 156,
    matchedTransactions: 112,
    unmatchedTransactions: 44,
    totalAmount: 3250000,
  };

  const recentActivity = [
    { id: 1, action: 'Statement uploaded', description: 'MCB Bank - December 2024', time: '2 hours ago', status: 'success' },
    { id: 2, action: 'Auto-match completed', description: 'Matched 12 transactions', time: '4 hours ago', status: 'success' },
    { id: 3, action: 'Manual match', description: 'Office rent payment matched', time: '1 day ago', status: 'success' },
    { id: 4, action: 'Statement processing', description: 'SBM Bank - November 2024', time: '2 days ago', status: 'processing' },
    { id: 5, action: 'Error detected', description: 'PDF parsing failed', time: '3 days ago', status: 'error' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Statements</h1>
          <p className="text-gray-600 mt-1">Upload, process, and match bank transactions with your financial records</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Processing Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Statements Processed</span>
                  <span className="font-medium">{stats.processedStatements}/{stats.totalStatements}</span>
                </div>
                <Progress value={(stats.processedStatements / stats.totalStatements) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Transactions Matched</span>
                  <span className="font-medium">{stats.matchedTransactions}/{stats.totalTransactions}</span>
                </div>
                <Progress value={(stats.matchedTransactions / stats.totalTransactions) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount Processed</span>
                <span className="text-xl font-bold">{formatCurrencyMUR(stats.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unmatched Transactions</span>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  {stats.unmatchedTransactions} pending
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Match Rate</span>
                <span className="font-medium">
                  {Math.round((stats.matchedTransactions / stats.totalTransactions) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${activity.status === 'success' ? 'bg-green-100' : activity.status === 'processing' ? 'bg-blue-100' : 'bg-red-100'}`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'processing' ? (
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="gap-2">
                <FileText className="h-4 w-4" />
                Upload Statements
              </TabsTrigger>
              <TabsTrigger value="match" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Match Transactions
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports & Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="upload" className="mt-0">
            <BankStatementUpload />
          </TabsContent>
          
          <TabsContent value="match" className="mt-0">
            <TransactionMatcher />
          </TabsContent>
          
          <TabsContent value="reports" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Bank Statement Analytics</h3>
                <p className="text-gray-600">
                  Detailed reports and analytics for bank statement processing will be available here.
                  This section will include:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                  <li>Monthly reconciliation reports</li>
                  <li>Transaction categorization analytics</li>
                  <li>Bank fee analysis</li>
                  <li>Cash flow forecasting based on historical patterns</li>
                  <li>Exportable reconciliation statements</li>
                </ul>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>
                    Advanced analytics features are currently in development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Advanced reporting features will be available in the next update</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankStatements;