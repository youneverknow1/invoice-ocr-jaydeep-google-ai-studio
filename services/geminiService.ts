import { GoogleGenAI, Type } from '@google/genai';
import { InvoiceData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    invoiceNumber: { type: Type.STRING, description: 'The unique invoice identifier.' },
    supplierNumber: { type: Type.STRING, description: 'The supplier or vendor number.' },
    invoiceDate: { type: Type.STRING, description: 'The date the invoice was issued (YYYY-MM-DD).' },
    dueDate: { type: Type.STRING, description: 'The date the payment is due (YYYY-MM-DD).' },
    invoiceTotal: { type: Type.NUMBER, description: 'The final total amount of the invoice.' },
    totalFreight: { type: Type.NUMBER, description: 'The sum of all line items identified as freight or shipping costs.' },
    lineItems: {
      type: Type.ARRAY,
      description: 'A list of all items or services being billed. Any line items identified as freight or shipping should be excluded from this list.',
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: 'The name or description of the line item.' },
          category: { type: Type.STRING, description: 'A derived category for the item (e.g., "Software", "Office Supplies", "Freight").' },
          quantity: { type: Type.NUMBER, description: 'The quantity of the item.' },
          unitPrice: { type: Type.NUMBER, description: 'The price per unit of the item.' },
          lineTotal: { type: Type.NUMBER, description: 'The total price for the line item (quantity * unit price).' },
        },
        required: ['description', 'category', 'quantity', 'unitPrice', 'lineTotal']
      }
    }
  },
   required: ['invoiceNumber', 'invoiceDate', 'invoiceTotal', 'lineItems']
};

const processFile = async (file: File): Promise<InvoiceData> => {
    const imagePartPromise = fileToGenerativePart(file);
    const dataUrlPromise = fileToDataUrl(file);

    const [imagePart, fileDataUrl] = await Promise.all([imagePartPromise, dataUrlPromise]);
    
    const prompt = `
      Analyze the provided invoice document. Perform OCR and extract the following information:
      - Invoice Number
      - Supplier Number
      - Invoice Date
      - Due Date
      - Invoice Total amount
      - All line items.

      For each line item, extract:
      - Description
      - Quantity
      - Unit Price
      - Total line item amount

      Based on the line item description, derive a relevant business category (e.g., 'Office Supplies', 'Software License', 'Consulting Services', 'Hardware').
      
      IMPORTANT: Identify all line items related to 'freight', 'shipping', or 'delivery'. Sum the 'lineTotal' for these specific items and provide the result in the top-level field 'totalFreight'. These freight-related lines should then be EXCLUDED from the main 'lineItems' array. If no freight charges are found, set 'totalFreight' to 0.

      Return the extracted data in the specified JSON format. Ensure all monetary values are numbers.
      If a top-level field like 'Supplier Number' or 'Due Date' is not found, you can omit it.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: invoiceSchema,
      },
    });

    const parsedData = JSON.parse(response.text);
    const validatedData: InvoiceData = { ...parsedData, fileName: file.name, fileDataUrl };

    // Validation Step
    if (validatedData.invoiceTotal && validatedData.lineItems) {
      const lineItemsSum = validatedData.lineItems.reduce((acc, item) => acc + (item.lineTotal || 0), 0);
      const calculatedTotal = lineItemsSum + (validatedData.totalFreight || 0);
      const discrepancy = Math.abs(validatedData.invoiceTotal - calculatedTotal);

      // Allow for a small discrepancy (e.g., 1 cent) due to potential floating point rounding
      if (discrepancy > 0.01) {
        const formattedTotal = validatedData.invoiceTotal.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
        const formattedCalculated = calculatedTotal.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
        const formattedDiscrepancy = discrepancy.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
        validatedData.validationError = `Warning: Invoice total of ${formattedTotal} does not match the sum of line items plus freight (${formattedCalculated}). Discrepancy is ${formattedDiscrepancy}.`;
      }
    }

    return validatedData;
  };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processInvoices = async (files: File[]): Promise<InvoiceData[]> => {
  const results: InvoiceData[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Process files one by one to avoid hitting API rate limits
    const result = await processFile(file);
    results.push(result);
    
    // Add a delay between API calls to further respect rate limits,
    // but don't wait after processing the last file.
    if (i < files.length - 1) {
      await delay(1000); // 1-second delay
    }
  }
  return results;
};