import React from 'react';

interface ImageViewerProps {
  imageDataUrl: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageDataUrl, onClose }) => {
  const isPdf = imageDataUrl.startsWith('data:application/pdf');

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl relative w-full max-w-4xl h-[90vh] flex flex-col border border-slate-600"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the pane
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-200">Invoice Preview</h3>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close image viewer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="flex-grow min-h-0 bg-slate-900 flex items-center justify-center p-2">
          {isPdf ? (
            <iframe src={imageDataUrl} title="Invoice PDF Preview" className="w-full h-full border-0" />
          ) : (
            <img src={imageDataUrl} alt="Invoice Preview" className="max-w-full max-h-full object-contain" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
