import { InvoiceData } from '../types';

const escapeField = (field: any): string => {
  if (field === null || field === undefined) {
    return '';
  }
  // For TSV (clipboard format), we need to handle tabs and newlines within the field data.
  // Replacing them with a space is a safe bet for clipboard pasting.
  const stringField = String(field);
  return stringField.replace(/[\t\n\r]/g, ' ');
};

// This function now generates a TSV (Tab-Separated Values) string, which is what
// spreadsheet applications like Google Sheets expect when pasting from the clipboard.
export const convertToCSV = (invoices: InvoiceData[]): string => {
  const headers = [
    'FileName', 'InvoiceNumber', 'SupplierNumber', 'InvoiceDate', 'DueDate', 'InvoiceTotal', 'TotalFreight',
    'LineDescription', 'LineCategory', 'LineQuantity', 'LineUnitPrice', 'LineTotal'
  ];

  const rows = invoices.flatMap(invoice => {
    if (!invoice.lineItems || invoice.lineItems.length === 0) {
      // Create a row even for invoices with no line items
      return [[
        escapeField(invoice.fileName),
        escapeField(invoice.invoiceNumber),
        escapeField(invoice.supplierNumber),
        escapeField(invoice.invoiceDate),
        escapeField(invoice.dueDate),
        escapeField(invoice.invoiceTotal),
        escapeField(invoice.totalFreight),
        '', '', '', '', ''
      ].join('\t')];
    }
    return invoice.lineItems.map(item => [
      escapeField(invoice.fileName),
      escapeField(invoice.invoiceNumber),
      escapeField(invoice.supplierNumber),
      escapeField(invoice.invoiceDate),
      escapeField(invoice.dueDate),
      escapeField(invoice.invoiceTotal),
      escapeField(invoice.totalFreight),
      escapeField(item.description),
      escapeField(item.category),
      escapeField(item.quantity),
      escapeField(item.unitPrice),
      escapeField(item.lineTotal)
    ].join('\t'));
  });

  return [headers.join('\t'), ...rows].join('\n');
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy text to clipboard', err);
  });
};