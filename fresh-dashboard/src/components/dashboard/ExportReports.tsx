import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, FileSpreadsheet, Calendar, Filter, Users, Building } from 'lucide-react';
import { toast } from 'sonner';

type ExportFormat = 'pdf' | 'excel' | 'csv';
type DateRange = 'last-week' | 'last-month' | 'last-quarter' | 'custom';

interface ExportOptions {
  format: ExportFormat;
  includeProjects: boolean;
  includeDepartments: boolean;
  includeAuditLogs: boolean;
  includeVATCalculations: boolean;
  dateRange: DateRange;
  customStartDate?: string;
  customEndDate?: string;
}

const ExportReports: React.FC = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeProjects: true,
    includeDepartments: true,
    includeAuditLogs: false,
    includeVATCalculations: true,
    dateRange: 'last-month'
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Export Successful", {
      description: `Your report has been generated in ${exportOptions.format.toUpperCase()} format.`,
    });
    
    setIsExporting(false);
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatOptions = [
    { value: 'pdf' as ExportFormat, label: 'PDF Document', description: 'Best for printing and sharing' },
    { value: 'excel' as ExportFormat, label: 'Excel Spreadsheet', description: 'Best for data analysis' },
    { value: 'csv' as ExportFormat, label: 'CSV File', description: 'Best for importing into other systems' },
  ];

  const dateRangeOptions = [
    { value: 'last-week' as DateRange, label: 'Last 7 Days' },
    { value: 'last-month' as DateRange, label: 'Last 30 Days' },
    { value: 'last-quarter' as DateRange, label: 'Last 90 Days' },
    { value: 'custom' as DateRange, label: 'Custom Range' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports
        </CardTitle>
        <CardDescription>
          Generate and download financial reports in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Export Format</Label>
              <p className="text-sm text-gray-500 mb-3">Choose the format for your report</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formatOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      exportOptions.format === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportOptions({ ...exportOptions, format: option.value })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${
                        exportOptions.format === option.value ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {getFormatIcon(option.value)}
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div>
              <Label className="text-sm font-medium">Date Range</Label>
              <p className="text-sm text-gray-500 mb-3">Select the time period for your report</p>
              <Select
                value={exportOptions.dateRange}
                onValueChange={(value: DateRange) => setExportOptions({ ...exportOptions, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Selection */}
            <div>
              <Label className="text-sm font-medium">Report Content</Label>
              <p className="text-sm text-gray-500 mb-3">Select what to include in your report</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="includeProjects"
                    checked={exportOptions.includeProjects}
                    onCheckedChange={(checked) => 
                      setExportOptions({ ...exportOptions, includeProjects: checked as boolean })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <div>
                      <Label htmlFor="includeProjects" className="font-medium">Projects</Label>
                      <p className="text-sm text-gray-500">Include all project data and budgets</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="includeDepartments"
                    checked={exportOptions.includeDepartments}
                    onCheckedChange={(checked) => 
                      setExportOptions({ ...exportOptions, includeDepartments: checked as boolean })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <div>
                      <Label htmlFor="includeDepartments" className="font-medium">Departments</Label>
                      <p className="text-sm text-gray-500">Include department budgets and expenses</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="includeAuditLogs"
                    checked={exportOptions.includeAuditLogs}
                    onCheckedChange={(checked) => 
                      setExportOptions({ ...exportOptions, includeAuditLogs: checked as boolean })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-green-500" />
                    <div>
                      <Label htmlFor="includeAuditLogs" className="font-medium">Audit Logs</Label>
                      <p className="text-sm text-gray-500">Include system activity and user actions</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="includeVATCalculations"
                    checked={exportOptions.includeVATCalculations}
                    onCheckedChange={(checked) => 
                      setExportOptions({ ...exportOptions, includeVATCalculations: checked as boolean })
                    }
                  />
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <div>
                      <Label htmlFor="includeVATCalculations" className="font-medium">VAT Calculations</Label>
                      <p className="text-sm text-gray-500">Include 15% VAT calculations and records</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Export Summary</h4>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">{formatOptions.find(f => f.value === exportOptions.format)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium">{dateRangeOptions.find(d => d.value === exportOptions.dateRange)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Included:</span>
                  <span className="font-medium">
                    {[
                      exportOptions.includeProjects && 'Projects',
                      exportOptions.includeDepartments && 'Departments',
                      exportOptions.includeAuditLogs && 'Audit Logs',
                      exportOptions.includeVATCalculations && 'VAT'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="pt-4 border-t">
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full gap-2"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Generate & Download Report
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">
                Report will be generated with MUR currency and 15% VAT calculations
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportReports;