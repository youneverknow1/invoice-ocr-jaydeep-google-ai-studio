
import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  onProcess: (files: File[]) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onProcess, isLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  }, []);

  const handleProcessClick = useCallback(() => {
    onProcess(selectedFiles);
    setSelectedFiles([]);
  }, [onProcess, selectedFiles]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }

  return (
    <div className="bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl p-8 text-center">
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, application/pdf"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isLoading}
      />
       <button 
        onClick={triggerFileSelect}
        disabled={isLoading}
        className="mx-auto flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors rounded-lg p-6 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75c0-1.108.892-2 2-2h14c1.108 0 2 .892 2 2v10.5c0 1.108-.892 2-2 2H5c-1.108 0-2-.892-2-2z" />
        </svg>
      </button>

      {selectedFiles.length === 0 ? (
        <p className="text-slate-400">Click icon to select files, or drag and drop to add new invoices.</p>
      ) : (
        <div className="mt-4 text-slate-300">
          <p className="font-semibold">{selectedFiles.length} file(s) selected:</p>
          <ul className="text-sm text-slate-400 mt-2 max-h-24 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleProcessClick}
        disabled={selectedFiles.length === 0 || isLoading}
        className="mt-6 w-full max-w-xs mx-auto bg-primary-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Extract & Add Invoices'}
      </button>
    </div>
  );
};

export default FileUpload;
