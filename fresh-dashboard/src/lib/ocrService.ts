import Tesseract from 'tesseract.js';

export interface OCRResult {
  clientName?: string;
  address?: string;
  email?: string;
  phone?: string;
  brn?: string;
  amount?: number;
  date?: string;
  invoiceNumber?: string;
  description?: string;
}

class OCRService {
  async extractTextFromImage(file: File): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m)
      });
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  parseInvoiceData(text: string): OCRResult {
    const result: OCRResult = {};

    // Extract email (pattern: xxx@xxx.xxx)
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      result.email = emailMatch[0];
    }

    // Extract phone numbers (various formats)
    const phonePatterns = [
      /\+?\d{3}[\s-]?\d{3}[\s-]?\d{4}/,  // +230 123 4567 or 230-123-4567
      /\(\d{3}\)\s?\d{3}[\s-]?\d{4}/,    // (230) 123-4567
      /\d{3}[\s-]?\d{4}/                  // 123-4567
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = text.match(pattern);
      if (phoneMatch) {
        result.phone = phoneMatch[0];
        break;
      }
    }

    // Extract BRN (Business Registration Number - typically format: C12345678 or similar)
    const brnMatch = text.match(/\b[A-Z]\d{8}\b|\bBRN[:\s]*([A-Z0-9]+)\b/i);
    if (brnMatch) {
      result.brn = brnMatch[0];
    }

    // Extract amounts (currency patterns)
    const amountPatterns = [
      /(?:MUR|Rs|₨)\s*[\d,]+\.?\d*/i,
      /[\d,]+\.?\d*\s*(?:MUR|Rs|₨)/i,
      /\$\s*[\d,]+\.?\d*/,
      /[\d,]+\.?\d*\s*\$/
    ];

    for (const pattern of amountPatterns) {
      const amountMatch = text.match(pattern);
      if (amountMatch) {
        const numericValue = amountMatch[0].replace(/[^\d.]/g, '');
        result.amount = parseFloat(numericValue);
        break;
      }
    }

    // Extract dates (various formats)
    const datePatterns = [
      /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/,
      /\d{4}[/-]\d{1,2}[/-]\d{1,2}/,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i
    ];

    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern);
      if (dateMatch) {
        result.date = dateMatch[0];
        break;
      }
    }

    // Extract invoice number (patterns like INV-123, Invoice #123, etc.)
    const invoicePatterns = [
      /(?:Invoice|INV)[#:\s-]*([A-Z0-9-]+)/i,
      /\b[A-Z]{2,4}[-]?\d{3,}\b/
    ];

    for (const pattern of invoicePatterns) {
      const invoiceMatch = text.match(pattern);
      if (invoiceMatch) {
        result.invoiceNumber = invoiceMatch[0];
        break;
      }
    }

    // Extract company/client name (usually at the top, before address)
    // This is more heuristic - look for lines with capitalized words
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const companyNameCandidates = lines.slice(0, 5).filter(line => {
      // Look for lines with mostly capital letters or proper case
      const words = line.trim().split(/\s+/);
      const capitalizedWords = words.filter(word => 
        word.length > 0 && word[0] === word[0].toUpperCase()
      );
      return capitalizedWords.length >= 2 && line.length < 100;
    });

    if (companyNameCandidates.length > 0) {
      result.clientName = companyNameCandidates[0].trim();
    }

    // Extract address (look for street numbers, postal codes, etc.)
    const addressPattern = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Boulevard|Blvd|Drive|Dr)[,\s]+[A-Za-z\s]+/i;
    const addressMatch = text.match(addressPattern);
    if (addressMatch) {
      result.address = addressMatch[0];
    }

    // Extract description (look for "Description:", "Details:", etc.)
    const descriptionPattern = /(?:Description|Details|Particulars)[:\s]+([^\n]+)/i;
    const descriptionMatch = text.match(descriptionPattern);
    if (descriptionMatch) {
      result.description = descriptionMatch[1].trim();
    }

    return result;
  }

  async processInvoice(file: File): Promise<OCRResult> {
    const text = await this.extractTextFromImage(file);
    return this.parseInvoiceData(text);
  }

  async processBulkInvoices(files: File[]): Promise<OCRResult[]> {
    const results: OCRResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.processInvoice(file);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        results.push({});
      }
    }
    
    return results;
  }
}

export const ocrService = new OCRService();