import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, FileText, Download, Upload, Plus, Search, Filter, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface VATRecord {
  id: number;
  date: string;
  description: string;
  company: string;
  brn: string;
  amount: number;
  vat: number;
  total: number;
  status: string;
  department: string;
  type: 'input' | 'output';
}

const TaxReturn: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [calculationMode, setCalculationMode] = useState<'forward' | 'reverse'>('forward');
  
  const [vatRecords, setVatRecords] = useState<VATRecord[]>([
    { id: 1, date: '2024-12-01', description: 'Studio Equipment Purchase', company: 'Audio Tech Ltd', brn: 'C12345678', amount: 50000, vat: 7500, total: 57500, status: 'Paid', department: 'bōucan', type: 'input' },
    { id: 2, date: '2024-12-05', description: 'Marketing Campaign', company: 'Creative Agency', brn: 'C23456789', amount: 25000, vat: 3750, total: 28750, status: 'Pending', department: 'zimazë', type: 'input' },
    { id: 3, date: '2024-12-10', description: 'Music Streaming Revenue', company: 'Streaming Platform Inc', brn: 'C34567890', amount: 75000, vat: 11250, total: 86250, status: 'Paid', department: 'musiquë', type: 'output' },
    { id: 4, date: '2024-12-15', description: 'Office Supplies', company: 'Office Mart', brn: 'C45678901', amount: 15000, vat: 2250, total: 17250, status: 'Overdue', department: 'mōris', type: 'input' },
    { id: 5, date: '2024-12-20', description: 'Event Production Services', company: 'Events Co', brn: 'C56789012', amount: 100000, vat: 15000, total: 115000, status: 'Pending', department: 'talënt', type: 'output' },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    description: '',
    company: '',
    brn: '',
    amount: 0,
    department: '',
    type: 'input' as 'input' | 'output',
    status: 'Pending'
  });

  const calculateVAT = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      if (calculationMode === 'forward') {
        // Forward calculation: amount + VAT
        const vat = numAmount * 0.15;
        const total = numAmount + vat;
        setVatAmount(vat);
        setTotalAmount(total);
      } else {
        // Reverse calculation: extract VAT from total
        const baseAmount = numAmount / 1.15;
        const vat = numAmount - baseAmount;
        setVatAmount(vat);
        setTotalAmount(numAmount);
        setAmount(baseAmount.toFixed(2));
      }
    }
  };

  const handleCreateRecord = () => {
    if (!newRecord.description || !newRecord.company || newRecord.amount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const vat = newRecord.amount * 0.15;
    const total = newRecord.amount + vat;

    const record: VATRecord = {
      id: vatRecords.length + 1,
      date: new Date().toISOString().split('T')[0],
      description: newRecord.description,
      company: newRecord.company,
      brn: newRecord.brn,
      amount: newRecord.amount,
      vat: vat,
      total: total,
      status: newRecord.status,
      department: newRecord.department || 'musiquë',
      type: newRecord.type
    };

    setVatRecords([record, ...vatRecords]);
    setIsCreateDialogOpen(false);
    setNewRecord({
      description: '',
      company: '',
      brn: '',
      amount: 0,
      department: '',
      type: 'input',
      status: 'Pending'
    });
    toast.success('VAT record created successfully');
  };

  const handleDeleteRecord = (id: number) => {
    if (window.confirm('Are you sure you want to delete this VAT record?')) {
      setVatRecords(vatRecords.filter(record => record.id !== id));
      toast.success('VAT record deleted successfully');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge className="border border-gray-300 bg-transparent">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return `₨ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const inputVAT = vatRecords.filter(r => r.type === 'input').reduce((sum, r) => sum + r.vat, 0);
  const outputVAT = vatRecords.filter(r => r.type === 'output').reduce((sum, r) => sum + r.vat, 0);
  const netVAT = outputVAT - inputVAT;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mauritius VAT Return</h1>
          <p className="text-muted-foreground">
            Manage VAT calculations and tax records with 15% VAT rate for Mauritius
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
            VAT Rate: 15%
          </Badge>
          <Badge className="bg-green-50 text-green-700 border border-green-200">
            Currency: MUR ₨
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            VAT Calculator
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            VAT Records
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            VAT Summary
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VAT Calculator</CardTitle>
              <CardDescription>
                Calculate 15% VAT for any amount in MUR (Forward or Reverse calculation)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Label>Calculation Mode:</Label>
                <Select value={calculationMode} onValueChange={(value: 'forward' | 'reverse') => {
                  setCalculationMode(value);
                  setAmount('');
                  setVatAmount(0);
                  setTotalAmount(0);
                }}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forward">Forward (Amount → Add VAT)</SelectItem>
                    <SelectItem value="reverse">Reverse (Total → Extract VAT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      {calculationMode === 'forward' ? 'Amount (MUR)' : 'Total Amount Including VAT (MUR)'}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="amount"
                        type="number"
                        placeholder={calculationMode === 'forward' ? 'Enter base amount' : 'Enter total with VAT'}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={calculateVAT}>Calculate</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {calculationMode === 'forward' 
                        ? 'Enter the base amount (excluding VAT)' 
                        : 'Enter the total amount (including VAT)'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vat">VAT Amount (15%)</Label>
                    <Input
                      id="vat"
                      type="text"
                      value={formatCurrency(vatAmount)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total">
                      {calculationMode === 'forward' ? 'Total Amount (Including VAT)' : 'Base Amount (Excluding VAT)'}
                    </Label>
                    <Input
                      id="total"
                      type="text"
                      value={calculationMode === 'forward' ? formatCurrency(totalAmount) : formatCurrency(parseFloat(amount) || 0)}
                      readOnly
                      className="bg-gray-50 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">VAT Calculation Formula</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        {calculationMode === 'forward' ? (
                          <>
                            <div className="flex justify-between py-1">
                              <span>Base Amount:</span>
                              <span className="font-medium">{amount ? formatCurrency(parseFloat(amount)) : '₨ 0.00'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>VAT (15%):</span>
                              <span className="font-medium">{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between py-1">
                              <span>Total (with VAT):</span>
                              <span className="font-medium">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>VAT (15%):</span>
                              <span className="font-medium">{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-bold">
                                <span>Base Amount:</span>
                                <span>{amount ? formatCurrency(parseFloat(amount)) : '₨ 0.00'}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-4">
                        {calculationMode === 'forward' ? (
                          <>
                            <p>Formula: VAT = Amount × 0.15</p>
                            <p>Total = Amount + VAT</p>
                          </>
                        ) : (
                          <>
                            <p>Formula: Base = Total ÷ 1.15</p>
                            <p>VAT = Total - Base</p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Quick VAT Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Amount</TableHead>
                            <TableHead>VAT (15%)</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1000, 5000, 10000, 50000, 100000].map((amt) => (
                            <TableRow key={amt}>
                              <TableCell className="font-medium">{formatCurrency(amt)}</TableCell>
                              <TableCell>{formatCurrency(amt * 0.15)}</TableCell>
                              <TableCell>{formatCurrency(amt * 1.15)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>VAT Records</CardTitle>
                  <CardDescription>
                    Track all VAT transactions with company details and BRN
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add VAT Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Create VAT Record</DialogTitle>
                        <DialogDescription>
                          Add a new VAT transaction record with company details
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="record-description">Description *</Label>
                            <Input
                              id="record-description"
                              value={newRecord.description}
                              onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                              placeholder="e.g., Office Equipment Purchase"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="record-type">Transaction Type *</Label>
                            <Select 
                              value={newRecord.type} 
                              onValueChange={(value: 'input' | 'output') => setNewRecord({...newRecord, type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="input">Input VAT (Purchase/Expense)</SelectItem>
                                <SelectItem value="output">Output VAT (Sales/Income)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="record-company">Company Name *</Label>
                            <Input
                              id="record-company"
                              value={newRecord.company}
                              onChange={(e) => setNewRecord({...newRecord, company: e.target.value})}
                              placeholder="e.g., Tech Solutions Ltd"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="record-brn">Business Registration Number (BRN)</Label>
                            <Input
                              id="record-brn"
                              value={newRecord.brn}
                              onChange={(e) => setNewRecord({...newRecord, brn: e.target.value})}
                              placeholder="e.g., C12345678"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="record-amount">Amount (MUR) *</Label>
                            <Input
                              id="record-amount"
                              type="number"
                              value={newRecord.amount}
                              onChange={(e) => setNewRecord({...newRecord, amount: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                              min="0"
                              step="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="record-department">Department</Label>
                            <Select 
                              value={newRecord.department} 
                              onValueChange={(value) => setNewRecord({...newRecord, department: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="musiquë">musiquë</SelectItem>
                                <SelectItem value="zimazë">zimazë</SelectItem>
                                <SelectItem value="bōucan">bōucan</SelectItem>
                                <SelectItem value="talënt">talënt</SelectItem>
                                <SelectItem value="mōris">mōris</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="record-status">Status</Label>
                          <Select 
                            value={newRecord.status} 
                            onValueChange={(value) => setNewRecord({...newRecord, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Base Amount:</span>
                              <span className="font-medium">{formatCurrency(newRecord.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>VAT (15%):</span>
                              <span className="font-medium">{formatCurrency(newRecord.amount * 0.15)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-1">
                              <span>Total:</span>
                              <span>{formatCurrency(newRecord.amount * 1.15)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRecord}>
                          Create Record
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Company / BRN</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Amount (MUR)</TableHead>
                    <TableHead className="text-right">VAT (15%)</TableHead>
                    <TableHead className="text-right">Total (MUR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.company}</p>
                          <p className="text-xs text-gray-500">{record.brn}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={record.type === 'input' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 'bg-green-100 text-green-800 hover:bg-green-100'}>
                          {record.type === 'input' ? (
                            <><TrendingDown className="h-3 w-3 mr-1 inline" />Input</>
                          ) : (
                            <><TrendingUp className="h-3 w-3 mr-1 inline" />Output</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="border border-gray-300 bg-transparent">{record.department}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(record.amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.vat)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(record.total)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100"
                            onClick={() => toast.info(`Editing record: ${record.description}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600"
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Input VAT (Purchases)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(inputVAT)}</div>
                <p className="text-xs text-muted-foreground">
                  From {vatRecords.filter(r => r.type === 'input').length} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Output VAT (Sales)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(outputVAT)}</div>
                <p className="text-xs text-muted-foreground">
                  From {vatRecords.filter(r => r.type === 'output').length} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net VAT Payable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netVAT >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(Math.abs(netVAT))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {netVAT >= 0 ? 'To be paid to MRA' : 'Refund from MRA'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>VAT Summary by Department</CardTitle>
              <CardDescription>Breakdown of VAT by department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Input VAT</TableHead>
                    <TableHead className="text-right">Output VAT</TableHead>
                    <TableHead className="text-right">Net VAT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['musiquë', 'zimazë', 'bōucan', 'talënt', 'mōris'].map(dept => {
                    const deptInput = vatRecords.filter(r => r.department === dept && r.type === 'input').reduce((sum, r) => sum + r.vat, 0);
                    const deptOutput = vatRecords.filter(r => r.department === dept && r.type === 'output').reduce((sum, r) => sum + r.vat, 0);
                    const deptNet = deptOutput - deptInput;
                    
                    return (
                      <TableRow key={dept}>
                        <TableCell className="font-medium">{dept}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(deptInput)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(deptOutput)}</TableCell>
                        <TableCell className={`text-right font-semibold ${deptNet >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(Math.abs(deptNet))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Next VAT Filing Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20th January 2025</div>
              <p className="text-xs text-muted-foreground">For December 2024 period - 32 days remaining</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VAT Reports</CardTitle>
              <CardDescription>
                Generate and download VAT reports for MRA filing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Monthly VAT Return</h3>
                        <p className="text-sm text-muted-foreground">December 2024</p>
                      </div>
                      <Button className="border-0 bg-transparent hover:bg-gray-100" onClick={() => toast.success('Downloading Monthly VAT Return...')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Input VAT Report</h3>
                        <p className="text-sm text-muted-foreground">Purchases & Expenses</p>
                      </div>
                      <Button className="border-0 bg-transparent hover:bg-gray-100" onClick={() => toast.success('Downloading Input VAT Report...')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Output VAT Report</h3>
                        <p className="text-sm text-muted-foreground">Sales & Income</p>
                      </div>
                      <Button className="border-0 bg-transparent hover:bg-gray-100" onClick={() => toast.success('Downloading Output VAT Report...')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Generate Custom Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" defaultValue="2024-12-01" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" defaultValue="2024-12-31" />
                  </div>
                  <div className="space-y-2">
                    <Label>Report Format</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4 gap-2" onClick={() => toast.success('Generating custom report...')}>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxReturn;