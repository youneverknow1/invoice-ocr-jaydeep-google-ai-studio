
import React from 'react';

interface FilterControlsProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    dateRange: { start: string; end: string };
    setDateRange: (range: { start: string; end: string }) => void;
    resultCount: number;
    totalCount: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    resultCount,
    totalCount
}) => {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, part: 'start' | 'end') => {
        setDateRange({ ...dateRange, [part]: e.target.value });
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-1">Search</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by keyword, number, amount..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md bg-slate-900 border-slate-600 focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-slate-100 py-2 px-3"
                    />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-slate-400 mb-1">Invoice Date From</label>
                        <input
                            type="date"
                            id="start-date"
                            value={dateRange.start}
                            onChange={(e) => handleDateChange(e, 'start')}
                            className="block w-full rounded-md bg-slate-900 border-slate-600 focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-slate-100 py-2 px-3"
                        />
                    </div>
                     <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-slate-400 mb-1">Invoice Date To</label>
                        <input
                            type="date"
                            id="end-date"
                            value={dateRange.end}
                            onChange={(e) => handleDateChange(e, 'end')}
                            className="block w-full rounded-md bg-slate-900 border-slate-600 focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-slate-100 py-2 px-3"
                        />
                    </div>
                </div>
            </div>
             <div className="text-right mt-3 text-sm text-slate-400">
                Showing <span className="font-bold text-slate-200">{resultCount}</span> of <span className="font-bold text-slate-200">{totalCount}</span> invoices.
            </div>
        </div>
    );
};

export default FilterControls;
