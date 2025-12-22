import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import BulkImportWizard from '@/components/import/BulkImportWizard';

interface ImportResult {
  fileName: string;
  fileType: string;
  rowCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

const BulkImport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('wizard');
  const [importHistory, setImportHistory] = useState<ImportResult[]>([
    {
      fileName: 'expenses_q4_2024.xlsx',
      fileType: 'Excel',
      rowCount: 150,
      successCount: 145,
      errorCount: 5,
      errors: ['2 rows with missing dates', '3 rows with invalid amounts'],
    },
    {
      fileName: 'income_statements.csv',
      fileType: 'CSV',
      rowCount: 89,
      successCount: 89,
      errorCount: 0,
      errors: [],
    },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate import process
    toast.info(`Processing ${file.name}...`);

    setTimeout(() => {
      const newResult: ImportResult = {
        fileName: file.name,
        fileType: file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'Excel' : 'CSV',
        rowCount: Math.floor(Math.random() * 200) + 50,
        successCount: Math.floor(Math.random() * 180) + 20,
        errorCount: Math.floor(Math.random() * 10),
        errors: Math.random() > 0.5 ? ['Some date format issues'] : [],
      };

      setImportHistory([newResult, ...importHistory]);
      toast.success(`Imported ${newResult.successCount} records successfully`);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Import</h1>
          <p className="text-muted-foreground">
            Import expenses, income, and transactions from Excel or CSV files
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="wizard">Import Wizard</TabsTrigger>
          <TabsTrigger value="quick">Quick Import</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-6">
          <BulkImportWizard />
        </TabsContent>

        <TabsContent value="quick" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Import</CardTitle>
              <CardDescription>
                Upload a file and we'll automatically detect the content type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drag & drop your file here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .xlsx, .xls, .csv files up to 10MB
                </p>
                <input
                  type="file"
                  id="quick-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
                <label htmlFor="quick-upload">
                  <Button asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Expenses</p>
                  <p className="text-sm text-muted-foreground">Import expense records</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Income</p>
                  <p className="text-sm text-muted-foreground">Import income statements</p>
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Transactions</p>
                  <p className="text-sm text-muted-foreground">Import bank transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>Recent bulk imports and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importHistory.map((importItem, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{importItem.fileName}</span>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">
                          {importItem.fileType}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {importItem.rowCount} rows
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Successful</p>
                        <p className="font-medium text-green-600">{importItem.successCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Errors</p>
                        <p className="font-medium text-destructive">{importItem.errorCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">
                          {((importItem.successCount / importItem.rowCount) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    {importItem.errors.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Issues:</p>
                        <ul className="space-y-1">
                          {importItem.errors.map((error, errorIndex) => (
                            <li key={errorIndex} className="text-sm text-destructive">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkImport;