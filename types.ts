export interface InvoiceLineItem {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceData {
  invoiceNumber?: string;
  supplierNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  invoiceTotal?: number;
  totalFreight?: number;
  lineItems: InvoiceLineItem[];
  fileName: string;
  validationError?: string;
  fileDataUrl?: string;
}