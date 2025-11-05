import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { InvoiceData } from './types';
import { processInvoices } from './services/geminiService';
import FileUpload from './components/FileUpload';
import InvoiceCard from './components/InvoiceCard';
import Spinner from './components/Spinner';
import Header from './components/Header';
import Login from './components/Login';
import FilterControls from './components/FilterControls';
import ImageViewer from './components/ImageViewer';
import { convertToCSV, copyToClipboard } from './utils/csvHelper';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [viewingImageDataUrl, setViewingImageDataUrl] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Check for logged-in user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('invoice-ocr-user');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  // Load invoices for the current user
  useEffect(() => {
    if (currentUser) {
      try {
        const storedInvoices = localStorage.getItem(`invoices_${currentUser}`);
        if (storedInvoices) {
          setInvoices(JSON.parse(storedInvoices));
        } else {
          setInvoices([]);
        }
      } catch (e) {
        console.error("Failed to parse invoices from localStorage", e);
        setInvoices([]);
      }
    }
  }, [currentUser]);

  const handleLogin = (username: string) => {
    localStorage.setItem('invoice-ocr-user', username);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('invoice-ocr-user');
    setCurrentUser(null);
    setInvoices([]);
    setError(null);
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0 || !currentUser) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setIsCopied(false);

    try {
      const results = await processInvoices(files);
      setInvoices(prevInvoices => {
        const updatedInvoices = [...prevInvoices, ...results];
        // Note: We don't save the fileDataUrl to localStorage to avoid exceeding size limits
        const storableInvoices = updatedInvoices.map(({ fileDataUrl, ...rest }) => rest);
        localStorage.setItem(`invoices_${currentUser}`, JSON.stringify(storableInvoices));
        return updatedInvoices;
      });
    } catch (err) {
      setError('An error occurred while processing the invoices. Please check the console and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => {
      const lowerSearchTerm = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || [
        invoice.invoiceNumber,
        invoice.supplierNumber,
        invoice.invoiceDate,
        invoice.dueDate,
        invoice.invoiceTotal?.toString(),
        invoice.totalFreight?.toString(),
        ...invoice.lineItems.map(i => i.description),
        ...invoice.lineItems.map(i => i.category),
      ].some(field => field?.toLowerCase().includes(lowerSearchTerm));

      const invoiceDateStr = invoice.invoiceDate;
      const invoiceDate = invoiceDateStr ? new Date(invoiceDateStr.replace(/-/g, '/')) : null;
      if (invoiceDate && isNaN(invoiceDate.getTime())) {
          // If date is invalid, don't filter by it but check search term
          return matchesSearch;
      }
      
      const startDate = dateRange.start ? new Date(dateRange.start.replace(/-/g, '/')) : null;
      const endDate = dateRange.end ? new Date(dateRange.end.replace(/-/g, '/')) : null;
      
      if (endDate && !isNaN(endDate.getTime())) endDate.setHours(23, 59, 59, 999);

      const hasDateFilter = (startDate && !isNaN(startDate.getTime())) || (endDate && !isNaN(endDate.getTime()));

      if (!invoiceDate || !hasDateFilter) {
          return matchesSearch;
      }

      const matchesDate = 
          (
            (!startDate || isNaN(startDate.getTime())) || invoiceDate >= startDate
          ) && (
            (!endDate || isNaN(endDate.getTime())) || invoiceDate <= endDate
          );

      return matchesSearch && matchesDate;
    });
  }, [invoices, searchTerm, dateRange]);


  const handleCopy = useCallback(() => {
    if (filteredInvoices.length === 0) return;
    const csvData = convertToCSV(filteredInvoices);
    copyToClipboard(csvData);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [filteredInvoices]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <FileUpload onProcess={handleFileUpload} isLoading={isLoading} />

          {isLoading && (
            <div className="text-center mt-12">
              <Spinner />
              <p className="mt-4 text-lg text-primary-400">
                Analyzing invoices... This may take a moment.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          <div className="mt-12">
            <FilterControls 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dateRange={dateRange}
              setDateRange={setDateRange}
              resultCount={filteredInvoices.length}
              totalCount={invoices.length}
            />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-200">
                {searchTerm || dateRange.start || dateRange.end ? 'Filtered Results' : 'All Invoices'}
              </h2>
              {filteredInvoices.length > 0 && (
                <button
                  onClick={handleCopy}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                    isCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {isCopied ? 'Copied!' : 'Copy Results as CSV'}
                </button>
              )}
            </div>
            {filteredInvoices.length > 0 ? (
              <div className="space-y-8">
                {filteredInvoices.map((invoice, index) => (
                  <InvoiceCard 
                    key={`${invoice.fileName}-${index}`} 
                    invoice={invoice} 
                    onViewImage={setViewingImageDataUrl}
                  />
                ))}
              </div>
            ) : (
               !isLoading && (
                 <div className="text-center py-12 bg-slate-800/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-300">No Invoices Found</h3>
                    <p className="text-slate-400 mt-2">
                        {invoices.length > 0 ? 'Try adjusting your search or filters.' : 'Upload some invoices to get started!'}
                    </p>
                </div>
               )
            )}
          </div>
        </div>
      </main>
      {viewingImageDataUrl && (
        <ImageViewer 
          imageDataUrl={viewingImageDataUrl}
          onClose={() => setViewingImageDataUrl(null)}
        />
      )}
    </div>
  );
};

export default App;