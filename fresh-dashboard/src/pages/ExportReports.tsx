import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, FileSpreadsheet, FilePieChart, Printer, Mail, Filter, RefreshCw, Eye, Share2, BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ExportReports: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [reportType, setReportType] = useState('financial_summary');
  const [formatType, setFormatType] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const reportTypes = [
    { value: 'financial_summary', label: 'Financial Summary', icon: <FileText className="h-4 w-4" /> },
    { value: 'income_statement', label: 'Income Statement', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'balance_sheet', label: 'Balance Sheet', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'cash_flow', label: 'Cash Flow Statement', icon: <PieChart className="h-4 w-4" /> },
    { value: 'expense_analysis', label: 'Expense Analysis', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'department_performance', label: 'Department Performance', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'project_progress', label: 'Project Progress', icon: <FilePieChart className="h-4 w-4" /> },
    { value: 'audit_trail', label: 'Audit Trail', icon: <FileText className="h-4 w-4" /> },
  ];

  const formatTypes = [
    { value: 'pdf', label: 'PDF Document', icon: <FileText className="h-4 w-4" /> },
    { value: 'excel', label: 'Excel Spreadsheet', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { value: 'csv', label: 'CSV File', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { value: 'html', label: 'HTML Report', icon: <FileText className="h-4 w-4" /> },
  ];

  const handleExport = () => {
    const reportData = {
      reportType,
      formatType,
      dateRange,
      includeCharts,
      includeDetails,
      emailReport,
      emailAddress: emailReport ? emailAddress : undefined,
    };

    console.log('Exporting report with data:', reportData);
    
    // Simulate export process
    alert(`Exporting ${reportTypes.find(r => r.value === reportType)?.label} as ${formatTypes.find(f => f.value === formatType)?.label}...\n\nThis would generate and download the report file.`);
    
    // In a real app, this would trigger the actual export/download
    if (emailReport && emailAddress) {
      alert(`Report will also be sent to ${emailAddress}`);
    }
  };

  const handlePreview = () => {
    alert('Opening report preview...\n\nThis would show a preview of the report before exporting.');
  };

  const handleClearFilters = () => {
    setDateRange({});
    setReportType('financial_summary');
    setFormatType('pdf');
    setIncludeCharts(true);
    setIncludeDetails(true);
    setEmailReport(false);
    setEmailAddress('');
  };

  const getReportDescription = (type: string) => {
    switch (type) {
      case 'financial_summary':
        return 'Comprehensive overview of financial performance including income, expenses, and net profit.';
      case 'income_statement':
        return 'Detailed breakdown of revenue and expenses over the selected period.';
      case 'balance_sheet':
        return 'Snapshot of assets, liabilities, and equity at a specific point in time.';
      case 'cash_flow':
        return 'Analysis of cash inflows and outflows from operating, investing, and financing activities.';
      case 'expense_analysis':
        return 'Detailed analysis of expenses by category, department, and project.';
      case 'department_performance':
        return 'Performance metrics and budget utilization by department.';
      case 'project_progress':
        return 'Progress tracking, budget utilization, and milestones for all projects.';
      case 'audit_trail':
        return 'Complete log of all system activities and user actions.';
      default:
        return 'Select a report type to view description.';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Export Reports</h1>
          <p className="text-gray-600">Generate and export financial reports in various formats</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleClearFilters} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Customize your report settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type */}
              <div className="space-y-3">
                <Label>Report Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {reportTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={reportType === type.value ? "default" : "outline"}
                      className="h-auto py-3 flex flex-col items-center justify-center"
                      onClick={() => setReportType(type.value)}
                    >
                      <div className="mb-2">{type.icon}</div>
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {getReportDescription(reportType)}
                </p>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                      onSelect={(range) => setDateRange(range || {})}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Export Format */}
              <div className="space-y-3">
                <Label>Export Format</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formatTypes.map((format) => (
                    <Button
                      key={format.value}
                      variant={formatType === format.value ? "default" : "outline"}
                      className="h-auto py-3 flex flex-col items-center justify-center"
                      onClick={() => setFormatType(format.value)}
                    >
                      <div className="mb-2">{format.icon}</div>
                      <span className="text-xs">{format.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <Label>Report Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                    />
                    <Label htmlFor="include-charts" className="cursor-pointer">
                      Include charts and graphs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-details"
                      checked={includeDetails}
                      onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                    />
                    <Label htmlFor="include-details" className="cursor-pointer">
                      Include detailed transaction data
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-report"
                      checked={emailReport}
                      onCheckedChange={(checked) => setEmailReport(checked as boolean)}
                    />
                    <Label htmlFor="email-report" className="cursor-pointer">
                      Email report after generation
                    </Label>
                  </div>
                </div>

                {emailReport && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button size="lg" className="px-8" onClick={handleExport}>
              <Download className="h-5 w-5 mr-2" />
              Generate & Export Report
            </Button>
          </div>
        </div>

        {/* Preview & Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Sample of selected report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Report Preview</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {reportTypes.find(r => r.value === reportType)?.label}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">
                      {formatTypes.find(f => f.value === formatType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Charts:</span>
                    <span className="font-medium">
                      {includeCharts ? 'Included' : 'Excluded'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Details:</span>
                    <span className="font-medium">
                      {includeDetails ? 'Included' : 'Excluded'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>Last 5 generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Financial Summary', date: '2025-12-15', format: 'PDF', size: '2.4 MB' },
                  { name: 'Expense Analysis', date: '2025-12-14', format: 'Excel', size: '1.8 MB' },
                  { name: 'Department Performance', date: '2025-12-13', format: 'PDF', size: '3.1 MB' },
                  { name: 'Income Statement', date: '2025-12-12', format: 'CSV', size: '0.9 MB' },
                  { name: 'Project Progress', date: '2025-12-11', format: 'PDF', size: '2.7 MB' },
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.date} • {report.format}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{report.size}</span>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Current View
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Report Link
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Schedule Regular Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reports</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Most Used Format</p>
                <p className="text-2xl font-bold">PDF</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Size</p>
                <p className="text-2xl font-bold">2.1 MB</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-100">
                <FileSpreadsheet className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportReports;