import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ImportData {
  fileName: string;
  fileType: string;
  rowCount: number;
  errors: string[];
  successCount: number;
}

const BulkImportWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importData, setImportData] = useState<ImportData | null>(null);

  const steps: ImportStep[] = [
    {
      id: 1,
      title: 'Upload File',
      description: 'Select your Excel or CSV file',
      icon: <Upload className="h-5 w-5" />,
    },
    {
      id: 2,
      title: 'Validate Data',
      description: 'Check for errors and format issues',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: 3,
      title: 'Import Data',
      description: 'Process and save to database',
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate file processing
    setIsImporting(true);
    setImportProgress(0);

    const progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsImporting(false);
          setCurrentStep(2);
          setImportData({
            fileName: file.name,
            fileType: file.type,
            rowCount: 150,
            errors: ['5 rows with missing dates', '2 rows with invalid amounts'],
            successCount: 143,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleValidate = () => {
    setCurrentStep(3);
    toast.success('Data validation completed successfully');
  };

  const handleImport = () => {
    setIsImporting(true);
    setImportProgress(0);

    const progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsImporting(false);
          toast.success('Import completed successfully!');
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Bulk Import Wizard</CardTitle>
        <CardDescription>
          Import expenses, income, or transactions from Excel or CSV files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Import Progress</span>
            <span>{importProgress}%</span>
          </div>
          <Progress value={importProgress} className="h-2" />
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drag & drop your file here</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports .xlsx, .xls, .csv files up to 10MB
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          </div>
        )}

        {currentStep === 2 && importData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">File Name</p>
                  <p className="font-medium">{importData.fileName}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="font-medium">{importData.rowCount}</p>
                </CardContent>
              </Card>
            </div>

            {importData.errors.length > 0 && (
              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <p className="font-medium">Validation Issues Found</p>
                  </div>
                  <ul className="space-y-1">
                    {importData.errors.map((error, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={handleValidate} disabled={isImporting}>
                {isImporting ? 'Validating...' : 'Continue to Import'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="font-medium">Ready to Import</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {importData?.successCount || 0} records will be imported to the database.
                </p>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleImport} disabled={isImporting}>
                    {isImporting ? 'Importing...' : 'Start Import'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkImportWizard;