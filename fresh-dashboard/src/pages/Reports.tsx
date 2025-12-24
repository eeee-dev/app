import React, { useState, useEffect } from 'react';
import { FileText, BarChart3, PieChart, Download, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Report {
  id: number;
  name: string;
  type: string;
  date: string;
  size: string;
}

const STORAGE_KEY = 'financial_reports_data';

const Reports: React.FC = () => {
  const reportTypes = [
    {
      id: 'financial',
      name: 'Financial Statements',
      description: 'Income statements, balance sheets, cash flow reports',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'expense',
      name: 'Expense Analysis',
      description: 'Detailed expense breakdown by department and category',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'budget',
      name: 'Budget Performance',
      description: 'Budget vs actual spending analysis',
      icon: PieChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'department',
      name: 'Department Reports',
      description: 'Individual department performance and spending',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const [recentReports, setRecentReports] = useState<Report[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecentReports(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading reports:', error);
        setRecentReports([]);
      }
    }
  }, []);

  // Save to localStorage whenever recentReports changes
  useEffect(() => {
    if (recentReports.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentReports));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [recentReports]);

  const handleDeleteReport = (id: number) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setRecentReports(recentReports.filter(report => report.id !== id));
      toast.success('Report deleted successfully');
    }
  };

  const handleGenerateReport = (reportType: string) => {
    const newReport: Report = {
      id: Date.now(),
      name: `${reportType} Report - ${new Date().toLocaleDateString()}`,
      type: reportType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: `${(Math.random() * 3 + 1).toFixed(1)} MB`
    };
    
    setRecentReports([newReport, ...recentReports]);
    toast.success(`${reportType} report generated successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Generate and analyze comprehensive financial reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="border border-gray-300 bg-transparent hover:bg-gray-100 gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => handleGenerateReport('Financial')}>
            <FileText className="h-4 w-4" />
            Generate New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <div className={`p-2 rounded-full ${report.bgColor}`}>
                  <report.icon className={`h-5 w-5 ${report.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <Button 
                className="border border-gray-300 bg-transparent hover:bg-gray-100 w-full"
                onClick={() => handleGenerateReport(report.name)}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reports</CardTitle>
              <Select defaultValue="30">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet. Click "Generate Report" to create one.
                </div>
              ) : (
                recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">{report.type}</span>
                          <span className="text-sm text-gray-500">{report.date}</span>
                          <span className="text-sm text-gray-500">{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button className="border-0 bg-transparent hover:bg-gray-100">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button className="border-0 bg-transparent hover:bg-gray-100">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        className="border-0 bg-transparent hover:bg-gray-100 text-red-600"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Report Generation Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reports Generated</span>
                    <span className="font-medium">{recentReports.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Generation Time</span>
                    <span className="font-medium">2.3 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Most Popular</span>
                    <span className="font-medium">Financial</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="font-medium mb-3">Scheduled Reports</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Monthly Financial</p>
                      <p className="text-sm text-gray-600">Due: 1st of each month</p>
                    </div>
                    <Button className="border border-gray-300 bg-transparent hover:bg-gray-100 text-sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Quarterly Budget</p>
                      <p className="text-sm text-gray-600">Due: Next quarter</p>
                    </div>
                    <Button className="border border-gray-300 bg-transparent hover:bg-gray-100 text-sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="financial">
            <TabsList>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="financial" className="mt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Financial Report Builder</h3>
                <p className="text-gray-600 mb-6">Configure your financial report parameters below</p>
                <div className="flex justify-center space-x-3">
                  <Button className="border border-gray-300 bg-transparent hover:bg-gray-100">Configure Period</Button>
                  <Button className="border border-gray-300 bg-transparent hover:bg-gray-100">Select Metrics</Button>
                  <Button className="border border-gray-300 bg-transparent hover:bg-gray-100">Add Departments</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleGenerateReport('Financial')}>Generate Preview</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;