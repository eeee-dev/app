import React, { useState } from 'react';
import { Search, Check, X, RefreshCw, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrencyMUR } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  reference: string;
  status: 'unmatched' | 'matched' | 'ignored';
  matchedExpenseId?: string;
  matchedIncomeId?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  status: string;
  invoice_date: string;
  department: string;
}

const TransactionMatcher: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2024-12-01', description: 'Supplier Payment - Audio Equipment Inc.', amount: 50000, type: 'debit', category: 'Equipment', reference: 'TRX-001', status: 'matched', matchedExpenseId: '1' },
    { id: '2', date: '2024-12-02', description: 'Music Streaming Revenue', amount: 150000, type: 'credit', category: 'Royalties', reference: 'TRX-002', status: 'matched', matchedIncomeId: '1' },
    { id: '3', date: '2024-12-03', description: 'Office Rent Payment', amount: 25000, type: 'debit', category: 'Rent', reference: 'TRX-003', status: 'matched', matchedExpenseId: '4' },
    { id: '4', date: '2024-12-04', description: 'Video Production Contract', amount: 80000, type: 'credit', category: 'Services', reference: 'TRX-004', status: 'matched', matchedIncomeId: '2' },
    { id: '5', date: '2024-12-05', description: 'Unknown Transaction - Office Supplies', amount: 12000, type: 'debit', category: 'Uncategorized', reference: 'TRX-005', status: 'unmatched' },
    { id: '6', date: '2024-12-06', description: 'Studio Rental Income', amount: 45000, type: 'credit', category: 'Rental', reference: 'TRX-006', status: 'matched', matchedIncomeId: '3' },
    { id: '7', date: '2024-12-07', description: 'Mystery Payment - Internet Bill', amount: 8500, type: 'debit', category: 'Uncategorized', reference: 'TRX-007', status: 'unmatched' },
    { id: '8', date: '2024-12-08', description: 'Software Subscription', amount: 4500, type: 'debit', category: 'Software', reference: 'TRX-008', status: 'unmatched' },
    { id: '9', date: '2024-12-09', description: 'Marketing Expenses', amount: 18000, type: 'debit', category: 'Marketing', reference: 'TRX-009', status: 'unmatched' },
    { id: '10', date: '2024-12-10', description: 'Travel Reimbursement', amount: 32000, type: 'debit', category: 'Travel', reference: 'TRX-010', status: 'unmatched' },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', description: 'Studio equipment purchase', amount: 50000, status: 'pending', invoice_date: '2024-12-01', department: 'musiquë' },
    { id: '2', description: 'Video editing software license', amount: 12000, status: 'paid', invoice_date: '2024-11-15', department: 'zimazë' },
    { id: '3', description: 'Audio interface upgrade', amount: 8000, status: 'pending', invoice_date: '2024-12-05', department: 'bōucan' },
    { id: '4', description: 'Artist travel expenses', amount: 25000, status: 'overdue', invoice_date: '2024-10-20', department: 'talënt' },
    { id: '5', description: 'Store inventory restock', amount: 30000, status: 'pending', invoice_date: '2024-12-10', department: 'mōris' },
    { id: '6', description: 'Office furniture', amount: 15000, status: 'pending', invoice_date: '2024-12-08', department: 'musiquë' },
    { id: '7', description: 'Marketing campaign', amount: 20000, status: 'pending', invoice_date: '2024-12-09', department: 'zimazë' },
  ]);

  const [incomes, setIncomes] = useState([
    { id: '1', description: 'Music streaming revenue', amount: 150000, date: '2024-12-01', department: 'musiquë' },
    { id: '2', description: 'Video production contract', amount: 80000, date: '2024-11-15', department: 'zimazë' },
    { id: '3', description: 'Studio rental income', amount: 45000, date: '2024-12-05', department: 'bōucan' },
    { id: '4', description: 'Event booking fee', amount: 60000, date: '2024-11-20', department: 'talënt' },
    { id: '5', description: 'Store merchandise sales', amount: 120000, date: '2024-12-10', department: 'mōris' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [autoMatchLoading, setAutoMatchLoading] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'matched':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Matched</Badge>;
      case 'unmatched':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Unmatched</Badge>;
      case 'ignored':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Ignored</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: Transaction['type']) => {
    return (
      <Badge className={type === 'debit' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 'bg-green-100 text-green-800 hover:bg-green-100'}>
        {type === 'debit' ? 'Debit' : 'Credit'}
      </Badge>
    );
  };

  const handleMatchTransaction = (transactionId: string, matchType: 'expense' | 'income', matchId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'matched',
          matchedExpenseId: matchType === 'expense' ? matchId : undefined,
          matchedIncomeId: matchType === 'income' ? matchId : undefined,
          category: matchType === 'expense' ? 'Expense' : 'Income'
        };
      }
      return t;
    }));
    setMatchDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleIgnoreTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return { ...t, status: 'ignored' };
      }
      return t;
    }));
  };

  const handleAutoMatch = () => {
    setAutoMatchLoading(true);
    
    // Simulate auto-matching process
    setTimeout(() => {
      const updatedTransactions = [...transactions];
      let matchedCount = 0;
      
      // Simple auto-matching logic based on amount and date proximity
      updatedTransactions.forEach(transaction => {
        if (transaction.status === 'unmatched') {
          // Try to match with expenses
          const matchingExpense = expenses.find(expense => 
            Math.abs(expense.amount - transaction.amount) < 100 && // Amount within 100 MUR
            Math.abs(new Date(expense.invoice_date).getTime() - new Date(transaction.date).getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
          );
          
          if (matchingExpense) {
            transaction.status = 'matched';
            transaction.matchedExpenseId = matchingExpense.id;
            transaction.category = 'Expense';
            matchedCount++;
            return;
          }
          
          // Try to match with incomes
          const matchingIncome = incomes.find(income =>
            Math.abs(income.amount - transaction.amount) < 100 && // Amount within 100 MUR
            Math.abs(new Date(income.date).getTime() - new Date(transaction.date).getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
          );
          
          if (matchingIncome) {
            transaction.status = 'matched';
            transaction.matchedIncomeId = matchingIncome.id;
            transaction.category = 'Income';
            matchedCount++;
          }
        }
      });
      
      setTransactions(updatedTransactions);
      setAutoMatchLoading(false);
      
      if (matchedCount > 0) {
        alert(`Successfully matched ${matchedCount} transactions automatically!`);
      } else {
        alert('No new matches found. Try manual matching.');
      }
    }, 1500);
  };

  const openMatchDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setMatchDialogOpen(true);
  };

  const unmatchedCount = transactions.filter(t => t.status === 'unmatched').length;
  const matchedCount = transactions.filter(t => t.status === 'matched').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Matching</h2>
          <p className="text-gray-600 mt-1">Match bank transactions with expenses and income records</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2" onClick={handleAutoMatch} disabled={autoMatchLoading}>
            {autoMatchLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Auto Match
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-sm text-gray-500 mt-1">From all bank statements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unmatched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{unmatchedCount}</div>
            <p className="text-sm text-gray-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Matched</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{matchedCount}</div>
            <p className="text-sm text-gray-500 mt-1">Successfully matched</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Match Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.length > 0 ? Math.round((matchedCount / transactions.length) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-500 mt-1">Overall success rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search transactions..." 
                    className="w-full md:w-64 pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="unmatched">Unmatched</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No transactions found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.reference}</p>
                        </div>
                      </TableCell>
                      <TableCell className={`font-medium ${transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.type === 'debit' ? '-' : '+'}{formatCurrencyMUR(transaction.amount)}
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {transaction.status === 'unmatched' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 px-3 text-green-600 hover:text-green-700"
                                onClick={() => openMatchDialog(transaction)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Match
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 px-3 text-gray-600 hover:text-gray-700"
                                onClick={() => handleIgnoreTransaction(transaction.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Ignore
                              </Button>
                            </>
                          )}
                          {transaction.status === 'matched' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 px-3"
                              onClick={() => openMatchDialog(transaction)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Rematch
                            </Button>
                          )}
                          {transaction.status === 'ignored' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 px-3"
                              onClick={() => openMatchDialog(transaction)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Match
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Match Transaction</DialogTitle>
            <DialogDescription>
              Select an expense or income record to match with this transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Description</p>
                    <p className="font-medium">{selectedTransaction.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className={`font-medium ${selectedTransaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedTransaction.type === 'debit' ? '-' : '+'}{formatCurrencyMUR(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium">{selectedTransaction.type === 'debit' ? 'Debit (Expense)' : 'Credit (Income)'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Potential Matches</h4>
                
                {selectedTransaction.type === 'debit' ? (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Expenses</h5>
                    {expenses
                      .filter(expense => Math.abs(expense.amount - selectedTransaction.amount) < 500)
                      .slice(0, 5)
                      .map(expense => (
                        <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{expense.department}</Badge>
                              <span className="text-sm text-gray-500">{new Date(expense.invoice_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <p className="font-medium">{formatCurrencyMUR(expense.amount)}</p>
                            <Button 
                              size="sm"
                              onClick={() => handleMatchTransaction(selectedTransaction.id, 'expense', expense.id)}
                            >
                              Match
                            </Button>
                          </div>
                        </div>
                      ))}
                    
                    {expenses.filter(expense => Math.abs(expense.amount - selectedTransaction.amount) < 500).length === 0 && (
                      <p className="text-gray-500 text-sm">No expenses found with similar amounts</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Income</h5>
                    {incomes
                      .filter(income => Math.abs(income.amount - selectedTransaction.amount) < 500)
                      .slice(0, 5)
                      .map(income => (
                        <div key={income.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="font-medium">{income.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{income.department}</Badge>
                              <span className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <p className="font-medium">{formatCurrencyMUR(income.amount)}</p>
                            <Button 
                              size="sm"
                              onClick={() => handleMatchTransaction(selectedTransaction.id, 'income', income.id)}
                            >
                              Match
                            </Button>
                          </div>
                        </div>
                      ))}
                    
                    {incomes.filter(income => Math.abs(income.amount - selectedTransaction.amount) < 500).length === 0 && (
                      <p className="text-gray-500 text-sm">No income records found with similar amounts</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (selectedTransaction) {
                  handleIgnoreTransaction(selectedTransaction.id);
                  setMatchDialogOpen(false);
                }
              }}
            >
              Ignore Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionMatcher;