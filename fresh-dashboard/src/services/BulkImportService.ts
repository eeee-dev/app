import { supabase } from '@/lib/supabase';

export interface ImportRecord {
  id?: string;
  user_id?: string;
  type: 'expense' | 'income' | 'transaction';
  amount: number;
  date: string;
  description: string;
  category: string;
  vendor?: string;
  client?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, unknown>;
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
  records: ImportRecord[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export class BulkImportService {
  static async importExpenses(file: File): Promise<ImportResult> {
    return this.processImportFile(file, 'expense');
  }

  static async importIncome(file: File): Promise<ImportResult> {
    return this.processImportFile(file, 'income');
  }

  static async importTransactions(file: File): Promise<ImportResult> {
    return this.processImportFile(file, 'transaction');
  }

  private static async processImportFile(file: File, type: 'expense' | 'income' | 'transaction'): Promise<ImportResult> {
    try {
      const content = await this.readFileContent(file);
      const records = this.parseFileContent(content, type, file.name);
      const validationResult = this.validateRecords(records);

      if (validationResult.errors.length > 0) {
        return {
          total: records.length,
          success: 0,
          failed: records.length,
          errors: validationResult.errors.map((err) => `Row ${err.row}: ${err.field} - ${err.message}`),
          records,
        };
      }

      // Save to database
      const savedCount = await this.saveRecords(records, type);

      return {
        total: records.length,
        success: savedCount,
        failed: records.length - savedCount,
        errors: [],
        records,
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        total: 0,
        success: 0,
        failed: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        records: [],
      };
    }
  }

  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  private static parseFileContent(content: string, type: string, fileName: string): ImportRecord[] {
    const records: ImportRecord[] = [];
    const lines = content.split('\n').filter((line) => line.trim());

    // Skip header row
    const dataRows = lines.slice(1);

    dataRows.forEach((line, index) => {
      const rowNumber = index + 2; // Account for header row
      const cells = this.parseCSVLine(line);

      if (cells.length >= 4) {
        const record: ImportRecord = {
          type: type as 'expense' | 'income' | 'transaction',
          amount: parseFloat(cells[1]) || 0,
          date: cells[0] || new Date().toISOString().split('T')[0],
          description: cells[2] || '',
          category: cells[3] || 'Uncategorized',
          status: 'pending',
        };

        if (type === 'expense' && cells.length > 4) {
          record.vendor = cells[4];
        }

        if (type === 'income' && cells.length > 4) {
          record.client = cells[4];
        }

        records.push(record);
      }
    });

    return records;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private static validateRecords(records: ImportRecord[]): { errors: ValidationError[]; validRecords: ImportRecord[] } {
    const errors: ValidationError[] = [];
    const validRecords: ImportRecord[] = [];

    records.forEach((record, index) => {
      const rowNumber = index + 1;
      let hasError = false;

      // Validate date
      if (!record.date || isNaN(Date.parse(record.date))) {
        errors.push({
          row: rowNumber,
          field: 'date',
          message: 'Invalid date format',
          value: record.date,
        });
        hasError = true;
      }

      // Validate amount
      if (isNaN(record.amount) || record.amount <= 0) {
        errors.push({
          row: rowNumber,
          field: 'amount',
          message: 'Amount must be a positive number',
          value: record.amount.toString(),
        });
        hasError = true;
      }

      // Validate description
      if (!record.description || record.description.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'description',
          message: 'Description is required',
          value: record.description,
        });
        hasError = true;
      }

      if (!hasError) {
        validRecords.push(record);
      }
    });

    return { errors, validRecords };
  }

  private static async saveRecords(records: ImportRecord[], type: string): Promise<number> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const userId = userData.user.id;
      const recordsWithUser = records.map((record) => ({
        ...record,
        user_id: userId,
      }));

      let tableName = '';
      switch (type) {
        case 'expense':
          tableName = 'app_66e71_expenses';
          break;
        case 'income':
          tableName = 'app_66e71_income';
          break;
        case 'transaction':
          tableName = 'app_66e71_transactions';
          break;
        default:
          throw new Error(`Unknown type: ${type}`);
      }

      const { error } = await supabase.from(tableName).insert(recordsWithUser);

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      return records.length;
    } catch (error) {
      console.error('Save records error:', error);
      throw error;
    }
  }

  static async getImportHistory(): Promise<{ date: string; type: string; count: number; status: string }[]> {
    // Return mock data for now
    return [
      { date: '2024-01-15', type: 'expense', count: 45, status: 'completed' },
      { date: '2024-01-14', type: 'income', count: 23, status: 'completed' },
      { date: '2024-01-13', type: 'transaction', count: 89, status: 'completed' },
      { date: '2024-01-12', type: 'expense', count: 32, status: 'failed' },
    ];
  }

  static async validateFileStructure(file: File, expectedType: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check file extension
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      errors.push(`Invalid file type. Expected: ${validExtensions.join(', ')}, got: ${fileExtension}`);
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(`File too large. Maximum size is 10MB, got: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}