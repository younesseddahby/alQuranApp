import React, { useState, useEffect, useCallback } from 'react';
import type { HadithItem, HadithApiResponse } from '../types';
import Spinner from './Spinner';

// Static list of available Hadith collections from the api.sunnah.com API.
const availableCollections = [
  { name: 'bukhari', title: 'Sahih al-Bukhari' },
  { name: 'muslim', title: 'Sahih Muslim' },
  { name: 'nasai', title: 'Sunan an-Nasa\'i' },
  { name: 'abudawud', title: 'Sunan Abi Dawud' },
  { name: 'tirmidhi', title: 'Jami` at-Tirmidhi' },
  { name: 'ibnmajah', title: 'Sunan Ibn Majah' },
];

interface HadithViewerProps {
  themeColor: string;
}

const HadithViewer: React.FC<HadithViewerProps> = ({ themeColor }) => {
  const [selectedCollection, setSelectedCollection] = useState<string>('bukhari');
  const [hadiths, setHadiths] = useState<HadithItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingHadiths, setLoadingHadiths] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  const fetchHadiths = useCallback(async (collection: string, page: number) => {
    try {
      setLoadingHadiths(true);
      setError(null);
      setHadiths([]);
      
      const response = await fetch(`https://api.sunnah.com/v1/collections/${collection}/hadiths?limit=${ITEMS_PER_PAGE}&page=${page}`);
      if (!response.ok) throw new Error(`Failed to fetch Hadiths for ${collection}. The API might be temporarily unavailable.`);
      
      const data: HadithApiResponse = await response.json();
      
      setHadiths(data.hadiths || []);
      setTotalPages(data.last_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setHadiths([]);
    } finally {
      setLoadingHadiths(false);
    }
  }, []);

  // Effect to fetch data when the collection or page changes (server-side pagination)
  useEffect(() => {
    fetchHadiths(selectedCollection, currentPage);
    window.scrollTo(0,0); // Scroll to top on data change
  }, [selectedCollection, currentPage, fetchHadiths]);


  const handleCollectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCollection(event.target.value);
    setCurrentPage(1); // Reset to the first page for the new collection
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  }

  const renderPagination = () => (
    <div className="flex justify-between items-center mt-6">
        <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1 || loadingHadiths}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
        </span>
        <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || loadingHadiths}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
            Next
        </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className={`text-3xl font-bold text-${themeColor}-700 dark:text-${themeColor}-400 font-amiri`}>Read Hadith</h2>
      
      {error && <p className="text-red-500 dark:text-red-400 text-center p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">{error}</p>}

      <div>
        <label htmlFor="collection-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select a Collection
        </label>
        <select
          id="collection-select"
          value={selectedCollection}
          onChange={handleCollectionChange}
          disabled={loadingHadiths}
          className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-${themeColor}-500 focus:border-${themeColor}-500 sm:text-sm rounded-md`}
        >
          {availableCollections.map((collection) => (
            <option key={collection.name} value={collection.name}>
              {collection.title}
            </option>
          ))}
        </select>
      </div>

      {loadingHadiths ? (
        <Spinner text="Loading Hadiths..." themeColor={themeColor}/>
      ) : hadiths.length > 0 ? (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            {renderPagination()}
            <div className="space-y-6 mt-6">
                {hadiths.map((hadith) => {
                    return (
                        <div key={hadith.urn} className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border-l-4 border-${themeColor}-500`}>
                            <p className={`font-semibold text-${themeColor}-700 dark:text-${themeColor}-400 mb-2`}>
                                {hadith.book.name && `Book ${hadith.book.id}, `}
                                Hadith {hadith.hadithNumber}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {hadith.english.text.replace(/<[^>]*>?/gm, '')}
                            </p>
                        </div>
                    );
                })}
            </div>
            {renderPagination()}
        </div>
      ) : !error && (
        <p className="text-center text-gray-500 mt-6">No Hadiths found for this selection.</p>
      )}
    </div>
  );
};

export default HadithViewer;