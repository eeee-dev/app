import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkDeleteToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
}

export const BulkDeleteToolbar: React.FC<BulkDeleteToolbarProps> = ({
  selectedCount,
  onDelete,
  onCancel
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-6 py-4 flex items-center gap-4">
        <Badge variant="secondary" className="text-base px-3 py-1">
          {selectedCount} selected
        </Badge>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedCount} {selectedCount === 1 ? 'item' : 'items'}
          </Button>
        </div>
      </div>
    </div>
  );
};