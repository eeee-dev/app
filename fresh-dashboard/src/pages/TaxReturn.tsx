import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, FileText, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { expensesService } from '@/services/expenses';
import { incomeService } from '@/services/income';
import { departmentsService } from '@/services/departments';
import { formatCurrencyMUR } from '@/lib/utils';

interface VATRecord {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  vat: number;
  total: number;
  department: string;
  type: 'input' | 'output';
}

interface DepartmentVAT {
  department: string;
  inputVAT: number;
  outputVAT: number;
  netVAT: number;
}

interface MonthlyVAT {
  month: string;
  inputVAT: number;
  outputVAT: number;
  netVAT: number;
}

const TaxReturn: React.FC = () => {
  // Calculator state
  const [amount, setAmount] = useState<string>('');
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [calculationMode, setCalculationMode] = useState<'forward' | 'reverse'>('forward');
  
  // Data state
  const [vatRecords, setVatRecords] = useState<VATRecord[]>([]);
  const [departmentVAT, setDepartmentVAT] = useState<DepartmentVAT[]>([]);
  const [monthlyVAT, setMonthlyVAT] = useState<MonthlyVAT[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Summary state
  const [totalInputVAT, setTotalInputVAT] = useState(0);
  const [totalOutputVAT, setTotalOutputVAT] = useState(0);
  const [netVATPayable, setNetVATPayable] = useState(0);
  
  // Filter state
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');

  const VAT_RATE = 0.15; // 15% VAT rate for Mauritius

  useEffect(() => {
    fetchVATData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedQuarter]);

  const fetchVATData = async () => {
    try {
      setLoading(true);
      
      const [expenses, income, departments] = await Promise.all([
        expensesService.getAll(),
        incomeService.getAll(),
        departmentsService.getAll()
      ]);

      // Filter by year and quarter
      const filterByPeriod = (date: string) => {
        const itemDate = new Date(date);
        const itemYear = itemDate.getFullYear().toString();
        
        if (itemYear !== selectedYear) return false;
        
        if (selectedQuarter !== 'all') {
          const month = itemDate.getMonth() + 1;
          const quarter = Math.ceil(month / 3);
          return quarter.toString() === selectedQuarter;
        }
        
        return true;
      };

      const filteredExpenses = expenses.filter(exp => filterByPeriod(exp.date));
      const filteredIncome = income.filter(inc => filterByPeriod(inc.date));

      // Create VAT records from expenses (Input VAT)
      // USE THE STORED vat_amount FIELD INSTEAD OF CALCULATING
      const expenseVATRecords: VATRecord[] = filteredExpenses
        .filter(expense => expense.vat_amount > 0) // Only include expenses with VAT
        .map(expense => {
          const dept = departments.find(d => d.id === expense.department_id);
          
          return {
            id: `exp-${expense.id}`,
            date: expense.date,
            description: expense.description,
            category: expense.category || 'General',
            amount: expense.amount,
            vat: expense.vat_amount, // Use stored VAT amount
            total: expense.total_amount,
            department: dept?.name || 'General',
            type: 'input' as const
          };
        });

      // Create VAT records from income (Output VAT)
      // Calculate 15% VAT on income (assuming all income has VAT)
      const incomeVATRecords: VATRecord[] = filteredIncome.map(inc => {
        const dept = departments.find(d => d.id === inc.department_id);
        const vat = inc.amount * VAT_RATE;
        
        return {
          id: `inc-${inc.id}`,
          date: inc.date,
          description: inc.description || inc.client_name || 'Income',
          category: inc.client_name || 'Revenue',
          amount: inc.amount,
          vat: vat,
          total: inc.amount + vat,
          department: dept?.name || 'General',
          type: 'output' as const
        };
      });

      // Combine and sort by date
      const allRecords = [...expenseVATRecords, ...incomeVATRecords].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setVatRecords(allRecords);

      // Calculate totals
      const inputVAT = expenseVATRecords.reduce((sum, r) => sum + r.vat, 0);
      const outputVAT = incomeVATRecords.reduce((sum, r) => sum + r.vat, 0);
      const netVAT = outputVAT - inputVAT;

      setTotalInputVAT(inputVAT);
      setTotalOutputVAT(outputVAT);
      setNetVATPayable(netVAT);

      // Calculate department breakdown
      const deptMap = new Map<string, { input: number; output: number }>();
      
      allRecords.forEach(record => {
        const dept = record.department;
        const existing = deptMap.get(dept) || { input: 0, output: 0 };
        
        if (record.type === 'input') {
          existing.input += record.vat;
        } else {
          existing.output += record.vat;
        }
        
        deptMap.set(dept, existing);
      });

      const deptVAT: DepartmentVAT[] = Array.from(deptMap.entries()).map(([dept, data]) => ({
        department: dept,
        inputVAT: data.input,
        outputVAT: data.output,
        netVAT: data.output - data.input
      })).sort((a, b) => Math.abs(b.netVAT) - Math.abs(a.netVAT));

      setDepartmentVAT(deptVAT);

      // Calculate monthly breakdown (last 6 months or selected period)
      const monthlyMap = new Map<string, { input: number; output: number }>();
      
      allRecords.forEach(record => {
        const date = new Date(record.date);
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        const existing = monthlyMap.get(monthName) || { input: 0, output: 0 };
        
        if (record.type === 'input') {
          existing.input += record.vat;
        } else {
          existing.output += record.vat;
        }
        
        monthlyMap.set(monthName, existing);
      });

      const monthlyData: MonthlyVAT[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        inputVAT: data.input,
        outputVAT: data.output,
        netVAT: data.output - data.input
      })).slice(-6); // Last 6 months

      setMonthlyVAT(monthlyData);

    } catch (error) {
      console.error('Error fetching VAT data:', error);
      toast.error('Failed to load VAT data');
    } finally {
      setLoading(false);
    }
  };

  const calculateVAT = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      if (calculationMode === 'forward') {
        const vat = numAmount * VAT_RATE;
        const total = numAmount + vat;
        setVatAmount(vat);
        setTotalAmount(total);
      } else {
        const baseAmount = numAmount / 1.15;
        const vat = numAmount - baseAmount;
        setVatAmount(vat);
        setTotalAmount(numAmount);
        setAmount(baseAmount.toFixed(2));
      }
    }
  };

  const handleExportReport = (reportType: string) => {
    toast.success(`Generating ${reportType} report...`);
    // In a real implementation, this would generate and download the report
  };

  const getNextFilingDate = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // VAT filing is typically due on the 20th of the following month
    let filingMonth = currentMonth + 1;
    let filingYear = currentYear;
    
    if (filingMonth > 11) {
      filingMonth = 0;
      filingYear += 1;
    }
    
    const filingDate = new Date(filingYear, filingMonth, 20);
    const daysRemaining = Math.ceil((filingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      date: filingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      days: daysRemaining,
      period: now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    };
  };

  const filingInfo = getNextFilingDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground uppercase tracking-wider text-sm">Loading VAT data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider">Mauritius VAT Return</h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">
            Manage VAT calculations and tax records with 15% VAT rate
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

      {/* Period Filter */}
      <Card className="card-minimal">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label className="uppercase tracking-wider text-sm">Period:</Label>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Full Year</SelectItem>
                <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchVATData} variant="outline" className="btn-minimal">
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            VAT Summary
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            VAT Records
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            VAT Calculator
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-minimal">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 uppercase tracking-wider">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Input VAT (Purchases)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrencyMUR(totalInputVAT)}</div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  From {vatRecords.filter(r => r.type === 'input').length} VAT-applicable transactions
                </p>
              </CardContent>
            </Card>

            <Card className="card-minimal">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Output VAT (Sales)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrencyMUR(totalOutputVAT)}</div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  From {vatRecords.filter(r => r.type === 'output').length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="card-minimal">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider">Net VAT Payable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netVATPayable >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrencyMUR(Math.abs(netVATPayable))}
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {netVATPayable >= 0 ? 'To be paid to MRA' : 'Refund from MRA'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card className="card-minimal">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">Monthly VAT Trends</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                VAT breakdown by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyVAT.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No VAT data available for selected period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {monthlyVAT.map((month, index) => {
                    const maxValue = Math.max(...monthlyVAT.map(m => Math.max(m.inputVAT, m.outputVAT)));
                    const inputWidth = maxValue > 0 ? (month.inputVAT / maxValue) * 100 : 0;
                    const outputWidth = maxValue > 0 ? (month.outputVAT / maxValue) * 100 : 0;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium uppercase tracking-wider text-sm">{month.month}</span>
                          <span className={`font-bold ${month.netVAT >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            Net: {formatCurrencyMUR(Math.abs(month.netVAT))}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-16">Input</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500"
                                style={{ width: `${inputWidth}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-24 text-right">{formatCurrencyMUR(month.inputVAT)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-16">Output</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500"
                                style={{ width: `${outputWidth}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-24 text-right">{formatCurrencyMUR(month.outputVAT)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card className="card-minimal">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">VAT Summary by Department</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                Breakdown of VAT by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {departmentVAT.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No department data available</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs">Department</TableHead>
                      <TableHead className="text-right uppercase tracking-wider text-xs">Input VAT</TableHead>
                      <TableHead className="text-right uppercase tracking-wider text-xs">Output VAT</TableHead>
                      <TableHead className="text-right uppercase tracking-wider text-xs">Net VAT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentVAT.map((dept, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium uppercase tracking-wider text-sm">{dept.department}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrencyMUR(dept.inputVAT)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrencyMUR(dept.outputVAT)}</TableCell>
                        <TableCell className={`text-right font-semibold ${dept.netVAT >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrencyMUR(Math.abs(dept.netVAT))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Next Filing Date */}
          <Card className="card-minimal">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider">Next VAT Filing Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filingInfo.date}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                For {filingInfo.period} period - {filingInfo.days} days remaining
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <Card className="card-minimal">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">VAT Transaction Records</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                Only expenses with VAT and all income transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vatRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No VAT records found for selected period</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs">Date</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs">Description</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs">Category</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs">Type</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs">Department</TableHead>
                      <TableHead className="text-right uppercase tracking-wider text-xs">Amount</TableHead>
                      <TableHead className="text-right uppercase tracking-wider text-xs">VAT (15%)</TableHead>
                      <TableHead className="text-right uppercase tracking-wider text-xs">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatRecords.slice(0, 50).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium text-sm">
                          {new Date(record.date).toLocaleDateString('en-GB')}
                        </TableCell>
                        <TableCell className="text-sm">{record.description}</TableCell>
                        <TableCell>
                          <Badge className="border border-gray-300 bg-transparent text-xs">
                            {record.category}
                          </Badge>
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
                          <Badge className="border border-gray-300 bg-transparent text-xs uppercase tracking-wider">
                            {record.department}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrencyMUR(record.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrencyMUR(record.vat)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrencyMUR(record.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {vatRecords.length > 50 && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Showing first 50 of {vatRecords.length} records
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <Card className="card-minimal">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">VAT Calculator</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                Calculate 15% VAT for any amount in MUR (Forward or Reverse calculation)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Label className="uppercase tracking-wider text-sm">Calculation Mode:</Label>
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
                    <Label htmlFor="amount" className="uppercase tracking-wider text-sm">
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
                      <Button onClick={calculateVAT} className="btn-primary-minimal">Calculate</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {calculationMode === 'forward' 
                        ? 'Enter the base amount (excluding VAT)' 
                        : 'Enter the total amount (including VAT)'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vat" className="uppercase tracking-wider text-sm">VAT Amount (15%)</Label>
                    <Input
                      id="vat"
                      type="text"
                      value={formatCurrencyMUR(vatAmount)}
                      readOnly
                      className="bg-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total" className="uppercase tracking-wider text-sm">
                      {calculationMode === 'forward' ? 'Total Amount (Including VAT)' : 'Base Amount (Excluding VAT)'}
                    </Label>
                    <Input
                      id="total"
                      type="text"
                      value={calculationMode === 'forward' ? formatCurrencyMUR(totalAmount) : formatCurrencyMUR(parseFloat(amount) || 0)}
                      readOnly
                      className="bg-secondary font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="card-minimal">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm uppercase tracking-wider">VAT Calculation Formula</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        {calculationMode === 'forward' ? (
                          <>
                            <div className="flex justify-between py-1">
                              <span>Base Amount:</span>
                              <span className="font-medium">{amount ? formatCurrencyMUR(parseFloat(amount)) : formatCurrencyMUR(0)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>VAT (15%):</span>
                              <span className="font-medium">{formatCurrencyMUR(vatAmount)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>{formatCurrencyMUR(totalAmount)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between py-1">
                              <span>Total (with VAT):</span>
                              <span className="font-medium">{formatCurrencyMUR(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>VAT (15%):</span>
                              <span className="font-medium">{formatCurrencyMUR(vatAmount)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-bold">
                                <span>Base Amount:</span>
                                <span>{amount ? formatCurrencyMUR(parseFloat(amount)) : formatCurrencyMUR(0)}</span>
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

                  <Card className="card-minimal">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm uppercase tracking-wider">Quick VAT Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Amount</TableHead>
                            <TableHead className="text-xs">VAT (15%)</TableHead>
                            <TableHead className="text-xs">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1000, 5000, 10000, 50000, 100000].map((amt) => (
                            <TableRow key={amt}>
                              <TableCell className="font-medium text-xs">{formatCurrencyMUR(amt)}</TableCell>
                              <TableCell className="text-xs">{formatCurrencyMUR(amt * 0.15)}</TableCell>
                              <TableCell className="text-xs">{formatCurrencyMUR(amt * 1.15)}</TableCell>
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="card-minimal">
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm">VAT Reports</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider">
                Generate and download VAT reports for MRA filing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-secondary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold uppercase tracking-wider text-sm">Monthly VAT Return</h3>
                        <p className="text-sm text-muted-foreground">{filingInfo.period}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="btn-minimal"
                        onClick={() => handleExportReport('Monthly VAT Return')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-secondary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold uppercase tracking-wider text-sm">Input VAT Report</h3>
                        <p className="text-sm text-muted-foreground">Purchases & Expenses</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="btn-minimal"
                        onClick={() => handleExportReport('Input VAT Report')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-secondary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold uppercase tracking-wider text-sm">Output VAT Report</h3>
                        <p className="text-sm text-muted-foreground">Sales & Income</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="btn-minimal"
                        onClick={() => handleExportReport('Output VAT Report')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 uppercase tracking-wider text-sm">Generate Custom Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs">Start Date</Label>
                    <Input type="date" defaultValue={`${selectedYear}-01-01`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs">End Date</Label>
                    <Input type="date" defaultValue={`${selectedYear}-12-31`} />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase tracking-wider text-xs">Report Format</Label>
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
                <Button 
                  className="mt-4 gap-2 btn-primary-minimal" 
                  onClick={() => handleExportReport('Custom Report')}
                >
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