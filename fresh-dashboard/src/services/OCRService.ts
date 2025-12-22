import { supabase } from '@/lib/supabase';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  vendorName: string;
  items: InvoiceItem[];
  taxAmount?: number;
  subtotal?: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OCRResult {
  success: boolean;
  data?: InvoiceData;
  error?: string;
  confidence: number;
  rawText: string;
}

export class OCRService {
  static async processInvoice(imageFile: File): Promise<OCRResult> {
    try {
      // For now, simulate OCR processing since we don't have Tesseract in browser
      // In a real implementation, you would use Tesseract.js or send to a backend service
      const mockResult = await this.simulateOCRProcessing(imageFile);
      
      if (mockResult.success && mockResult.data) {
        // Save to database
        await this.saveInvoiceData(mockResult.data);
      }
      
      return mockResult;
    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
        confidence: 0,
        rawText: '',
      };
    }
  }

  private static async simulateOCRProcessing(file: File): Promise<OCRResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock invoice data based on filename
    const fileName = file.name.toLowerCase();
    
    // Extract invoice number from filename if possible
    let invoiceNumber = 'INV-' + Date.now().toString().slice(-6);
    const invoiceMatch = fileName.match(/(inv|invoice)[-_]?(\d+)/i);
    if (invoiceMatch && invoiceMatch[2]) {
      invoiceNumber = 'INV-' + invoiceMatch[2];
    }

    // Extract vendor name hints from filename
    let vendorName = 'Unknown Vendor';
    if (fileName.includes('amazon')) vendorName = 'Amazon Inc.';
    else if (fileName.includes('google')) vendorName = 'Google LLC';
    else if (fileName.includes('microsoft')) vendorName = 'Microsoft Corporation';
    else if (fileName.includes('apple')) vendorName = 'Apple Inc.';
    else if (fileName.includes('office')) vendorName = 'Office Supplies Co.';

    // Generate random but realistic invoice data
    const subtotal = Math.floor(Math.random() * 5000) + 100;
    const taxAmount = subtotal * 0.15; // 15% VAT
    const totalAmount = subtotal + taxAmount;

    const items: InvoiceItem[] = [
      {
        description: 'Software License',
        quantity: 1,
        unitPrice: Math.floor(subtotal * 0.6),
        total: Math.floor(subtotal * 0.6),
      },
      {
        description: 'Technical Support',
        quantity: 1,
        unitPrice: Math.floor(subtotal * 0.4),
        total: Math.floor(subtotal * 0.4),
      },
    ];

    const invoiceData: InvoiceData = {
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      totalAmount,
      vendorName,
      items,
      taxAmount,
      subtotal,
    };

    return {
      success: true,
      data: invoiceData,
      confidence: 0.85 + Math.random() * 0.15, // 85-100% confidence
      rawText: `Invoice ${invoiceNumber}\nDate: ${invoiceData.date}\nVendor: ${vendorName}\nTotal: ${totalAmount.toFixed(2)} MUR`,
    };
  }

  private static async saveInvoiceData(invoiceData: InvoiceData): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const invoiceRecord = {
        user_id: userData.user.id,
        invoice_number: invoiceData.invoiceNumber,
        date: invoiceData.date,
        total_amount: invoiceData.totalAmount,
        vendor_name: invoiceData.vendorName,
        tax_amount: invoiceData.taxAmount || 0,
        subtotal: invoiceData.subtotal || invoiceData.totalAmount,
        status: 'pending',
        metadata: {
          items: invoiceData.items,
          ocr_processed: true,
          processed_at: new Date().toISOString(),
        },
      };

      const { error } = await supabase
        .from('app_66e71_invoices')
        .insert(invoiceRecord);

      if (error) {
        console.error('Failed to save invoice:', error);
        throw error;
      }
    } catch (error) {
      console.error('Save invoice error:', error);
      throw error;
    }
  }

  static async validateInvoiceData(data: InvoiceData): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!data.invoiceNumber || data.invoiceNumber.trim().length === 0) {
      errors.push('Invoice number is required');
    }

    if (!data.date || isNaN(Date.parse(data.date))) {
      errors.push('Invalid date format');
    }

    if (isNaN(data.totalAmount) || data.totalAmount <= 0) {
      errors.push('Total amount must be a positive number');
    }

    if (!data.vendorName || data.vendorName.trim().length === 0) {
      errors.push('Vendor name is required');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('At least one invoice item is required');
    } else {
      data.items.forEach((item, index) => {
        if (!item.description || item.description.trim().length === 0) {
          errors.push(`Item ${index + 1}: Description is required`);
        }
        if (isNaN(item.quantity) || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be a positive number`);
        }
        if (isNaN(item.unitPrice) || item.unitPrice <= 0) {
          errors.push(`Item ${index + 1}: Unit price must be a positive number`);
        }
        if (isNaN(item.total) || item.total <= 0) {
          errors.push(`Item ${index + 1}: Total must be a positive number`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static async getInvoiceHistory(): Promise<InvoiceData[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('app_66e71_invoices')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to fetch invoice history:', error);
        return [];
      }

      return (data || []).map((record) => ({
        invoiceNumber: record.invoice_number,
        date: record.date,
        totalAmount: record.total_amount,
        vendorName: record.vendor_name,
        items: record.metadata?.items || [],
        taxAmount: record.tax_amount,
        subtotal: record.subtotal,
      }));
    } catch (error) {
      console.error('Get invoice history error:', error);
      return [];
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MUR',
      minimumFractionDigits: 2,
    }).format(amount);
  }
}