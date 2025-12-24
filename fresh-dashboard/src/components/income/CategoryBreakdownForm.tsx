import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IncomeCategory } from '@/lib/incomeCategoryTypes';
import { formatCurrencyMUR } from '@/lib/utils';

export interface BreakdownItem {
  category_id: string;
  amount: number;
  notes?: string;
}

interface CategoryBreakdownFormProps {
  totalAmount: number;
  categories: IncomeCategory[];
  breakdowns: BreakdownItem[];
  onChange: (breakdowns: BreakdownItem[]) => void;
  disabled?: boolean;
}

export const CategoryBreakdownForm: React.FC<CategoryBreakdownFormProps> = ({
  totalAmount,
  categories,
  breakdowns,
  onChange,
  disabled = false
}) => {
  const [localBreakdowns, setLocalBreakdowns] = useState<BreakdownItem[]>(breakdowns);

  useEffect(() => {
    setLocalBreakdowns(breakdowns);
  }, [breakdowns]);

  const addBreakdown = () => {
    const newBreakdown: BreakdownItem = {
      category_id: '',
      amount: 0,
      notes: ''
    };
    const updated = [...localBreakdowns, newBreakdown];
    setLocalBreakdowns(updated);
    onChange(updated);
  };

  const removeBreakdown = (index: number) => {
    const updated = localBreakdowns.filter((_, i) => i !== index);
    setLocalBreakdowns(updated);
    onChange(updated);
  };

  const updateBreakdown = (index: number, field: keyof BreakdownItem, value: string | number) => {
    const updated = localBreakdowns.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setLocalBreakdowns(updated);
    onChange(updated);
  };

  const allocatedAmount = localBreakdowns.reduce((sum, b) => sum + (b.amount || 0), 0);
  const remainingAmount = totalAmount - allocatedAmount;
  const isOverAllocated = allocatedAmount > totalAmount;
  const isFullyAllocated = Math.abs(remainingAmount) < 0.01;

  const usedCategoryIds = new Set(localBreakdowns.map(b => b.category_id).filter(Boolean));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Category Breakdown</h3>
          <p className="text-sm text-gray-500">
            Break down this income into multiple categories (optional)
          </p>
        </div>
        <Button
          type="button"
          onClick={addBreakdown}
          disabled={disabled || categories.length === 0}
          className="gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No income categories available. Please create categories first in the Categories tab.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card className={isOverAllocated ? 'border-red-300 bg-red-50' : isFullyAllocated ? 'border-green-300 bg-green-50' : ''}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrencyMUR(totalAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Allocated</p>
              <p className={`text-xl font-bold ${isOverAllocated ? 'text-red-600' : 'text-blue-600'}`}>
                {formatCurrencyMUR(allocatedAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-xl font-bold ${isOverAllocated ? 'text-red-600' : remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrencyMUR(remainingAmount)}
              </p>
            </div>
          </div>
          {isOverAllocated && (
            <Alert className="mt-4 border-red-300 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Total breakdown amount exceeds the income amount by {formatCurrencyMUR(Math.abs(remainingAmount))}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Items */}
      {localBreakdowns.length > 0 && (
        <div className="space-y-3">
          {localBreakdowns.map((breakdown, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <Label>Category *</Label>
                    <Select
                      value={breakdown.category_id}
                      onValueChange={(value) => updateBreakdown(index, 'category_id', value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem 
                            key={cat.id} 
                            value={cat.id}
                            disabled={usedCategoryIds.has(cat.id) && cat.id !== breakdown.category_id}
                          >
                            {cat.name}
                            {cat.description && (
                              <span className="text-xs text-gray-500 ml-2">
                                - {cat.description}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-3">
                    <Label>Amount (MUR) *</Label>
                    <Input
                      type="number"
                      value={breakdown.amount || ''}
                      onChange={(e) => updateBreakdown(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={disabled}
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <Label>Notes</Label>
                    <Input
                      value={breakdown.notes || ''}
                      onChange={(e) => updateBreakdown(index, 'notes', e.target.value)}
                      placeholder="Optional notes"
                      disabled={disabled}
                    />
                  </div>
                  
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeBreakdown(index)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {localBreakdowns.length === 0 && categories.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No category breakdowns added yet.</p>
          <p className="text-sm mt-1">Click "Add Category" to break down this income.</p>
        </div>
      )}
    </div>
  );
};