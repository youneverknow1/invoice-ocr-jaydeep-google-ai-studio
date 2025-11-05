import React from 'react';
import { InvoiceData } from '../types';

interface InvoiceCardProps {
  invoice: InvoiceData;
  onViewImage: (dataUrl: string) => void;
}

const InfoField: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-lg font-semibold text-slate-100">{value ?? 'N/A'}</p>
  </div>
);

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onViewImage }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => invoice.fileDataUrl && onViewImage(invoice.fileDataUrl)}
            disabled={!invoice.fileDataUrl}
            className="text-sm font-medium text-primary-400 hover:text-primary-300 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded break-all text-left disabled:text-slate-500 disabled:no-underline disabled:cursor-default"
          >
            {invoice.fileName}
          </button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-4">
            <InfoField label="Invoice #" value={invoice.invoiceNumber} />
            <InfoField label="Supplier #" value={invoice.supplierNumber} />
            <InfoField label="Invoice Date" value={invoice.invoiceDate} />
            <InfoField label="Due Date" value={invoice.dueDate} />
            <InfoField label="Total Freight" value={invoice.totalFreight?.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} />
            
            <div className="md:col-start-3 lg:col-start-6">
              <p className="text-sm text-slate-400 text-right">Invoice Total</p>
              <div className="flex justify-end items-center gap-2">
                 {invoice.validationError && (
                  <div className="group relative">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-full mb-2 -right-1/2 translate-x-1/2 w-72 p-2 bg-slate-900 border border-slate-600 text-yellow-300 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-left">
                      {invoice.validationError}
                    </div>
                  </div>
                )}
                <p className="text-2xl font-bold text-primary-400 text-right">
                  {invoice.invoiceTotal?.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-3">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="p-3 font-semibold text-slate-300">Description</th>
                  <th className="p-3 font-semibold text-slate-300">Category</th>
                  <th className="p-3 font-semibold text-slate-300 text-right">Qty</th>
                  <th className="p-3 font-semibold text-slate-300 text-right">Unit Price</th>
                  <th className="p-3 font-semibold text-slate-300 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {invoice.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3 text-slate-200">{item.description}</td>
                    <td className="p-3 text-slate-400">{item.category}</td>
                    <td className="p-3 text-slate-200 text-right">{item.quantity}</td>
                    <td className="p-3 text-slate-200 text-right">{item.unitPrice.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td className="p-3 text-slate-200 text-right font-medium">{item.lineTotal.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;