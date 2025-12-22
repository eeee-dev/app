import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Scan, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  amount: number;
  vendor: string;
  description: string;
  confidence: number;
}

const InvoiceScanner: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setInvoiceData(null);
    setErrors([]);
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error('Please select an image file first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate OCR processing
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsProcessing(false);

          // Simulate extracted data
          const simulatedData: InvoiceData = {
            invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            date: new Date().toISOString().split('T')[0],
            amount: Math.random() * 1000 + 100,
            vendor: 'Sample Vendor Inc.',
            description: 'Professional services and consulting',
            confidence: 85 + Math.random() * 15,
          };

          setInvoiceData(simulatedData);

          // Simulate some errors
          const simulatedErrors: string[] = [];
          if (Math.random() > 0.7) {
            simulatedErrors.push('Amount field confidence is low');
          }
          if (Math.random() > 0.8) {
            simulatedErrors.push('Date format could not be verified');
          }
          setErrors(simulatedErrors);

          toast.success('Invoice scanned successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSave = () => {
    if (!invoiceData) return;

    // Here you would typically save to database
    toast.success('Invoice saved to database');
    resetScanner();
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setInvoiceData(null);
    setErrors([]);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Invoice Scanner
        </CardTitle>
        <CardDescription>
          Upload an invoice image to automatically extract data using OCR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Upload Invoice Image</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPG, PNG, PDF files up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              id="invoice-upload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
            />
            <label htmlFor="invoice-upload">
              <Button asChild>
                <span>Select Image</span>
              </Button>
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Invoice preview"
                  className="w-full h-48 object-contain bg-muted"
                />
              </div>
            </div>
          )}
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing Invoice</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        {/* Extracted Data */}
        {invoiceData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="font-medium">Data Extracted Successfully</p>
              <span className="text-sm text-muted-foreground ml-auto">
                Confidence: {invoiceData.confidence.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input value={invoiceData.invoiceNumber} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input value={invoiceData.date} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Amount (MUR)</Label>
                <Input value={invoiceData.amount.toFixed(2)} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Input value={invoiceData.vendor} readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={invoiceData.description} readOnly />
            </div>

            {errors.length > 0 && (
              <div className="border border-destructive/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="font-medium">Review Required</p>
                </div>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave}>Save to Database</Button>
              <Button variant="outline" onClick={resetScanner}>
                Scan Another
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!invoiceData && selectedFile && !isProcessing && (
          <Button onClick={handleScan} className="w-full">
            <Scan className="h-4 w-4 mr-2" />
            Scan Invoice
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceScanner;