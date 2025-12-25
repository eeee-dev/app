import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, FileSpreadsheet, FileJson, Calendar, Filter, Settings } from 'lucide-react';
import { useState } from 'react';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  defaultFormat: 'csv' | 'excel' | 'json' | 'pdf';
}

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  includes: string[];
}

const EnhancedExport = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['expenses', 'incomes']);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json' | 'pdf'>('excel');
  const [dateRange, setDateRange] = useState<'last30' | 'last90' | 'current_month' | 'custom'>('last30');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('financial_summary');
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);

  const exportOptions: ExportOption[] = [
    { id: 'expenses', label: 'Expenses', description: 'All expense records with details', defaultFormat: 'excel' },
    { id: 'incomes', label: 'Incomes', description: 'Income transactions and sources', defaultFormat: 'excel' },
    { id: 'invoices', label: 'Invoices', description: 'Invoice tracking and status', defaultFormat: 'pdf' },
    { id: 'budgets', label: 'Budgets', description: 'Budget allocations and utilization', defaultFormat: 'excel' },
    { id: 'departments', label: 'Departments', description: 'Department performance metrics', defaultFormat: 'csv' },
    { id: 'tax_records', label: 'Tax Records', description: 'VAT and tax calculations', defaultFormat: 'pdf' },
    { id: 'audit_trail', label: 'Audit Trail', description: 'System activity logs', defaultFormat: 'json' },
  ];

  const exportTemplates: ExportTemplate[] = [
    {
      id: 'financial_summary',
      name: 'Financial Summary',
      description: 'Comprehensive financial overview with charts',
      includes: ['expenses', 'incomes', 'budgets', 'departments']
    },
    {
      id: 'monthly_report',
      name: 'Monthly Report',
      description: 'Standard monthly financial report',
      includes: ['expenses', 'incomes', 'invoices']
    },
    {
      id: 'tax_preparation',
      name: 'Tax Preparation',
      description: 'All data needed for tax filing',
      includes: ['incomes', 'expenses', 'tax_records']
    },
    {
      id: 'audit_package',
      name: 'Audit Package',
      description: 'Complete dataset for financial audit',
      includes: ['expenses', 'incomes', 'invoices', 'audit_trail']
    },
    {
      id: 'department_review',
      name: 'Department Review',
      description: 'Department performance analysis',
      includes: ['departments', 'budgets', 'expenses']
    }
  ];

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = exportTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedOptions(template.includes);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'json':
        return <FileJson className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleExport = () => {
    // In a real application, this would trigger the actual export process
    const exportData = {
      options: selectedOptions,
      format: exportFormat,
      dateRange,
      customStart: dateRange === 'custom' ? customStart : undefined,
      customEnd: dateRange === 'custom' ? customEnd : undefined,
      template: selectedTemplate,
      includeCharts,
      includeMetadata,
      timestamp: new Date().toISOString()
    };

    console.log('Exporting data:', exportData);
    
    // Mock export success
    alert(`Exporting ${selectedOptions.length} datasets in ${exportFormat.toUpperCase()} format...\n\nThis would generate a download in a real application.`);
  };

  const selectedCount = selectedOptions.length;
  const selectedTemplateData = exportTemplates.find(t => t.id === selectedTemplate);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Enhanced Export
        </CardTitle>
        <CardDescription>Batch export financial data with custom templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Export Templates</Label>
            <span className="text-sm text-muted-foreground">
              {selectedTemplateData?.name || 'Select a template'}
            </span>
          </div>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {exportTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex flex-col">
                    <span>{template.name}</span>
                    <span className="text-xs text-muted-foreground">{template.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Data to Export</Label>
            <span className="text-sm text-muted-foreground">
              {selectedCount} of {exportOptions.length} selected
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportOptions.map(option => (
              <div
                key={option.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  selectedOptions.includes(option.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={() => handleOptionToggle(option.id)}
                />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={option.id} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getFormatIcon(option.defaultFormat)}
                    <span>{option.defaultFormat.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Export Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <Label className="font-medium">Export Settings</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'json' | 'pdf') => setExportFormat(value)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    {getFormatIcon(exportFormat)}
                    <SelectValue placeholder="Select format" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV (.csv)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF (.pdf)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON (.json)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: 'last30' | 'last90' | 'current_month' | 'custom') => setDateRange(value)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <SelectValue placeholder="Select date range" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30">Last 30 days</SelectItem>
                  <SelectItem value="last90">Last 90 days</SelectItem>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label className="font-medium">Additional Options</Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="include-charts" className="cursor-pointer">
                  Include charts and visualizations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="include-metadata" className="cursor-pointer">
                  Include metadata and export summary
                </Label>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Export Summary */}
        <div className="space-y-3">
          <Label className="font-medium">Export Summary</Label>
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Selected datasets:</span>
              <span className="font-medium">{selectedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Export format:</span>
              <span className="font-medium">{exportFormat.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Date range:</span>
              <span className="font-medium">
                {dateRange === 'custom' 
                  ? `${customStart || 'Start'} to ${customEnd || 'End'}`
                  : dateRange.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Template:</span>
              <span className="font-medium">{selectedTemplateData?.name}</span>
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={handleExport}
          disabled={selectedCount === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data ({selectedCount} datasets)
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedExport;