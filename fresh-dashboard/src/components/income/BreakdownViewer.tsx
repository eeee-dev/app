import React from 'react';
import { Building, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IncomeBreakdownWithCategory } from '@/lib/incomeCategoryTypes';
import { Department } from '@/services/departments';
import { formatCurrencyMUR } from '@/lib/utils';

interface BreakdownViewerProps {
  breakdowns: IncomeBreakdownWithCategory[];
  departments: Department[];
  totalAmount: number;
}

export const BreakdownViewer: React.FC<BreakdownViewerProps> = ({
  breakdowns,
  departments,
  totalAmount
}) => {
  if (!breakdowns || breakdowns.length === 0) {
    return null;
  }

  const allocatedAmount = breakdowns.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0);
  const unallocatedAmount = totalAmount - allocatedAmount;

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return null;
    const dept = departments.find(d => d.id === deptId);
    return dept?.name;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {breakdowns.map((breakdown) => (
            <div key={breakdown.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{breakdown.categories?.name || 'Unknown Category'}</span>
                </div>
                {breakdown.categories?.description && (
                  <p className="text-sm text-gray-600 ml-6">{breakdown.categories.description}</p>
                )}
                {breakdown.categories?.department_id && (
                  <div className="flex items-center gap-2 ml-6 mt-1">
                    <Building className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {getDepartmentName(breakdown.categories.department_id)}
                    </span>
                  </div>
                )}
                {breakdown.notes && (
                  <p className="text-sm text-gray-500 ml-6 mt-1 italic">{breakdown.notes}</p>
                )}
              </div>
              <div className="text-right ml-4">
                <div className="font-semibold text-lg">{formatCurrencyMUR(parseFloat(breakdown.amount.toString()))}</div>
                <div className="text-xs text-gray-500">
                  {((parseFloat(breakdown.amount.toString()) / totalAmount) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Total Allocated:</span>
              <span className="font-semibold">{formatCurrencyMUR(allocatedAmount)}</span>
            </div>
            {unallocatedAmount > 0.01 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unallocated:</span>
                <span className="font-semibold text-orange-600">{formatCurrencyMUR(unallocatedAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
              <span className="font-medium">Total Income:</span>
              <span className="font-bold text-lg">{formatCurrencyMUR(totalAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};