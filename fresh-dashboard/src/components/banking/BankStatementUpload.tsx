import React, { useState, useCallback } from 'react';
import { Upload, FileText, FileSpreadsheet, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatCurrencyMUR } from '@/lib/utils';

interface BankStatement {
  id: string;
  bankName: string;
  accountNumber: string;
  periodStart: string;
  periodEnd: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  totalTransactions: number;
  totalAmount: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  reference: string;
  status: 'unmatched' | 'matched' | 'ignored';
}

const BankStatementUpload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([
    {
      id: '1',
      bankName: 'MCB Bank',
      accountNumber: '****1234',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      fileName: 'mcb_statement_dec_2024.csv',
      fileType: 'csv',
      fileSize: 24567,
      uploadDate: '2024-12-15',
      status: 'completed',
      totalTransactions: 42,
      totalAmount: 1250000
    },
    {
      id: '2',
      bankName: 'SBM Bank',
      accountNumber: '****5678',
      periodStart: '2024-12-01',
      periodEnd: '2024-12-31',
      fileName: 'sbm_statement_dec_2024.pdf',
      fileType: 'pdf',
      fileSize: 156789,
      uploadDate: '2024-12-14',
      status: 'completed',
      totalTransactions: 28,
      totalAmount: 890000
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2024-12-01', description: 'Supplier Payment - Audio Equipment Inc.', amount: 50000, type: 'debit', category: 'Equipment', reference: 'TRX-001', status: 'matched' },
    { id: '2', date: '2024-12-02', description: 'Music Streaming Revenue', amount: 150000, type: 'credit', category: 'Royalties', reference: 'TRX-002', status: 'matched' },
    { id: '3', date: '2024-12-03', description: 'Office Rent Payment', amount: 25000, type: 'debit', category: 'Rent', reference: 'TRX-003', status: 'matched' },
    { id: '4', date: '2024-12-04', description: 'Video Production Contract', amount: 80000, type: 'credit', category: 'Services', reference: 'TRX-004', status: 'matched' },
    { id: '5', date: '2024-12-05', description: 'Unknown Transaction', amount: 12000, type: 'debit', category: 'Uncategorized', reference: 'TRX-005', status: 'unmatched' },
    { id: '6', date: '2024-12-06', description: 'Studio Rental Income', amount: 45000, type: 'credit', category: 'Rental', reference: 'TRX-006', status: 'matched' },
    { id: '7', date: '2024-12-07', description: 'Mystery Payment', amount: 8500, type: 'debit', category: 'Uncategorized', reference: 'TRX-007', status: 'unmatched' },
  ]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        alert(`File type not supported: ${file.name}. Please upload CSV, Excel, or PDF files.`);
        return false;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File too large: ${file.name}. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    event.target.value = ''; // Reset input
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const simulateUpload = useCallback((file: File, index: number) => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Add mock bank statement
          const newStatement: BankStatement = {
            id: (bankStatements.length + 1).toString(),
            bankName: ['MCB Bank', 'SBM Bank', 'Mauritius Commercial Bank', 'Absa Bank'][Math.floor(Math.random() * 4)],
            accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
            periodStart: '2024-12-01',
            periodEnd: '2024-12-31',
            fileName: file.name,
            fileType: file.type.split('/')[1] || file.name.split('.').pop() || 'unknown',
            fileSize: file.size,
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'completed',
            totalTransactions: Math.floor(Math.random() * 50) + 10,
            totalAmount: Math.floor(Math.random() * 1000000) + 100000
          };
          
          setBankStatements(prev => [newStatement, ...prev]);
          resolve();
        }
        setUploadProgress(prev => ({ ...prev, [index]: progress }));
      }, 100);
    });
  }, [bankStatements.length]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress({});
    
    try {
      // Simulate upload for each file
      for (let i = 0; i < selectedFiles.length; i++) {
        await simulateUpload(selectedFiles[i], i);
      }
      
      // Clear selected files after successful upload
      setSelectedFiles([]);
      
      // Add some mock transactions
      const newTransactions: Transaction[] = Array.from({ length: 5 }, (_, i) => ({
        id: (transactions.length + i + 1).toString(),
        date: `2024-12-${String(8 + i).padStart(2, '0')}`,
        description: ['Office Supplies', 'Internet Bill', 'Software Subscription', 'Marketing Expenses', 'Travel Reimbursement'][i],
        amount: Math.floor(Math.random() * 5000) + 1000,
        type: Math.random() > 0.3 ? 'debit' : 'credit',
        category: ['Supplies', 'Utilities', 'Software', 'Marketing', 'Travel'][i],
        reference: `TRX-${String(transactions.length + i + 1).padStart(3, '0')}`,
        status: 'unmatched'
      }));
      
      setTransactions(prev => [...newTransactions, ...prev]);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [selectedFiles, simulateUpload, transactions.length]);

  const getFileIcon = (file: File) => {
    if (file.type.includes('csv') || file.name.endsWith('.csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || 
               file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    } else if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: BankStatement['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bank Statement Upload</h2>
        <p className="text-gray-600 mt-1">Upload CSV, Excel, or PDF bank statements to extract and match transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Bank Statements</CardTitle>
          <CardDescription>
            Supported formats: CSV, Excel (.xls, .xlsx), PDF. Maximum file size: 50MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop your bank statement files here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
              
              <input
                type="file"
                multiple
                accept=".csv,.xls,.xlsx,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="bank-statement-upload"
              />
              <label htmlFor="bank-statement-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose Files
                </Button>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h3>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {file.type || 'Unknown type'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {uploadProgress[index] !== undefined ? (
                        <div className="w-32">
                          <Progress value={uploadProgress[index]} className="h-2" />
                          <p className="text-xs text-gray-500 text-right mt-1">{Math.round(uploadProgress[index])}%</p>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || selectedFiles.length === 0}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>
              Your recently processed bank statements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankStatements.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No bank statements uploaded yet</p>
                </div>
              ) : (
                bankStatements.map((statement) => (
                  <div key={statement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {statement.fileType === 'csv' || statement.fileType === 'xls' || statement.fileType === 'xlsx' ? (
                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      ) : (
                        <FileText className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{statement.fileName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">{statement.bankName} • {statement.accountNumber}</span>
                          {getStatusBadge(statement.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {statement.periodStart} to {statement.periodEnd} • {formatFileSize(statement.fileSize)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrencyMUR(statement.totalAmount)}</p>
                      <p className="text-sm text-gray-500">{statement.totalTransactions} transactions</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
            <CardDescription>
              Overview of extracted transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold mt-1">{transactions.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Unmatched</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {transactions.filter(t => t.status === 'unmatched').length}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Recent Transactions</h4>
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">{transaction.date}</span>
                        <Badge variant="outline" className={
                          transaction.type === 'debit' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                        }>
                          {transaction.type === 'debit' ? 'Debit' : 'Credit'}
                        </Badge>
                        <Badge variant="outline" className={
                          transaction.status === 'matched' ? 'bg-green-50 text-green-700 border-green-200' : 
                          transaction.status === 'ignored' ? 'bg-gray-50 text-gray-700 border-gray-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.type === 'debit' ? '-' : '+'}{formatCurrencyMUR(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  {transactions.filter(t => t.status === 'unmatched').length} transactions need to be matched with expenses or income records.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankStatementUpload;